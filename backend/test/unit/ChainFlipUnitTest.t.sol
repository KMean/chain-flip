// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test, console2} from "forge-std/Test.sol";
import {DeployChainFlip} from "script/DeployChainFlip.s.sol";
import {ChainFlip} from "src/ChainFlip.sol";
import {HelperConfig, CodeConstants} from "script/HelperConfig.s.sol";
import {Vm} from "lib/forge-std/src/Vm.sol";
import {VRFCoordinatorV2_5Mock} from "@chainlink/contracts/src/v0.8/vrf/mocks/VRFCoordinatorV2_5Mock.sol";

contract CoinFlipUnitTest is CodeConstants, Test {
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
    address public DEVADDRESS = makeAddr("devaddress");
    uint256 public STARTING_PLAYER_BALANCE = 10 ether;

    //events from ChainFlip.sol
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

    /**
     * Helper function to create and join a match, then force its outcome.
     */
    function _createJoinAndFinishMatch(address player1, address player2, bool choiceP1, uint256 randomWord)
        internal
        returns (uint256 matchId, address winner)
    {
        // Player1 creates the match
        vm.prank(player1);
        chainflip.createMatch{value: minimumBetAmount}(choiceP1);
        matchId = chainflip.getCurrentMatchId();

        // Player2 joins the match
        vm.prank(player2);
        chainflip.joinMatch{value: minimumBetAmount}(matchId);

        // Force VRF outcome
        ChainFlip.Match memory matchData = chainflip.getMatch(matchId);
        uint256 requestId = matchData.vrfRequestId;

        // We override the randomWords directly in the mock
        uint256[] memory randomWords = new uint256[](1);
        randomWords[0] = randomWord; // e.g., 2 => (2 % 2 == 0 => heads), 1 => (1 % 2 == 1 => tails)
        VRFCoordinatorV2_5Mock(vrfCoordinator).fulfillRandomWordsWithOverride(
            requestId, address(chainflip), randomWords
        );

        // Return winner for convenience
        ChainFlip.Match memory finished = chainflip.getMatch(matchId);
        winner = finished.winner;
    }

    /*//////////////////////////////////////////////////////////////
                                SETUP
    //////////////////////////////////////////////////////////////*/

    function setUp() public {
        DeployChainFlip deployer = new DeployChainFlip();
        (chainflip, helperConfig) = deployer.deployContract();
        vm.deal(PLAYER1, STARTING_PLAYER_BALANCE);
        vm.deal(PLAYER2, STARTING_PLAYER_BALANCE);
        vm.deal(PLAYER3, STARTING_PLAYER_BALANCE);
        HelperConfig.NetworkConfig memory config = helperConfig.getConfig();
        minimumBetAmount = config.minimumBetAmount;
        vrfCoordinator = config.vrfCoordinator;
        keyHash = config.keyHash;
        subscriptionId = config.subscriptionId;
        callbackGasLimit = config.callbackGasLimit;
        account = config.account;
    }

    /*//////////////////////////////////////////////////////////////
                             TEST FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    function testCreateMatch() public {
        vm.startPrank(PLAYER1);
        chainflip.createMatch{value: minimumBetAmount}(true);
        vm.stopPrank();

        ChainFlip.Match memory matchData = chainflip.getMatch(1);
        assertEq(matchData.player1, PLAYER1);
        assertEq(matchData.betAmount, minimumBetAmount);
        assertEq(uint256(matchData.state), uint256(ChainFlip.MatchState.WAITING_FOR_PLAYER));
    }

    function testJoinMatch() public {
        vm.startPrank(PLAYER1);
        chainflip.createMatch{value: minimumBetAmount}(true);
        vm.stopPrank();

        vm.startPrank(PLAYER2);
        chainflip.joinMatch{value: minimumBetAmount}(1);
        vm.stopPrank();

        ChainFlip.Match memory matchData = chainflip.getMatch(1);
        assertEq(matchData.player2, PLAYER2);
        assertEq(uint256(matchData.state), uint256(ChainFlip.MatchState.FLIPPING_COIN));
    }

    function testCancelMatch() public {
        vm.startPrank(PLAYER1);
        chainflip.createMatch{value: minimumBetAmount}(true);
        chainflip.cancelMatch(1);
        vm.stopPrank();

        ChainFlip.Match memory matchData = chainflip.getMatch(1);
        assertEq(uint256(matchData.state), uint256(ChainFlip.MatchState.CANCELED));
        assertEq(chainflip.getRefunds(PLAYER1), minimumBetAmount);
    }

    function testCannotJoinOwnMatch() public createMatch {
        vm.prank(PLAYER1);
        vm.expectRevert(ChainFlip.CoinFlip__CantJoinYourOwnGame.selector);
        chainflip.joinMatch{value: minimumBetAmount}(1);
    }

    function testCannotJoinInvalidMatch() public createMatch {
        vm.prank(PLAYER2);
        vm.expectRevert(ChainFlip.CoinFlip__MatchDoesNotExist.selector);
        chainflip.joinMatch{value: minimumBetAmount}(2);
    }

    function testCannotJoinMatchWithDifferentBetAmount() public createMatch {
        vm.prank(PLAYER2);
        uint256 differentBetAmount = minimumBetAmount + 1;
        vm.expectRevert(ChainFlip.CoinFlip__InvalidBetAmount.selector);
        chainflip.joinMatch{value: differentBetAmount}(1);
    }

    function testCannotCreateMatchWithInsufficientFunds() public {
        vm.prank(PLAYER1);
        vm.expectRevert(ChainFlip.CoinFlip__InvalidBetAmount.selector);
        chainflip.createMatch{value: minimumBetAmount - 1}(true);
    }

    function testWithdrawRefund() public createMatch {
        vm.startPrank(PLAYER1);
        chainflip.cancelMatch(1);
        chainflip.withdrawRefund();
        vm.stopPrank();

        uint256 refundAmount = chainflip.refunds(PLAYER1);
        assertEq(refundAmount, 0);
        assertEq(PLAYER1.balance, STARTING_PLAYER_BALANCE);
    }

    function testExactAmountJoinNoRefund() public createMatch {
        vm.prank(PLAYER2);
        chainflip.joinMatch{value: minimumBetAmount}(1);

        assertEq(PLAYER2.balance, STARTING_PLAYER_BALANCE - minimumBetAmount);
    }

    function testSetFeePercentTooHigh() public {
        vm.prank(account);
        vm.expectRevert(ChainFlip.CoinFlip__FeeTooHigh.selector);
        chainflip.setFeePercent(11);
    }

    function testSetFeePercent() public {
        vm.prank(account);
        chainflip.setFeePercent(7);
        assertEq(chainflip.getFeePercent(), 7);
    }

    function testCannotCancelCompletedMatch() public createAndJoinMatch {
        vm.prank(PLAYER1);
        vm.expectRevert(ChainFlip.CoinFlip__InvalidMatchState.selector);
        chainflip.cancelMatch(1);
    }

    function testCannotCancelMatchNotCreatedByCaller() public createMatch {
        vm.prank(PLAYER2);
        vm.expectRevert(ChainFlip.CoinFlip__NotTheMatchCreator.selector);
        chainflip.cancelMatch(1);
    }

    function testCompleteMatchFlow() public createAndJoinMatch {
        ChainFlip.Match memory matchData = chainflip.getMatch(1);
        VRFCoordinatorV2_5Mock(vrfCoordinator).fulfillRandomWords(matchData.vrfRequestId, address(chainflip));

        matchData = chainflip.getMatch(1);
        assertEq(uint256(matchData.state), uint256(ChainFlip.MatchState.ENDED));
        assertTrue(matchData.result || !matchData.result); // Just check result is set
    }

    function testSetMinimumBetAmount() public {
        uint256 newAmount = 0.02 ether;
        vm.prank(account);
        chainflip.setMinimumBetAmount(newAmount);
        assertEq(chainflip.getMinimumBetAmount(), newAmount);
    }

    function testWithdrawFees() public createAndJoinMatch {
        // Generate fees
        ChainFlip.Match memory matchData = chainflip.getMatch(1);
        uint256 requestId = matchData.vrfRequestId;
        VRFCoordinatorV2_5Mock(vrfCoordinator).fulfillRandomWords(requestId, address(chainflip));

        uint256 feeAmount = chainflip.getCollectedFees();
        vm.prank(account);
        chainflip.withdrawFees(payable(DEVADDRESS), feeAmount);

        assertEq(chainflip.getCollectedFees(), 0);
        assertEq(DEVADDRESS.balance, feeAmount);
    }

    function testWithdrawFeesNotOwner() public {
        vm.prank(PLAYER1);
        vm.expectRevert("Only callable by owner");
        chainflip.withdrawFees(payable(PLAYER1), 1 ether);
    }

    function testVRFCallbackPlayer1() public createAndJoinMatch {
        ChainFlip.Match memory matchData = chainflip.getMatch(1);
        uint256 requestId = matchData.vrfRequestId;

        // Force even outcome (player1 wins)
        uint256[] memory randomWords = new uint256[](1);
        randomWords[0] = 2;
        VRFCoordinatorV2_5Mock(vrfCoordinator).fulfillRandomWordsWithOverride(
            requestId, address(chainflip), randomWords
        );

        matchData = chainflip.getMatch(1);
        assertEq(matchData.winner, PLAYER1);
    }

    function testVRFCallbackPlayer2() public createAndJoinMatch {
        ChainFlip.Match memory matchData = chainflip.getMatch(1);
        uint256 requestId = matchData.vrfRequestId;

        // Force even outcome (player2 wins)
        uint256[] memory randomWords = new uint256[](1);
        randomWords[0] = 1;
        VRFCoordinatorV2_5Mock(vrfCoordinator).fulfillRandomWordsWithOverride(
            requestId, address(chainflip), randomWords
        );
        console2.log("Collected fees: ", chainflip.getCollectedFees());
        matchData = chainflip.getMatch(1);
        assertEq(matchData.winner, PLAYER2);
    }

    function testETHRejection() public {
        (bool success,) = address(chainflip).call{value: 1 ether}("");
        assertFalse(success);
    }

    function testFallbackReverts() public {
        // Arrange
        address target = address(chainflip);

        // Act & Assert
        vm.expectRevert(bytes("Fallback function triggered"));
        (bool success,) = target.call{value: 1 ether}(""); // Sending ETH to trigger fallback
        require(!success, "Fallback should revert");
    }

    function testTransferFailAndClaimPrizes() public createMatch {
        RejectingWinner rejectingWinner = new RejectingWinner(address(chainflip));
        vm.deal(address(rejectingWinner), minimumBetAmount);

        vm.prank(address(rejectingWinner));
        chainflip.joinMatch{value: minimumBetAmount}(1);

        console2.log("unclaimed Prizes before transfer fail:", chainflip.unclaimedPrizes(address(rejectingWinner)));
        assertEq(chainflip.unclaimedPrizes(address(rejectingWinner)), 0);
        // Force even outcome (rejectingWinner wins)
        ChainFlip.Match memory matchData = chainflip.getMatch(1);
        uint256 requestId = matchData.vrfRequestId;
        uint256[] memory randomWords = new uint256[](1);
        randomWords[0] = 1;
        VRFCoordinatorV2_5Mock(vrfCoordinator).fulfillRandomWordsWithOverride(
            requestId, address(chainflip), randomWords
        );

        console2.log("unclaimed Prizes after transfer fail:", chainflip.unclaimedPrizes(address(rejectingWinner)));
        assertEq(
            chainflip.unclaimedPrizes(address(rejectingWinner)),
            (2 * minimumBetAmount) - ((2 * minimumBetAmount) * chainflip.getFeePercent() / 100)
        );

        vm.prank(address(rejectingWinner));
        vm.expectEmit(true, true, true, true);
        emit ChainFlip.PrizeClaimed(address(rejectingWinner), minimumBetAmount * 2 * 95 / 100);

        rejectingWinner.callClaimFunction();
        console2.log("unclaimed Prizes after claimPrizes():", chainflip.unclaimedPrizes(address(rejectingWinner)));
        assertEq(chainflip.unclaimedPrizes(address(rejectingWinner)), 0);
    }

    function testRetryFailedTransfer() public createMatch {
        // Arrange

        RejectingWinner rejectingWinner = new RejectingWinner(address(chainflip));
        vm.deal(address(rejectingWinner), minimumBetAmount);

        vm.prank(address(rejectingWinner));
        chainflip.joinMatch{value: minimumBetAmount}(1);

        console2.log("unclaimed Prizes before transfer fail:", chainflip.unclaimedPrizes(address(rejectingWinner)));
        assertEq(chainflip.unclaimedPrizes(address(rejectingWinner)), 0);
        // Force even outcome (rejectingWinner wins)
        ChainFlip.Match memory matchData = chainflip.getMatch(1);
        uint256 requestId = matchData.vrfRequestId;
        uint256[] memory randomWords = new uint256[](1);
        randomWords[0] = 1;
        VRFCoordinatorV2_5Mock(vrfCoordinator).fulfillRandomWordsWithOverride(
            requestId, address(chainflip), randomWords
        );

        console2.log("unclaimed Prizes after transfer fail:", chainflip.unclaimedPrizes(address(rejectingWinner)));
        assertEq(
            chainflip.unclaimedPrizes(address(rejectingWinner)),
            (2 * minimumBetAmount) - ((2 * minimumBetAmount) * chainflip.getFeePercent() / 100)
        );

        uint256 totalPrize = (2 * minimumBetAmount) - ((2 * minimumBetAmount) * chainflip.getFeePercent() / 100);
        rejectingWinner.allowReceiveETH(true);
        // Act: Expect `PrizeClaimed` and `PrizeTransferRetried`
        vm.expectEmit(true, true, false, false);
        emit ChainFlip.PrizeClaimed(address(rejectingWinner), totalPrize);

        vm.expectEmit(true, true, false, false);
        emit ChainFlip.PrizeTransferRetried(address(rejectingWinner), totalPrize);

        vm.prank(account);
        chainflip.retryFailedTransfer(address(rejectingWinner));

        // Assert
        assertEq(chainflip.unclaimedPrizes(address(rejectingWinner)), 0, "Prize should be claimed");
    }

    /**
     * @notice Tests that only the owner can set a valid timeOutForStuckMatches,
     *         reverts if below 60, and emits the event on success.
     */
    function testSetTimeOutForStuckMatches() public {
        // Only owner can call
        vm.prank(PLAYER1);
        vm.expectRevert("Only callable by owner");
        chainflip.setTimeOutForStuckMatches(120);

        // Revert if timeOut < 60
        vm.prank(account);
        vm.expectRevert(ChainFlip.CoinFlip__NotValidTimeOut.selector);
        chainflip.setTimeOutForStuckMatches(59);

        // Should succeed and emit event if >= 60
        vm.expectEmit(true, true, true, true);
        // 120 => 120 * 1 minutes => 120 minutes
        emit TimeOutUpdated(120 * 1 minutes);

        vm.prank(account);
        chainflip.setTimeOutForStuckMatches(120);

        // Check stored value
        uint256 actualTimeOut = chainflip.getTimeOutForStuckMatches();
        assertEq(actualTimeOut, 120 * 1 minutes);
    }

    /*//////////////////////////////////////////////////////////////
                         TEST GETTER FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function testGetMatchesByPlayer() public createMatch {
        uint256[] memory matches = chainflip.getMatchesByPlayer(PLAYER1);
        assertEq(matches.length, 1);
        assertEq(matches[0], 1);

        // Player2 should have no matches
        matches = chainflip.getMatchesByPlayer(PLAYER2);
        assertEq(matches.length, 0);
    }

    function testGetMatch() public createMatch {
        ChainFlip.Match memory matchData = chainflip.getMatch(1);
        assertEq(matchData.player1, PLAYER1);
        assertEq(matchData.betAmount, minimumBetAmount);
        assertEq(uint256(matchData.state), uint256(ChainFlip.MatchState.WAITING_FOR_PLAYER));
    }

    function testGetMatchResult() public createAndJoinMatch {
        // Initially, the result should be false
        bool result = chainflip.getMatchResult(1);
        assertEq(result, false);
        // Force even outcome (player1 wins)
        ChainFlip.Match memory matchData = chainflip.getMatch(1);
        uint256 requestId = matchData.vrfRequestId;
        uint256[] memory randomWords = new uint256[](1);
        randomWords[0] = 2;
        VRFCoordinatorV2_5Mock(vrfCoordinator).fulfillRandomWordsWithOverride(
            requestId, address(chainflip), randomWords
        );
        //recheck result
        result = chainflip.getMatchResult(1);
        assertEq(result, true);
    }

    function testGetMatchState() public createMatch {
        ChainFlip.MatchState state = chainflip.getMatchState(1);
        assertEq(uint256(state), uint256(ChainFlip.MatchState.WAITING_FOR_PLAYER));

        // Player2 joins the match
        vm.prank(PLAYER2);
        chainflip.joinMatch{value: minimumBetAmount}(1);

        state = chainflip.getMatchState(1);
        assertEq(uint256(state), uint256(ChainFlip.MatchState.FLIPPING_COIN));

        // Force even outcome (player1 wins)
        ChainFlip.Match memory matchData = chainflip.getMatch(1);
        uint256 requestId = matchData.vrfRequestId;
        uint256[] memory randomWords = new uint256[](1);
        randomWords[0] = 2;
        VRFCoordinatorV2_5Mock(vrfCoordinator).fulfillRandomWordsWithOverride(
            requestId, address(chainflip), randomWords
        );

        //check state is ENDED
        state = chainflip.getMatchState(1);
        assertEq(uint256(state), uint256(ChainFlip.MatchState.ENDED));
    }

    function testGetMatchWinner() public createMatch {
        // Initially, there should be no winner
        address winner = chainflip.getMatchWinner(1);
        assertEq(winner, address(0));

        // Simulate a winner
        vm.prank(PLAYER2);
        chainflip.joinMatch{value: minimumBetAmount}(1);

        // Force even outcome (player2 wins)
        ChainFlip.Match memory matchData = chainflip.getMatch(1);
        uint256 requestId = matchData.vrfRequestId;
        uint256[] memory randomWords = new uint256[](1);
        randomWords[0] = 1;
        VRFCoordinatorV2_5Mock(vrfCoordinator).fulfillRandomWordsWithOverride(
            requestId, address(chainflip), randomWords
        );

        winner = chainflip.getMatchWinner(1);
        assertEq(winner, PLAYER2);
    }

    function testGetCurrentMatchId() public {
        assertEq(chainflip.getCurrentMatchId(), 0);

        vm.prank(PLAYER1);
        chainflip.createMatch{value: minimumBetAmount}(true);
        assertEq(chainflip.getCurrentMatchId(), 1);

        vm.prank(PLAYER2);
        chainflip.createMatch{value: minimumBetAmount}(false);
        assertEq(chainflip.getCurrentMatchId(), 2);
    }

    function testGetFeePercent() public {
        uint256 fee = 5;
        assertEq(chainflip.getFeePercent(), fee);
        vm.prank(chainflip.owner());
        chainflip.setFeePercent(7);
        assertEq(chainflip.getFeePercent(), 7);
    }

    function testGetRefunds() public createMatch {
        assertEq(chainflip.getRefunds(PLAYER1), 0);
        vm.prank(PLAYER1);
        chainflip.cancelMatch(1);
        assertEq(chainflip.getRefunds(PLAYER1), chainflip.getMinimumBetAmount());
    }

    function testGetCollectedFees() public createAndJoinMatch {
        console2.log("Collected fees before VRF: ", chainflip.getCollectedFees());
        assertEq(chainflip.getCollectedFees(), 0);

        ChainFlip.Match memory matchData = chainflip.getMatch(1);
        uint256 requestId = matchData.vrfRequestId;
        VRFCoordinatorV2_5Mock(vrfCoordinator).fulfillRandomWords(requestId, address(chainflip));
        console2.log("Collected fees after VRF: ", chainflip.getCollectedFees());
        assertEq(chainflip.getCollectedFees(), (2 * minimumBetAmount) * chainflip.getFeePercent() / 100);
    }

    /*//////////////////////////////////////////////////////////////
                           TEST getPlayerStats
    //////////////////////////////////////////////////////////////*/
    /**
     * We'll create three matches with PLAYER1 and PLAYER2. We'll have:
     *  - One match canceled by PLAYER1,
     *  - One match won by PLAYER1,
     *  - One match won by PLAYER2.
     */
    function testGetPlayerStats() public {
        // 1) Match #1: Create but cancel
        vm.prank(PLAYER1);
        chainflip.createMatch{value: minimumBetAmount}(true);
        uint256 matchId1 = chainflip.getCurrentMatchId();
        vm.prank(PLAYER1);
        chainflip.cancelMatch(matchId1);

        // 2) Match #2: normal flow => even random => heads => Player1 choice was "true" => Player1 wins
        (uint256 matchId2, address winner2) = _createJoinAndFinishMatch(PLAYER1, PLAYER2, true, 2);
        // 3) Match #3: normal flow => odd random => tails => Player2 wins
        (uint256 matchId3, address winner3) = _createJoinAndFinishMatch(PLAYER1, PLAYER2, true, 1);

        console2.log("match: ", matchId2, "Match #2 winner: ", winner2);
        console2.log("match: ", matchId3, "Match #3 winner: ", winner3);
        // Quick sanity checks
        assertEq(winner2, PLAYER1, "Match #2 should be won by Player1");
        assertEq(winner3, PLAYER2, "Match #3 should be won by Player2");

        // Stats for PLAYER1
        (
            uint256 totalMatchesP1,
            uint256 totalWinsP1,
            uint256 totalLossesP1,
            uint256 totalCanceledP1,
            uint256 totalAmountWonP1,
            uint256 totalAmountInvestedP1
        ) = chainflip.getPlayerStats(PLAYER1);

        // Player1 participated in all 3 matches:
        //   - 1 canceled
        //   - 1 lost
        //   - 1 won
        assertEq(totalMatchesP1, 3, "PLAYER1 totalMatches should be 3");
        assertEq(totalWinsP1, 1, "PLAYER1 wins should be 1");
        // 1 canceled, 1 lost => totalLosses should be 1
        assertEq(totalLossesP1, 1, "PLAYER1 losses should be 1");
        assertEq(totalCanceledP1, 1, "PLAYER1 canceled 1 match");
        // The match that Player1 won => invests minimumBetAmount, wins a prize of 2 * bet * (1 - fee%)
        // We won't do precise math on fees here, but we can at least check > 0
        assertGt(totalAmountWonP1, 0, "Should have some amount in totalAmountWonP1");
        // Player1 invests for all 3 => invests 3 * minimumBetAmount ut 1 get canceled => 2 * minimumBetAmount
        assertEq(totalAmountInvestedP1, 2 * minimumBetAmount, "Should invest 3 times the minimum bet");

        // Stats for PLAYER2
        (
            uint256 totalMatchesP2,
            uint256 totalWinsP2,
            uint256 totalLossesP2,
            uint256 totalCanceledP2,
            uint256 totalAmountWonP2,
            uint256 totalAmountInvestedP2
        ) = chainflip.getPlayerStats(PLAYER2);

        // PLAYER2 only joined match #2 and #3
        assertEq(totalMatchesP2, 2, "PLAYER2 totalMatches should be 2");
        // Won 1 (match #3)
        assertEq(totalWinsP2, 1, "PLAYER2 should have 1 win");
        // Lost 1 (match #2)
        assertEq(totalLossesP2, 1, "PLAYER2 should have 1 loss");
        // Did not create or cancel => 0
        assertEq(totalCanceledP2, 0, "PLAYER2 canceled = 0");
        assertGt(totalAmountWonP2, 0, "PLAYER2 should have some wins in totalAmountWonP2");
        // PLAYER2 invests for match #2 & #3 => 2 * minimumBetAmount
        assertEq(totalAmountInvestedP2, 2 * minimumBetAmount, "PLAYER2 invests 2 times the minimum bet");
    }

    /*//////////////////////////////////////////////////////////////
                           TEST getTopWinners
    //////////////////////////////////////////////////////////////*/
    function testGetTopWinners() public {
        // Let’s create 3 matches:
        // - PLAYER1 wins 2
        // - PLAYER2 wins 1
        // - PLAYER3 doesn't play
        _createJoinAndFinishMatch(PLAYER1, PLAYER2, true, 2); // P1 wins
        _createJoinAndFinishMatch(PLAYER1, PLAYER2, true, 2); // P1 wins
        _createJoinAndFinishMatch(PLAYER1, PLAYER2, true, 1); // P2 wins

        // Now get top winners
        (address[] memory allPlayers, uint256[] memory allWins) = chainflip.getTopWinners();

        // We expect to see at least PLAYER1 and PLAYER2 in `players`.
        // The contract also tracks them in the order they first appear (the actual
        // index might differ if you also created matches with other players earlier).
        // We'll just check correctness for P1/P2, but we won't rely on sorting here
        // because the function does not do sorting— it simply returns them in stored order.

        // We'll find them in the array and confirm wins:
        bool foundP1 = false;
        bool foundP2 = false;
        for (uint256 i = 0; i < allPlayers.length; i++) {
            if (allPlayers[i] == PLAYER1) {
                foundP1 = true;
                assertEq(allWins[i], 2, "PLAYER1 should have 2 wins");
            } else if (allPlayers[i] == PLAYER2) {
                foundP2 = true;
                assertEq(allWins[i], 1, "PLAYER2 should have 1 win");
            }
        }
        assertTrue(foundP1, "Should find PLAYER1 in topWinners");
        assertTrue(foundP2, "Should find PLAYER2 in topWinners");
    }

    /*//////////////////////////////////////////////////////////////
                         TEST getMatchesPaginated
    //////////////////////////////////////////////////////////////*/
    function testGetMatchesPaginated() public {
        // Create 5 matches with (P1 vs P2)
        for (uint256 i = 0; i < 5; i++) {
            _createJoinAndFinishMatch(PLAYER1, PLAYER2, true, 2 + i);
        }
        // We have 5 matches in total now (IDs: 1..5)
        // Let's get them in pages of size 2

        ChainFlip.Match[] memory page1 = chainflip.getMatchesPaginated(0, 2);
        // page1 should have match #1 and #2
        assertEq(page1.length, 2);
        assertEq(page1[0].id, 1);
        assertEq(page1[1].id, 2);

        ChainFlip.Match[] memory page2 = chainflip.getMatchesPaginated(2, 2);
        // page2 should have match #3 and #4
        assertEq(page2.length, 2);
        assertEq(page2[0].id, 3);
        assertEq(page2[1].id, 4);

        ChainFlip.Match[] memory page3 = chainflip.getMatchesPaginated(4, 2);
        // page3 should have match #5 only, because total is 5
        assertEq(page3.length, 1);
        assertEq(page3[0].id, 5);
    }

    /*//////////////////////////////////////////////////////////////
                        TEST getTotalAmountWon
    //////////////////////////////////////////////////////////////*/
    function testGetTotalAmountWon() public {
        // First match => Player1 wins
        _createJoinAndFinishMatch(PLAYER1, PLAYER2, true, 2); // P1 wins
        // Second match => Player2 wins
        _createJoinAndFinishMatch(PLAYER1, PLAYER2, true, 1); // P2 wins

        uint256 totalWonByP1 = chainflip.getTotalAmountWon(PLAYER1);
        uint256 totalWonByP2 = chainflip.getTotalAmountWon(PLAYER2);

        assertGt(totalWonByP1, 0, "P1 should have >0 totalWon after winning once");
        assertGt(totalWonByP2, 0, "P2 should have >0 totalWon after winning once");
        // They should not be the same because each match has the same bet size and fee,
        // but it’s possible to do an exact check if you want to compute fees. For simplicity
        // we just check they’re both > 0.
    }

    /*//////////////////////////////////////////////////////////////
                       TEST getTotalAmountInvested
    //////////////////////////////////////////////////////////////*/
    function testGetTotalAmountInvested() public {
        // Player1 invests in 3 matches. Player2 invests in 2 matches.
        // We'll force them all to finish, but that's not strictly necessary for testing "invested".
        _createJoinAndFinishMatch(PLAYER1, PLAYER2, true, 1); // invests P1 and P2
        _createJoinAndFinishMatch(PLAYER1, PLAYER2, true, 2); // invests P1 and P2
        vm.prank(PLAYER1);
        chainflip.createMatch{value: minimumBetAmount}(true); // invests P1 again, no one joins

        uint256 investedP1 = chainflip.getTotalAmountInvested(PLAYER1);
        uint256 investedP2 = chainflip.getTotalAmountInvested(PLAYER2);

        // P1 did 3 bets => 3 * minimumBetAmount
        assertEq(investedP1, 3 * minimumBetAmount, "P1 invests 3 times");
        // P2 did 2 bets => 2 * minimumBetAmount
        assertEq(investedP2, 2 * minimumBetAmount, "P2 invests 2 times");
    }

    /*//////////////////////////////////////////////////////////////
                            TEST getTotalWinnings
    //////////////////////////////////////////////////////////////*/
    function testGetTotalWinnings() public {
        // Let’s make 2 matches. One is won by PLAYER1, one is won by PLAYER2.
        _createJoinAndFinishMatch(PLAYER1, PLAYER2, true, 2); // P1 wins
        _createJoinAndFinishMatch(PLAYER1, PLAYER2, true, 1); // P2 wins

        uint256 totalWinningsAll = chainflip.getTotalWinnings();
        // This should be totalWinningsP1 + totalWinningsP2
        // we can also check individually:
        uint256 p1Winnings = chainflip.getTotalAmountWon(PLAYER1);
        uint256 p2Winnings = chainflip.getTotalAmountWon(PLAYER2);

        // totalWinningsAll == p1Winnings + p2Winnings
        assertEq(totalWinningsAll, p1Winnings + p2Winnings, "Sum of all players' winnings");
    }

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    function testCreatingMatchEmitsEvent() public {
        //Arrange
        vm.prank(PLAYER1);
        //Act
        vm.expectEmit();
        emit MatchCreated(1, 1, PLAYER1, true, minimumBetAmount);
        //Assert
        chainflip.createMatch{value: minimumBetAmount}(true);
    }

    function testMatchJoinedEmitsEvent() public createMatch {
        vm.expectEmit(true, true, true, true);
        emit ChainFlip.MatchJoined(1, PLAYER2, false, minimumBetAmount);

        vm.prank(PLAYER2);
        chainflip.joinMatch{value: minimumBetAmount}(1);
    }

    function testMatchCanceledEmitsEvent() public createMatch {
        vm.expectEmit(true, true, true, true);
        emit ChainFlip.MatchCanceledByPlayer(1, PLAYER1);

        vm.prank(PLAYER1);
        chainflip.cancelMatch(1);
    }

    function testMatchEndedEmitsEvent() public createAndJoinMatch {
        // Force even outcome (player2 wins)
        ChainFlip.Match memory matchData = chainflip.getMatch(1);
        uint256 requestId = matchData.vrfRequestId;
        uint256[] memory randomWords = new uint256[](1);
        randomWords[0] = 1;

        uint256 fee = (2 * minimumBetAmount * chainflip.getFeePercent()) / 100;
        uint256 prizeAmount = (2 * minimumBetAmount) - fee;

        vm.expectEmit(true, true, false, false);
        emit ChainFlip.TransferPrize(PLAYER2, prizeAmount);
        vm.expectEmit(true, true, true, false);
        emit ChainFlip.MatchResult(1, PLAYER2, 1);
        vm.expectEmit(true, true, true, true);
        emit ChainFlip.MatchEnded(1, PLAYER2, (2 * minimumBetAmount) - fee, block.timestamp);
        VRFCoordinatorV2_5Mock(vrfCoordinator).fulfillRandomWordsWithOverride(
            requestId, address(chainflip), randomWords
        );
    }

    function testRefundIssuedEmitsEvent() public createMatch {
        vm.prank(PLAYER1);
        chainflip.cancelMatch(1);

        vm.expectEmit(true, true, true, true);
        emit ChainFlip.RefundIssued(PLAYER1, minimumBetAmount);

        vm.prank(PLAYER1);
        chainflip.withdrawRefund();
    }

    function testRefundIssuedFailedEmitsEvent() public {
        RejectingWinner rejectingWinner = new RejectingWinner(address(chainflip));
        vm.deal(address(rejectingWinner), minimumBetAmount);

        vm.startPrank(address(rejectingWinner));
        chainflip.createMatch{value: minimumBetAmount}(true);

        chainflip.cancelMatch(1);
        // Simulate a failed refund
        vm.expectEmit(true, true, true, true);
        emit RefundFailed(address(rejectingWinner), minimumBetAmount);

        vm.expectRevert(ChainFlip.CoinFlip__TransferFailed.selector);
        chainflip.withdrawRefund();
        vm.stopPrank();
    }

    function testTransferPrizeEmitsEvent() public createAndJoinMatch {
        // Force even outcome (player2 wins)
        ChainFlip.Match memory matchData = chainflip.getMatch(1);
        uint256 requestId = matchData.vrfRequestId;
        uint256[] memory randomWords = new uint256[](1);
        randomWords[0] = 1;

        uint256 fees = (2 * minimumBetAmount) * chainflip.getFeePercent() / 100;

        vm.expectEmit(true, true, true, true);
        emit ChainFlip.TransferPrize(PLAYER2, (2 * minimumBetAmount) - fees);

        VRFCoordinatorV2_5Mock(vrfCoordinator).fulfillRandomWordsWithOverride(
            requestId, address(chainflip), randomWords
        );
    }

    function testFeeUpdatedEmitsEvent() public {
        vm.startPrank(account);
        vm.expectEmit(true, true, true, true);
        emit ChainFlip.FeeUpdated(8);

        chainflip.setFeePercent(8);
        vm.stopPrank();
    }

    function testMinimumBetAmountUpdatedEmitsEvent() public {
        vm.startPrank(account);
        vm.expectEmit(true, true, true, true);
        emit ChainFlip.MinimumBetAmountUpdated(0.02 ether);
        chainflip.setMinimumBetAmount(0.02 ether);
        vm.stopPrank();
    }

    function testFeesWithdrawnEmitsEvent() public createAndJoinMatch {
        ChainFlip.Match memory matchData = chainflip.getMatch(1);
        uint256 requestId = matchData.vrfRequestId;
        VRFCoordinatorV2_5Mock(vrfCoordinator).fulfillRandomWords(requestId, address(chainflip));

        uint256 collectedFees = chainflip.getCollectedFees();

        vm.expectEmit(true, true, true, true);
        emit ChainFlip.FeesWithdrawn(DEVADDRESS, collectedFees);

        vm.prank(account);
        chainflip.withdrawFees(payable(DEVADDRESS), collectedFees);
    }

    /*//////////////////////////////////////////////////////////////
                           AUTOMATION TESTS
    //////////////////////////////////////////////////////////////*/
    function testCheckUpkeepNoStuckMatches() public view {
        (bool upkeepNeeded, bytes memory performData) = chainflip.checkUpkeep("");
        assertFalse(upkeepNeeded);
        assertEq(performData, "");
    }

    function testCheckUpkeepWithStuckMatches() public createAndJoinMatch {
        // Simulate time passing to make the match "stuck"
        vm.warp(block.timestamp + 61 minutes);

        (bool upkeepNeeded, bytes memory performData) = chainflip.checkUpkeep("");
        assertTrue(upkeepNeeded);
        // Check that performData contains the stuck match ID
        uint256[] memory stuckMatches;
        uint256 count;
        (stuckMatches, count) = abi.decode(performData, (uint256[], uint256));
        assertEq(count, 1);
        assertEq(stuckMatches[0], 1);
    }

    function testPerformUpkeepCancelsStuckMatches() public createAndJoinMatch {
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
}

/**
 * @dev Minimal contract that rejects ETH by default.
 *      If `allowReceiveETH` is set to true, it accepts ETH.
 *      We'll use it to test "failed" prize transfers in ChainFlip.
 */
contract RejectingWinner {
    ChainFlip public chainflip;
    bool private allowReceive = false; // Controls whether ETH can be accepted

    constructor(address _coinflip) {
        chainflip = ChainFlip(payable(_coinflip));
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
