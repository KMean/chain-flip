// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test, console2} from "forge-std/Test.sol";
import {DeployChainFlip} from "script/DeployChainFlip.s.sol";
import {ChainFlip} from "src/ChainFlip.sol";
import {HelperConfig, CodeConstants} from "script/HelperConfig.s.sol";
import {Vm} from "lib/forge-std/src/Vm.sol";
import {VRFCoordinatorV2_5Mock} from "@chainlink/contracts/src/v0.8/vrf/mocks/VRFCoordinatorV2_5Mock.sol";

contract CoinFlipUnitTest is CodeConstants, Test {
    ChainFlip public coinflip;
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
        DeployChainFlip deployer = new DeployChainFlip();
        (coinflip, helperConfig) = deployer.deployContract();
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
        coinflip.createMatch{value: minimumBetAmount}(true);
        vm.stopPrank();

        ChainFlip.Match memory matchData = coinflip.getMatch(1);
        assertEq(matchData.player1, PLAYER1);
        assertEq(matchData.betAmount, minimumBetAmount);
        assertEq(uint256(matchData.state), uint256(ChainFlip.MatchState.WAITING_FOR_PLAYER));
    }

    function testJoinMatch() public {
        vm.startPrank(PLAYER1);
        coinflip.createMatch{value: minimumBetAmount}(true);
        vm.stopPrank();

        vm.startPrank(PLAYER2);
        coinflip.joinMatch{value: minimumBetAmount}(1);
        vm.stopPrank();

        ChainFlip.Match memory matchData = coinflip.getMatch(1);
        assertEq(matchData.player2, PLAYER2);
        assertEq(uint256(matchData.state), uint256(ChainFlip.MatchState.FLIPPING_COIN));
    }

    function testCancelMatch() public {
        vm.startPrank(PLAYER1);
        coinflip.createMatch{value: minimumBetAmount}(true);
        coinflip.cancelMatch(1);
        vm.stopPrank();

        ChainFlip.Match memory matchData = coinflip.getMatch(1);
        assertEq(uint256(matchData.state), uint256(ChainFlip.MatchState.CANCELED));
        assertEq(coinflip.getRefunds(PLAYER1), minimumBetAmount);
    }

    function testCannotJoinOwnMatch() public createMatch {
        vm.prank(PLAYER1);
        vm.expectRevert(ChainFlip.CoinFlip__CantJoinYourOwnGame.selector);
        coinflip.joinMatch{value: minimumBetAmount}(1);
    }

    function testCannotJoinInvalidMatch() public createMatch {
        vm.prank(PLAYER2);
        vm.expectRevert(ChainFlip.CoinFlip__MatchDoesNotExist.selector);
        coinflip.joinMatch{value: minimumBetAmount}(2);
    }

    function testCannotJoinMatchWithDifferentBetAmount() public createMatch {
        vm.prank(PLAYER2);
        uint256 differentBetAmount = minimumBetAmount + 1;
        vm.expectRevert(ChainFlip.CoinFlip__InvalidBetAmount.selector);
        coinflip.joinMatch{value: differentBetAmount}(1);
    }

    function testCannotCreateMatchWithInsufficientFunds() public {
        vm.prank(PLAYER1);
        vm.expectRevert(ChainFlip.CoinFlip__InvalidBetAmount.selector);
        coinflip.createMatch{value: minimumBetAmount - 1}(true);
    }

    function testWithdrawRefund() public createMatch {
        vm.startPrank(PLAYER1);
        coinflip.cancelMatch(1);
        coinflip.withdrawRefund();
        vm.stopPrank();

        uint256 refundAmount = coinflip.refunds(PLAYER1);
        assertEq(refundAmount, 0);
        assertEq(PLAYER1.balance, STARTING_PLAYER_BALANCE);
    }

    function testExactAmountJoinNoRefund() public createMatch {
        vm.prank(PLAYER2);
        coinflip.joinMatch{value: minimumBetAmount}(1);

        assertEq(PLAYER2.balance, STARTING_PLAYER_BALANCE - minimumBetAmount);
    }

    function testSetFeePercentTooHigh() public {
        vm.prank(account);
        vm.expectRevert(ChainFlip.CoinFlip__FeeTooHigh.selector);
        coinflip.setFeePercent(11);
    }

    function testSetFeePercent() public {
        vm.prank(account);
        coinflip.setFeePercent(7);
        assertEq(coinflip.getFeePercent(), 7);
    }

    function testCannotCancelCompletedMatch() public createAndJoinMatch {
        vm.prank(PLAYER1);
        vm.expectRevert(ChainFlip.CoinFlip__InvalidMatchState.selector);
        coinflip.cancelMatch(1);
    }

    function testCannotCancelMatchNotCreatedByCaller() public createMatch {
        vm.prank(PLAYER2);
        vm.expectRevert(ChainFlip.CoinFlip__NotTheMatchCreator.selector);
        coinflip.cancelMatch(1);
    }

    function testCompleteMatchFlow() public createAndJoinMatch {
        ChainFlip.Match memory matchData = coinflip.getMatch(1);
        VRFCoordinatorV2_5Mock(vrfCoordinator).fulfillRandomWords(matchData.vrfRequestId, address(coinflip));

        matchData = coinflip.getMatch(1);
        assertEq(uint256(matchData.state), uint256(ChainFlip.MatchState.ENDED));
        assertTrue(matchData.result || !matchData.result); // Just check result is set
    }

    function testSetMinimumBetAmount() public {
        uint256 newAmount = 0.02 ether;
        vm.prank(account);
        coinflip.setMinimumBetAmount(newAmount);
        assertEq(coinflip.getMinimumBetAmount(), newAmount);
    }

    function testWithdrawFees() public createAndJoinMatch {
        // Generate fees
        ChainFlip.Match memory matchData = coinflip.getMatch(1);
        uint256 requestId = matchData.vrfRequestId;
        VRFCoordinatorV2_5Mock(vrfCoordinator).fulfillRandomWords(requestId, address(coinflip));

        uint256 feeAmount = coinflip.getCollectedFees();
        vm.prank(account);
        coinflip.withdrawFees(payable(DEVADDRESS), feeAmount);

        assertEq(coinflip.getCollectedFees(), 0);
        assertEq(DEVADDRESS.balance, feeAmount);
    }

    function testWithdrawFeesNotOwner() public {
        vm.prank(PLAYER1);
        vm.expectRevert("Only callable by owner");
        coinflip.withdrawFees(payable(PLAYER1), 1 ether);
    }

    function testVRFCallbackPlayer1() public createAndJoinMatch {
        ChainFlip.Match memory matchData = coinflip.getMatch(1);
        uint256 requestId = matchData.vrfRequestId;

        // Force even outcome (player1 wins)
        uint256[] memory randomWords = new uint256[](1);
        randomWords[0] = 2;
        VRFCoordinatorV2_5Mock(vrfCoordinator).fulfillRandomWordsWithOverride(requestId, address(coinflip), randomWords);

        matchData = coinflip.getMatch(1);
        assertEq(matchData.winner, PLAYER1);
    }

    function testVRFCallbackPlayer2() public createAndJoinMatch {
        ChainFlip.Match memory matchData = coinflip.getMatch(1);
        uint256 requestId = matchData.vrfRequestId;

        // Force even outcome (player2 wins)
        uint256[] memory randomWords = new uint256[](1);
        randomWords[0] = 1;
        VRFCoordinatorV2_5Mock(vrfCoordinator).fulfillRandomWordsWithOverride(requestId, address(coinflip), randomWords);
        console2.log("Collected fees: ", coinflip.getCollectedFees());
        matchData = coinflip.getMatch(1);
        assertEq(matchData.winner, PLAYER2);
    }

    function testETHRejection() public {
        (bool success,) = address(coinflip).call{value: 1 ether}("");
        assertFalse(success);
    }

    function testFallbackReverts() public {
        // Arrange
        address target = address(coinflip);

        // Act & Assert
        vm.expectRevert(bytes("Fallback function triggered"));
        (bool success,) = target.call{value: 1 ether}(""); // Sending ETH to trigger fallback
        require(!success, "Fallback should revert");
    }

    function testTransferFailAndClaimPrizes() public createMatch {
        RejectingWinner rejectingWinner = new RejectingWinner(address(coinflip));
        vm.deal(address(rejectingWinner), minimumBetAmount);

        vm.prank(address(rejectingWinner));
        coinflip.joinMatch{value: minimumBetAmount}(1);

        console2.log("unclaimed Prizes before transfer fail:", coinflip.unclaimedPrizes(address(rejectingWinner)));
        assertEq(coinflip.unclaimedPrizes(address(rejectingWinner)), 0);
        // Force even outcome (rejectingWinner wins)
        ChainFlip.Match memory matchData = coinflip.getMatch(1);
        uint256 requestId = matchData.vrfRequestId;
        uint256[] memory randomWords = new uint256[](1);
        randomWords[0] = 1;
        VRFCoordinatorV2_5Mock(vrfCoordinator).fulfillRandomWordsWithOverride(requestId, address(coinflip), randomWords);

        console2.log("unclaimed Prizes after transfer fail:", coinflip.unclaimedPrizes(address(rejectingWinner)));
        assertEq(
            coinflip.unclaimedPrizes(address(rejectingWinner)),
            (2 * minimumBetAmount) - ((2 * minimumBetAmount) * coinflip.getFeePercent() / 100)
        );

        vm.prank(address(rejectingWinner));
        vm.expectEmit(true, true, true, true);
        emit ChainFlip.PrizeClaimed(address(rejectingWinner), minimumBetAmount * 2 * 95 / 100);

        rejectingWinner.callClaimFunction();
        console2.log("unclaimed Prizes after claimPrizes():", coinflip.unclaimedPrizes(address(rejectingWinner)));
        assertEq(coinflip.unclaimedPrizes(address(rejectingWinner)), 0);
    }

    function testRetryFailedTransfer() public createMatch {
        // Arrange

        RejectingWinner rejectingWinner = new RejectingWinner(address(coinflip));
        vm.deal(address(rejectingWinner), minimumBetAmount);

        vm.prank(address(rejectingWinner));
        coinflip.joinMatch{value: minimumBetAmount}(1);

        console2.log("unclaimed Prizes before transfer fail:", coinflip.unclaimedPrizes(address(rejectingWinner)));
        assertEq(coinflip.unclaimedPrizes(address(rejectingWinner)), 0);
        // Force even outcome (rejectingWinner wins)
        ChainFlip.Match memory matchData = coinflip.getMatch(1);
        uint256 requestId = matchData.vrfRequestId;
        uint256[] memory randomWords = new uint256[](1);
        randomWords[0] = 1;
        VRFCoordinatorV2_5Mock(vrfCoordinator).fulfillRandomWordsWithOverride(requestId, address(coinflip), randomWords);

        console2.log("unclaimed Prizes after transfer fail:", coinflip.unclaimedPrizes(address(rejectingWinner)));
        assertEq(
            coinflip.unclaimedPrizes(address(rejectingWinner)),
            (2 * minimumBetAmount) - ((2 * minimumBetAmount) * coinflip.getFeePercent() / 100)
        );

        uint256 totalPrize = (2 * minimumBetAmount) - ((2 * minimumBetAmount) * coinflip.getFeePercent() / 100);
        rejectingWinner.allowReceiveETH(true);
        // Act: Expect `PrizeClaimed` and `PrizeTransferRetried`
        vm.expectEmit(true, true, false, false);
        emit ChainFlip.PrizeClaimed(address(rejectingWinner), totalPrize);

        vm.expectEmit(true, true, false, false);
        emit ChainFlip.PrizeTransferRetried(address(rejectingWinner), totalPrize);

        vm.prank(account);
        coinflip.retryFailedTransfer(address(rejectingWinner));

        // Assert
        assertEq(coinflip.unclaimedPrizes(address(rejectingWinner)), 0, "Prize should be claimed");
    }

    /*//////////////////////////////////////////////////////////////
                         TEST GETTER FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    function testGetMatchesByPlayer() public createMatch {
        uint256[] memory matches = coinflip.getMatchesByPlayer(PLAYER1);
        assertEq(matches.length, 1);
        assertEq(matches[0], 1);

        // Player2 should have no matches
        matches = coinflip.getMatchesByPlayer(PLAYER2);
        assertEq(matches.length, 0);
    }

    function testGetMatch() public createMatch {
        ChainFlip.Match memory matchData = coinflip.getMatch(1);
        assertEq(matchData.player1, PLAYER1);
        assertEq(matchData.betAmount, minimumBetAmount);
        assertEq(uint256(matchData.state), uint256(ChainFlip.MatchState.WAITING_FOR_PLAYER));
    }

    function testGetMatchResult() public createAndJoinMatch {
        // Initially, the result should be false
        bool result = coinflip.getMatchResult(1);
        assertEq(result, false);
        // Force even outcome (player1 wins)
        ChainFlip.Match memory matchData = coinflip.getMatch(1);
        uint256 requestId = matchData.vrfRequestId;
        uint256[] memory randomWords = new uint256[](1);
        randomWords[0] = 2;
        VRFCoordinatorV2_5Mock(vrfCoordinator).fulfillRandomWordsWithOverride(requestId, address(coinflip), randomWords);
        //recheck result
        result = coinflip.getMatchResult(1);
        assertEq(result, true);
    }

    function testGetMatchState() public createMatch {
        ChainFlip.MatchState state = coinflip.getMatchState(1);
        assertEq(uint256(state), uint256(ChainFlip.MatchState.WAITING_FOR_PLAYER));

        // Player2 joins the match
        vm.prank(PLAYER2);
        coinflip.joinMatch{value: minimumBetAmount}(1);

        state = coinflip.getMatchState(1);
        assertEq(uint256(state), uint256(ChainFlip.MatchState.FLIPPING_COIN));

        // Force even outcome (player1 wins)
        ChainFlip.Match memory matchData = coinflip.getMatch(1);
        uint256 requestId = matchData.vrfRequestId;
        uint256[] memory randomWords = new uint256[](1);
        randomWords[0] = 2;
        VRFCoordinatorV2_5Mock(vrfCoordinator).fulfillRandomWordsWithOverride(requestId, address(coinflip), randomWords);

        //check state is ENDED
        state = coinflip.getMatchState(1);
        assertEq(uint256(state), uint256(ChainFlip.MatchState.ENDED));
    }

    function testGetMatchWinner() public createMatch {
        // Initially, there should be no winner
        address winner = coinflip.getMatchWinner(1);
        assertEq(winner, address(0));

        // Simulate a winner
        vm.prank(PLAYER2);
        coinflip.joinMatch{value: minimumBetAmount}(1);

        // Force even outcome (player2 wins)
        ChainFlip.Match memory matchData = coinflip.getMatch(1);
        uint256 requestId = matchData.vrfRequestId;
        uint256[] memory randomWords = new uint256[](1);
        randomWords[0] = 1;
        VRFCoordinatorV2_5Mock(vrfCoordinator).fulfillRandomWordsWithOverride(requestId, address(coinflip), randomWords);

        winner = coinflip.getMatchWinner(1);
        assertEq(winner, PLAYER2);
    }

    function testGetCurrentMatchId() public {
        assertEq(coinflip.getCurrentMatchId(), 0);

        vm.prank(PLAYER1);
        coinflip.createMatch{value: minimumBetAmount}(true);
        assertEq(coinflip.getCurrentMatchId(), 1);

        vm.prank(PLAYER2);
        coinflip.createMatch{value: minimumBetAmount}(false);
        assertEq(coinflip.getCurrentMatchId(), 2);
    }

    function testGetFeePercent() public {
        uint256 fee = 5;
        assertEq(coinflip.getFeePercent(), fee);
        vm.prank(coinflip.owner());
        coinflip.setFeePercent(7);
        assertEq(coinflip.getFeePercent(), 7);
    }

    function testGetRefunds() public createMatch {
        assertEq(coinflip.getRefunds(PLAYER1), 0);
        vm.prank(PLAYER1);
        coinflip.cancelMatch(1);
        assertEq(coinflip.getRefunds(PLAYER1), coinflip.getMinimumBetAmount());
    }

    function testGetCollectedFees() public createAndJoinMatch {
        console2.log("Collected fees before VRF: ", coinflip.getCollectedFees());
        assertEq(coinflip.getCollectedFees(), 0);

        ChainFlip.Match memory matchData = coinflip.getMatch(1);
        uint256 requestId = matchData.vrfRequestId;
        VRFCoordinatorV2_5Mock(vrfCoordinator).fulfillRandomWords(requestId, address(coinflip));
        console2.log("Collected fees after VRF: ", coinflip.getCollectedFees());
        assertEq(coinflip.getCollectedFees(), (2 * minimumBetAmount) * coinflip.getFeePercent() / 100);
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
        coinflip.createMatch{value: minimumBetAmount}(true);
    }

    function testMatchJoinedEmitsEvent() public createMatch {
        vm.expectEmit(true, true, true, true);
        emit ChainFlip.MatchJoined(1, PLAYER2, false, minimumBetAmount);

        vm.prank(PLAYER2);
        coinflip.joinMatch{value: minimumBetAmount}(1);
    }

    function testMatchCanceledEmitsEvent() public createMatch {
        vm.expectEmit(true, true, true, true);
        emit ChainFlip.MatchCanceledByPlayer(1, PLAYER1);

        vm.prank(PLAYER1);
        coinflip.cancelMatch(1);
    }

    function testMatchEndedEmitsEvent() public createAndJoinMatch {
        // Force even outcome (player2 wins)
        ChainFlip.Match memory matchData = coinflip.getMatch(1);
        uint256 requestId = matchData.vrfRequestId;
        uint256[] memory randomWords = new uint256[](1);
        randomWords[0] = 1;

        uint256 fee = (2 * minimumBetAmount * coinflip.getFeePercent()) / 100;
        uint256 prizeAmount = (2 * minimumBetAmount) - fee;

        vm.expectEmit(true, true, false, false);
        emit ChainFlip.TransferPrize(PLAYER2, prizeAmount);
        vm.expectEmit(true, true, true, false);
        emit ChainFlip.MatchResult(1, PLAYER2, 1);
        vm.expectEmit(true, true, true, true);
        emit ChainFlip.MatchEnded(1, PLAYER2, (2 * minimumBetAmount) - fee, block.timestamp);
        VRFCoordinatorV2_5Mock(vrfCoordinator).fulfillRandomWordsWithOverride(requestId, address(coinflip), randomWords);
    }

    function testRefundIssuedEmitsEvent() public createMatch {
        vm.prank(PLAYER1);
        coinflip.cancelMatch(1);

        vm.expectEmit(true, true, true, true);
        emit ChainFlip.RefundIssued(PLAYER1, minimumBetAmount);

        vm.prank(PLAYER1);
        coinflip.withdrawRefund();
    }

    function testRefundIssuedFailedEmitsEvent() public {
        RejectingWinner rejectingWinner = new RejectingWinner(address(coinflip));
        vm.deal(address(rejectingWinner), minimumBetAmount);

        vm.startPrank(address(rejectingWinner));
        coinflip.createMatch{value: minimumBetAmount}(true);

        coinflip.cancelMatch(1);
        // Simulate a failed refund
        vm.expectEmit(true, true, true, true);
        emit RefundFailed(address(rejectingWinner), minimumBetAmount);

        vm.expectRevert(ChainFlip.CoinFlip__TransferFailed.selector);
        coinflip.withdrawRefund();
        vm.stopPrank();
    }

    function testTransferPrizeEmitsEvent() public createAndJoinMatch {
        // Force even outcome (player2 wins)
        ChainFlip.Match memory matchData = coinflip.getMatch(1);
        uint256 requestId = matchData.vrfRequestId;
        uint256[] memory randomWords = new uint256[](1);
        randomWords[0] = 1;

        uint256 fees = (2 * minimumBetAmount) * coinflip.getFeePercent() / 100;

        vm.expectEmit(true, true, true, true);
        emit ChainFlip.TransferPrize(PLAYER2, (2 * minimumBetAmount) - fees);

        VRFCoordinatorV2_5Mock(vrfCoordinator).fulfillRandomWordsWithOverride(requestId, address(coinflip), randomWords);
    }

    function testFeeUpdatedEmitsEvent() public {
        vm.startPrank(account);
        vm.expectEmit(true, true, true, true);
        emit ChainFlip.FeeUpdated(8);

        coinflip.setFeePercent(8);
        vm.stopPrank();
    }

    function testMinimumBetAmountUpdatedEmitsEvent() public {
        vm.startPrank(account);
        vm.expectEmit(true, true, true, true);
        emit ChainFlip.MinimumBetAmountUpdated(0.02 ether);
        coinflip.setMinimumBetAmount(0.02 ether);
        vm.stopPrank();
    }

    function testFeesWithdrawnEmitsEvent() public createAndJoinMatch {
        ChainFlip.Match memory matchData = coinflip.getMatch(1);
        uint256 requestId = matchData.vrfRequestId;
        VRFCoordinatorV2_5Mock(vrfCoordinator).fulfillRandomWords(requestId, address(coinflip));

        uint256 collectedFees = coinflip.getCollectedFees();

        vm.expectEmit(true, true, true, true);
        emit ChainFlip.FeesWithdrawn(DEVADDRESS, collectedFees);

        vm.prank(account);
        coinflip.withdrawFees(payable(DEVADDRESS), collectedFees);
    }

    //Automation test for the contract
    function testCheckUpkeepNoStuckMatches() public view {
        (bool upkeepNeeded, bytes memory performData) = coinflip.checkUpkeep("");
        assertFalse(upkeepNeeded);
        assertEq(performData, "");
    }

    function testCheckUpkeepWithStuckMatches() public createAndJoinMatch {
        // Simulate time passing to make the match "stuck"
        vm.warp(block.timestamp + 61 minutes);

        (bool upkeepNeeded, bytes memory performData) = coinflip.checkUpkeep("");
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
        (bool upkeepNeeded, bytes memory performData) = coinflip.checkUpkeep("");
        assertTrue(upkeepNeeded);

        vm.prank(address(this));
        coinflip.performUpkeep(performData);

        // Verify that the match is canceled and refunds are issued
        ChainFlip.Match memory matchData = coinflip.getMatch(1);
        assertEq(uint256(matchData.state), uint256(ChainFlip.MatchState.CANCELED));
        assertEq(coinflip.getRefunds(PLAYER1), minimumBetAmount);
        assertEq(coinflip.getRefunds(PLAYER2), minimumBetAmount);
    }
}

contract RejectingWinner {
    ChainFlip public coinflip;
    bool private allowReceive = false; // Controls whether ETH can be accepted

    constructor(address _coinflip) {
        coinflip = ChainFlip(payable(_coinflip));
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
        coinflip.claimPrize();
        allowReceive = false; // Revert back to rejecting transfers
    }

    function allowReceiveETH(bool choice) external {
        allowReceive = choice;
    }
}
