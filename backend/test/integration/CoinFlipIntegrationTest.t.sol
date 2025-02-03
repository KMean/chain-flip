// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test, console2} from "lib/forge-std/src/Test.sol";
import {DeployCoinFlip} from "script/DeployCoinFlip.s.sol";
import {CoinFlip} from "src/CoinFlip.sol";
import {HelperConfig, CodeConstants} from "script/HelperConfig.s.sol";
import {Vm} from "lib/forge-std/src/Vm.sol";
import {VRFCoordinatorV2_5Mock} from "@chainlink/contracts/src/v0.8/vrf/mocks/VRFCoordinatorV2_5Mock.sol";

contract CoinFlipIntegrationTest is CodeConstants, Test {
    CoinFlip public coinflip;
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
    event MatchCanceled(uint256 indexed matchId, address indexed player1);
    event MatchEnded(uint256 indexed matchId, address winner, uint256 prize, uint256 endTime);
    event MatchResult(uint256 indexed matchId, address winner, uint256 outcome);
    event RefundIssued(address indexed player, uint256 amount);
    event RefundIssuedFailed(address indexed player, uint256 amount);

    /*//////////////////////////////////////////////////////////////
                               MODIFIERS
    //////////////////////////////////////////////////////////////*/
    modifier createMatch() {
        vm.prank(PLAYER1);
        coinflip.createMatch{value: minimumBetAmount}(true);
        _;
    }

    modifier createAndJoinMatch() {
        vm.prank(PLAYER1);
        coinflip.createMatch{value: minimumBetAmount}(true);
        vm.prank(PLAYER2);
        coinflip.joinMatch{value: minimumBetAmount}(1);
        _;
    }

    /*//////////////////////////////////////////////////////////////
                                SETUP
    //////////////////////////////////////////////////////////////*/

    function setUp() public {
        DeployCoinFlip deployer = new DeployCoinFlip();
        (coinflip, helperConfig) = deployer.deployContract();
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
        coinflip.createMatch{value: minimumBetAmount}(true);

        // Player2 creates another match
        vm.prank(PLAYER2);
        coinflip.createMatch{value: minimumBetAmount}(false);

        // Player1 joins Player2's match
        vm.prank(PLAYER1);
        coinflip.joinMatch{value: minimumBetAmount}(2);

        // Player3 joins Player1's match
        vm.deal(PLAYER3, STARTING_PLAYER_BALANCE);
        vm.prank(PLAYER3);
        coinflip.joinMatch{value: minimumBetAmount}(1);

        // Ensure matches are correctly updated
        CoinFlip.Match memory match1 = coinflip.getMatch(1);
        CoinFlip.Match memory match2 = coinflip.getMatch(2);
        assertEq(match1.player2, PLAYER3);
        assertEq(match2.player2, PLAYER1);
    }

    function testFulfillRandomWordsPicksAWinnerAndPaysOut() public {
        for (uint256 i = 0; i < 5; i++) {
            // Arrange: Player1 creates a match
            vm.startPrank(PLAYER1);
            coinflip.createMatch{value: minimumBetAmount}(true); // PLAYER1 chooses "heads"
            uint256 matchId = coinflip.getCurrentMatchId(); // Get the new match ID
            vm.stopPrank();

            // Player2 joins the match
            vm.startPrank(PLAYER2);
            coinflip.joinMatch{value: minimumBetAmount}(matchId); // PLAYER2 joins
            vm.stopPrank();

            // Fetch match data after joining
            CoinFlip.Match memory matchData = coinflip.getMatch(matchId);
            uint256 vrfRequestId = matchData.vrfRequestId;

            // Capture balances before payout
            uint256 p1BalanceBefore = PLAYER1.balance;
            uint256 p2BalanceBefore = PLAYER2.balance;
            uint256 contractBalanceBefore = address(coinflip).balance;
            uint256 collectedFeesBefore = coinflip.getCollectedFees(); // Track fees before fulfillment

            // Act
            vm.warp(block.timestamp + (i + 1) * 10); // Simulate different timestamps
            vm.roll(block.number + i + 1); // Change block number to affect randomness

            // Trigger Chainlink VRF callback
            VRFCoordinatorV2_5Mock(vrfCoordinator).fulfillRandomWords(vrfRequestId, address(coinflip));

            // Fetch updated match data
            matchData = coinflip.getMatch(matchId);
            console2.log("Iteration", i);
            console2.log("Match result", matchData.result);
            console2.log("Match vrfRequestId", vrfRequestId);
            // Determine expected winner using contract logic
            address expectedWinner = (matchData.result == matchData.player1Choice) ? PLAYER1 : PLAYER2;
            uint256 expectedWinnerBalanceBefore = (expectedWinner == PLAYER1) ? p1BalanceBefore : p2BalanceBefore;
            console2.log("Winner", expectedWinner);
            // Calculate expected payout with fee deduction
            uint256 totalPool = minimumBetAmount * 2;
            uint256 fee = (totalPool * coinflip.getFeePercent()) / 100;
            uint256 expectedPrize = totalPool - fee; // Winner receives 95% (if feePercent = 5%)

            // Assert Match has ended
            assertEq(uint256(matchData.state), uint256(CoinFlip.MatchState.ENDED));

            // Assert Fee is collected
            assertEq(coinflip.getCollectedFees(), collectedFeesBefore + fee);

            // Check if transfer was successful or went to unclaimedPrizes
            uint256 expectedWinnerBalanceAfter = expectedWinnerBalanceBefore + expectedPrize;
            if (expectedWinner.balance == expectedWinnerBalanceAfter) {
                console2.log("Transfer succeeded: Winner received prize");
            } else {
                // If transfer failed, check unclaimedPrizes
                uint256 unclaimedPrize = coinflip.unclaimedPrizes(expectedWinner);
                assertEq(unclaimedPrize, expectedPrize);
                console2.log("Transfer failed: Prize stored in unclaimedPrizes");
            }
            // contract balance should decrease by the prize amount
            assertEq(address(coinflip).balance, contractBalanceBefore - expectedPrize);
        }
    }

    function testFullFlowWithAutomation() public createAndJoinMatch {
        // Simulate time passing to make the match "stuck"
        vm.warp(block.timestamp + 61 minutes);

        // Check upkeep and perform it
        (bool upkeepNeeded, bytes memory performData) = coinflip.checkUpkeep("");
        assertTrue(upkeepNeeded);

        vm.prank(address(this));
        coinflip.performUpkeep(performData);

        // Verify that the match is canceled and refunds are issued
        CoinFlip.Match memory matchData = coinflip.getMatch(1);
        assertEq(uint256(matchData.state), uint256(CoinFlip.MatchState.CANCELED));
        assertEq(coinflip.getRefunds(PLAYER1), minimumBetAmount);
        assertEq(coinflip.getRefunds(PLAYER2), minimumBetAmount);
    }
}
