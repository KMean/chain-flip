// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {DeployCoinFlip} from "script/DeployCoinFlip.s.sol";
import {CoinFlip} from "src/CoinFlip.sol";
import {HelperConfig, CodeConstants} from "script/HelperConfig.s.sol";
import {Vm} from "forge-std/Vm.sol";
import {VRFCoordinatorV2_5Mock} from "@chainlink/contracts/src/v0.8/vrf/mocks/VRFCoordinatorV2_5Mock.sol";
import {console2} from "forge-std/console2.sol";

contract CoinFlipFuzzTest is Test, CodeConstants {
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
    address public DEVADDRESS = makeAddr("devaddress");

    uint256 public STARTING_PLAYER_BALANCE = 100 ether;

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

        HelperConfig.NetworkConfig memory config = helperConfig.getConfig();
        minimumBetAmount = config.minimumBetAmount;
        vrfCoordinator = config.vrfCoordinator;
        keyHash = config.keyHash;
        subscriptionId = config.subscriptionId;
        callbackGasLimit = config.callbackGasLimit;
        account = config.account;

        // Fund test players
        vm.deal(PLAYER1, STARTING_PLAYER_BALANCE);
        vm.deal(PLAYER2, STARTING_PLAYER_BALANCE);
    }

    /*//////////////////////////////////////////////////////////////
                         FUZZ TEST CASES
    //////////////////////////////////////////////////////////////*/

    function testFuzzCreateMatch(uint256 betAmount) public {
        // Ensure betAmount is within a reasonable range
        betAmount = bound(betAmount, minimumBetAmount, 1 ether);

        vm.prank(PLAYER1);
        coinflip.createMatch{value: betAmount}(true);

        CoinFlip.Match memory matchData = coinflip.getMatch(1);
        assertEq(matchData.player1, PLAYER1);
        assertEq(matchData.betAmount, betAmount);
        assertEq(uint256(matchData.state), uint256(CoinFlip.MatchState.WAITING_FOR_PLAYER));
    }

    function testFuzzJoinMatch(uint256 betAmount) public {
        betAmount = bound(betAmount, minimumBetAmount, 1 ether);

        vm.prank(PLAYER1);
        coinflip.createMatch{value: betAmount}(true);

        vm.prank(PLAYER2);
        coinflip.joinMatch{value: betAmount}(1);

        CoinFlip.Match memory matchData = coinflip.getMatch(1);
        assertEq(matchData.player2, PLAYER2);
        assertEq(uint256(matchData.state), uint256(CoinFlip.MatchState.FLIPPING_COIN));
    }

    function testFuzzVRFCallback(uint256 randomWord) public {
        randomWord = bound(randomWord, 0, type(uint256).max);

        vm.prank(PLAYER1);
        coinflip.createMatch{value: minimumBetAmount}(true);
        vm.prank(PLAYER2);
        coinflip.joinMatch{value: minimumBetAmount}(1);

        CoinFlip.Match memory matchData = coinflip.getMatch(1);
        VRFCoordinatorV2_5Mock(vrfCoordinator).fulfillRandomWords(matchData.vrfRequestId, address(coinflip));

        matchData = coinflip.getMatch(1);
        assertEq(uint256(matchData.state), uint256(CoinFlip.MatchState.ENDED));
        assertTrue(matchData.winner == PLAYER1 || matchData.winner == PLAYER2);
    }

    function testFuzzCancelMatch(uint256 betAmount) public {
        betAmount = bound(betAmount, minimumBetAmount, 1 ether);

        vm.prank(PLAYER1);
        coinflip.createMatch{value: betAmount}(true);

        vm.prank(PLAYER1);
        coinflip.cancelMatch(1);

        CoinFlip.Match memory matchData = coinflip.getMatch(1);
        assertEq(uint256(matchData.state), uint256(CoinFlip.MatchState.CANCELED));
        assertEq(coinflip.getRefunds(PLAYER1), betAmount);
    }

    function testFuzzInvalidJoin(uint256 invalidMatchId, uint256 betAmount) public {
        invalidMatchId = bound(invalidMatchId, 2, 100); // Ensure it’s an invalid ID
        betAmount = bound(betAmount, minimumBetAmount, 1 ether);

        vm.prank(PLAYER2);
        vm.expectRevert(CoinFlip.CoinFlip__MatchDoesNotExist.selector);
        coinflip.joinMatch{value: betAmount}(invalidMatchId);
    }

    function testFuzzCannotJoinOwnMatch(uint256 betAmount) public {
        betAmount = bound(betAmount, minimumBetAmount, 1 ether);

        vm.prank(PLAYER1);
        coinflip.createMatch{value: betAmount}(true);

        vm.prank(PLAYER1);
        vm.expectRevert(CoinFlip.CoinFlip__CantJoinYourOwnGame.selector);
        coinflip.joinMatch{value: betAmount}(1);
    }

    function testFuzzSetFee(uint256 newFee) public {
        newFee = bound(newFee, 0, 10); // Fees should be between 0-10%

        vm.prank(account);
        coinflip.setFeePercent(newFee);

        assertEq(coinflip.getFeePercent(), newFee);
    }

    function testFuzzWithdrawFees(uint256 betAmount) public {
        betAmount = bound(betAmount, minimumBetAmount, 1 ether);

        vm.prank(PLAYER1);
        coinflip.createMatch{value: betAmount}(true);
        vm.prank(PLAYER2);
        coinflip.joinMatch{value: betAmount}(1);

        CoinFlip.Match memory matchData = coinflip.getMatch(1);
        uint256 requestId = matchData.vrfRequestId;
        VRFCoordinatorV2_5Mock(vrfCoordinator).fulfillRandomWords(requestId, address(coinflip));
        console2.log("Collected fees", coinflip.getCollectedFees());
        uint256 collectedFees = coinflip.getCollectedFees();

        vm.prank(account);
        coinflip.withdrawFees(payable(DEVADDRESS), collectedFees);

        assertEq(coinflip.getCollectedFees(), 0);
        assertEq(DEVADDRESS.balance, collectedFees);
    }

    function testFuzzCreateMatchWithRandomBetAmounts(uint256 betAmount) public {
        // Bound betAmount to a reasonable range (0.01 ether to 100 ether)
        betAmount = bound(betAmount, 0.01 ether, 100 ether);

        vm.prank(PLAYER1);
        if (betAmount < minimumBetAmount) {
            vm.expectRevert(CoinFlip.CoinFlip__InvalidBetAmount.selector);
            coinflip.createMatch{value: betAmount}(true);
        } else {
            coinflip.createMatch{value: betAmount}(true);
            CoinFlip.Match memory matchData = coinflip.getMatch(1);
            assertEq(matchData.betAmount, betAmount);
        }
    }

    function testFuzzJoinMatchWithRandomBetAmounts(uint256 betAmount) public createMatch {
        // Bound betAmount to a reasonable range (0.01 ether to 100 ether)
        betAmount = bound(betAmount, 0.01 ether, 100 ether);
        vm.prank(PLAYER2);
        if (betAmount != minimumBetAmount) {
            vm.expectRevert(CoinFlip.CoinFlip__InvalidBetAmount.selector);
            coinflip.joinMatch{value: betAmount}(1);
        } else {
            coinflip.joinMatch{value: betAmount}(1);
            CoinFlip.Match memory matchData = coinflip.getMatch(1);
            assertEq(matchData.betAmount, betAmount);
        }
    }

    // Chainlink Automated Test
    function testFuzzPerformUpkeep(uint256 randomTime) public createAndJoinMatch {
        // Bound the randomTime to a reasonable range
        randomTime = bound(randomTime, 61 minutes, 1 days);

        // Simulate time passing to make the match "stuck"
        vm.warp(block.timestamp + randomTime);

        // Check upkeep and perform it
        (bool upkeepNeeded, bytes memory performData) = coinflip.checkUpkeep("");
        if (upkeepNeeded) {
            vm.prank(address(this));
            coinflip.performUpkeep(performData);

            // Verify that the match is canceled and refunds are issued
            CoinFlip.Match memory matchData = coinflip.getMatch(1);
            assertEq(uint256(matchData.state), uint256(CoinFlip.MatchState.CANCELED));
            assertEq(coinflip.getRefunds(PLAYER1), minimumBetAmount);
            assertEq(coinflip.getRefunds(PLAYER2), minimumBetAmount);
        }
    }
}
