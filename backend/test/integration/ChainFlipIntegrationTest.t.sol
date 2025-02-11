// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test, console2} from "lib/forge-std/src/Test.sol";
import {DeployChainFlip} from "script/DeployChainFlip.s.sol";
import {ChainFlip} from "src/ChainFlip.sol";
import {HelperConfig, CodeConstants} from "script/HelperConfig.s.sol";
import {Vm} from "lib/forge-std/src/Vm.sol";
import {VRFCoordinatorV2_5Mock} from "@chainlink/contracts/src/v0.8/vrf/mocks/VRFCoordinatorV2_5Mock.sol";

contract CoinFlipIntegrationTest is CodeConstants, Test {
    ChainFlip public chainflip;
    HelperConfig public helperConfig;
    uint256 minimumBetAmount;
    address vrfCoordinator;
    bytes32 public keyHash;
    uint256 public subscriptionId;
    uint32 public callbackGasLimit;
    address public account;
    address public PLAYER1 = makeAddr("player1");
    address public PLAYER2 = makeAddr("player2");
    address public PLAYER3 = makeAddr("player3");
    uint256 public STARTING_PLAYER_BALANCE = 10 ether;

    event RequestSent(uint256 requestId, uint256 matchId, uint32 numWords);
    event MatchCreated(
        uint256 indexed matchId, uint256 startTime, address indexed player1, bool choice, uint256 betAmount
    );
    event MatchJoined(uint256 indexed matchId, address indexed player2, bool choice, uint256 betAmount);
    event MatchCanceledByPlayer(uint256 indexed matchId, address indexed player1);
    event MatchCanceledByUpkeep(uint256 indexed matchId, uint256 indexed requestId);
    event MatchEnded(uint256 indexed matchId, address winner, uint256 prize, uint256 endTime);
    event MatchResult(uint256 indexed matchId, address winner, uint256 outcome);
    event RefundIssued(address indexed player, uint256 amount);
    event RefundFailed(address indexed player, uint256 amount);
    event TransferPrize(address indexed player, uint256 amount);
    event TransferPrizeFailed(address indexed player, uint256 amount);
    event PrizeClaimed(address indexed player, uint256 amount);
    event MinimumBetAmountUpdated(uint256 newAmount);
    event PrizeTransferRetried(address indexed player, uint256 amount);
    event FeeUpdated(uint256 newFee);
    event FeesWithdrawn(address recipient, uint256 amount);
    event MatchSkipped(uint256 matchId, ChainFlip.MatchState state);
    event TimeOutUpdated(uint256 newTimeOut);

    /*//////////////////////////////////////////////////////////////
                            MODIFIERS & HELPERS
    //////////////////////////////////////////////////////////////*/
    modifier createMatch() {
        vm.prank(PLAYER1);
        chainflip.createMatch{value: minimumBetAmount}(true);
        _;
    }

    modifier createAndJoinMatch() {
        vm.prank(PLAYER1);
        chainflip.createMatch{value: minimumBetAmount}(true);
        vm.prank(PLAYER2);
        chainflip.joinMatch{value: minimumBetAmount}(1);
        _;
    }

    /*//////////////////////////////////////////////////////////////
                                SETUP
    //////////////////////////////////////////////////////////////*/

    function setUp() public {
        DeployChainFlip deployer = new DeployChainFlip();
        (chainflip, helperConfig) = deployer.deployContract();
        vm.deal(PLAYER1, STARTING_PLAYER_BALANCE);
        vm.deal(PLAYER2, STARTING_PLAYER_BALANCE);
        HelperConfig.NetworkConfig memory config = helperConfig.getConfig();
        minimumBetAmount = config.minimumBetAmount;
        vrfCoordinator = config.vrfCoordinator;
        keyHash = config.keyHash;
        subscriptionId = config.subscriptionId;
        callbackGasLimit = config.callbackGasLimit;
        account = config.account;
    }

    /*//////////////////////////////////////////////////////////////
                           INTEGRATION TESTS
    //////////////////////////////////////////////////////////////*/

    function testMultipleMatches() public {
        // Player1 creates a match
        vm.prank(PLAYER1);
        chainflip.createMatch{value: minimumBetAmount}(true);

        // Player2 creates another match
        vm.prank(PLAYER2);
        chainflip.createMatch{value: minimumBetAmount}(false);

        // Player1 joins Player2's match
        vm.prank(PLAYER1);
        chainflip.joinMatch{value: minimumBetAmount}(2);

        // Player3 joins Player1's match
        vm.deal(PLAYER3, STARTING_PLAYER_BALANCE);
        vm.prank(PLAYER3);
        chainflip.joinMatch{value: minimumBetAmount}(1);

        // Ensure matches are correctly updated
        ChainFlip.Match memory match1 = chainflip.getMatch(1);
        ChainFlip.Match memory match2 = chainflip.getMatch(2);
        assertEq(match1.player2, PLAYER3);
        assertEq(match2.player2, PLAYER1);
    }

    function testFulfillRandomWordsPicksAWinnerAndPaysOut() public {
        for (uint256 i = 0; i < 5; i++) {
            // Arrange: Player1 creates a match
            vm.startPrank(PLAYER1);
            chainflip.createMatch{value: minimumBetAmount}(true); // PLAYER1 chooses "heads"
            uint256 matchId = chainflip.getCurrentMatchId(); // Get the new match ID
            vm.stopPrank();

            // Player2 joins the match
            vm.startPrank(PLAYER2);
            chainflip.joinMatch{value: minimumBetAmount}(matchId); // PLAYER2 joins
            vm.stopPrank();

            // Fetch match data after joining
            ChainFlip.Match memory matchData = chainflip.getMatch(matchId);
            uint256 vrfRequestId = matchData.vrfRequestId;

            // Capture balances before payout
            uint256 p1BalanceBefore = PLAYER1.balance;
            uint256 p2BalanceBefore = PLAYER2.balance;
            uint256 contractBalanceBefore = address(chainflip).balance;
            uint256 collectedFeesBefore = chainflip.getCollectedFees(); // Track fees before fulfillment

            // Act
            vm.warp(block.timestamp + (i + 1) * 10); // Simulate different timestamps
            vm.roll(block.number + i + 1); // Change block number to affect randomness

            // Trigger Chainlink VRF callback
            VRFCoordinatorV2_5Mock(vrfCoordinator).fulfillRandomWords(vrfRequestId, address(chainflip));

            // Fetch updated match data
            matchData = chainflip.getMatch(matchId);
            console2.log("Iteration", i);
            console2.log("Match result", matchData.result);
            console2.log("Match vrfRequestId", vrfRequestId);
            // Determine expected winner using contract logic
            address expectedWinner = (matchData.result == matchData.player1Choice) ? PLAYER1 : PLAYER2;
            uint256 expectedWinnerBalanceBefore = (expectedWinner == PLAYER1) ? p1BalanceBefore : p2BalanceBefore;
            console2.log("Winner", expectedWinner);
            // Calculate expected payout with fee deduction
            uint256 totalPool = minimumBetAmount * 2;
            uint256 fee = (totalPool * chainflip.getFeePercent()) / 100;
            uint256 expectedPrize = totalPool - fee; // Winner receives 95% (if feePercent = 5%)

            // Assert Match has ended
            assertEq(uint256(matchData.state), uint256(ChainFlip.MatchState.ENDED));

            // Assert Fee is collected
            assertEq(chainflip.getCollectedFees(), collectedFeesBefore + fee);

            // Check if transfer was successful or went to unclaimedPrizes
            uint256 expectedWinnerBalanceAfter = expectedWinnerBalanceBefore + expectedPrize;
            if (expectedWinner.balance == expectedWinnerBalanceAfter) {
                console2.log("Transfer succeeded: Winner received prize");
            } else {
                // If transfer failed, check unclaimedPrizes
                uint256 unclaimedPrize = chainflip.unclaimedPrizes(expectedWinner);
                assertEq(unclaimedPrize, expectedPrize);
                console2.log("Transfer failed: Prize stored in unclaimedPrizes");
            }
            // contract balance should decrease by the prize amount
            assertEq(address(chainflip).balance, contractBalanceBefore - expectedPrize);
        }
    }

    function testFullFlowWithAutomation() public createAndJoinMatch {
        // Simulate time passing to make the match "stuck"
        vm.warp(block.timestamp + 61 minutes);

        // Check upkeep and perform it
        (bool upkeepNeeded, bytes memory performData) = chainflip.checkUpkeep("");
        assertTrue(upkeepNeeded);

        vm.prank(address(this));
        chainflip.performUpkeep(performData);

        // Verify that the match is canceled and refunds are issued
        ChainFlip.Match memory matchData = chainflip.getMatch(1);
        assertEq(uint256(matchData.state), uint256(ChainFlip.MatchState.CANCELED));
        assertEq(chainflip.getRefunds(PLAYER1), minimumBetAmount);
        assertEq(chainflip.getRefunds(PLAYER2), minimumBetAmount);
    }

    function testClaimPrizeFlow() public {
        RejectingWinner rejectingWinner = new RejectingWinner(address(chainflip));
        vm.deal(address(rejectingWinner), STARTING_PLAYER_BALANCE);

        // 2) Player1 creates the match
        vm.prank(PLAYER1);
        chainflip.createMatch{value: minimumBetAmount}(true); // heads

        // 3) RejectingWinner joins as player2
        vm.prank(address(rejectingWinner));
        chainflip.joinMatch{value: minimumBetAmount}(1);

        // Retrieve the match data to get the requestId for VRF
        ChainFlip.Match memory matchData = chainflip.getMatch(1);
        uint256 requestId = matchData.vrfRequestId;

        // We want the rejectingWinner to be the *actual* winner, so we force an odd outcome (tails)
        // since matchData.player1Choice == true => heads => we want the opposite
        uint256[] memory randomWords = new uint256[](1);
        // Example: if randomWords[0] % 2 == 1 => tails => the second player wins
        randomWords[0] = 1;

        // 4) Fulfill VRF with an override to ensure rejectingWinner wins
        VRFCoordinatorV2_5Mock(vrfCoordinator).fulfillRandomWordsWithOverride(
            requestId, address(chainflip), randomWords
        );

        // 5) Verify the match ended with rejectingWinner as the winner
        matchData = chainflip.getMatch(1);
        assertEq(matchData.winner, address(rejectingWinner), "RejectingWinner should be the winner");
        assertEq(uint256(matchData.state), uint256(ChainFlip.MatchState.ENDED), "Match should be ENDED");

        // 6) Check that prize was NOT transferred (due to the contract refusing ETH)
        // and thus ended up in unclaimedPrizes
        uint256 expectedPrize = (2 * minimumBetAmount) - ((2 * minimumBetAmount) * chainflip.getFeePercent() / 100);
        uint256 unclaimed = chainflip.unclaimedPrizes(address(rejectingWinner));
        assertEq(unclaimed, expectedPrize, "Prize should be in unclaimedPrizes due to failed transfer");

        // 7) Let the RejectingWinner contract accept ETH now and call `claimPrize()`
        //    Because by default it rejects, we have a special function to allow it to receive.
        rejectingWinner.allowReceiveETH(true);

        // 8) Claim the unclaimed prize
        vm.prank(address(rejectingWinner));
        chainflip.claimPrize();

        // 9) Now unclaimedPrizes should be zero, verifying a successful manual claim
        uint256 unclaimedAfter = chainflip.unclaimedPrizes(address(rejectingWinner));
        assertEq(unclaimedAfter, 0, "RejectingWinner should have claimed the prize");
    }
}

/**
 * @dev Minimal contract that rejects ETH by default.
 *      If `allowReceiveETH` is set to true, it accepts ETH.
 *      We'll use it to test "failed" prize transfers in ChainFlip.
 */
contract RejectingWinner {
    ChainFlip public chainflip;
    bool private allowReceive = false; // Controls whether ETH can be accepted

    constructor(address _chainflip) {
        chainflip = ChainFlip(payable(_chainflip));
    }

    // Reject ETH transfers unless explicitly allowed
    receive() external payable {
        if (allowReceive) {
            return;
        }
        require(allowReceive, "ETH transfers not accepted");
    }

    // Function to manually call claimPrize() in ChainFlip
    function callClaimFunction() external {
        allowReceive = true; // Temporarily allow ETH transfers
        chainflip.claimPrize();
        allowReceive = false; // Revert back to rejecting transfers
    }

    function allowReceiveETH(bool choice) external {
        allowReceive = choice;
    }
}
