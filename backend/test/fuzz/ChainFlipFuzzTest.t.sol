// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {DeployChainFlip} from "script/DeployChainFlip.s.sol";
import {ChainFlip} from "src/ChainFlip.sol";
import {HelperConfig, CodeConstants} from "script/HelperConfig.s.sol";
import {Vm} from "forge-std/Vm.sol";
import {VRFCoordinatorV2_5Mock} from "@chainlink/contracts/src/v0.8/vrf/mocks/VRFCoordinatorV2_5Mock.sol";
import {console2} from "forge-std/console2.sol";

contract ChainFlipFuzzTest is Test, CodeConstants {
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
    address public DEVADDRESS = makeAddr("devaddress");

    uint256 public STARTING_PLAYER_BALANCE = 100 ether;

    /*//////////////////////////////////////////////////////////////
                               MODIFIERS
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
        chainflip.createMatch{value: betAmount}(true);

        ChainFlip.Match memory matchData = chainflip.getMatch(1);
        assertEq(matchData.player1, PLAYER1);
        assertEq(matchData.betAmount, betAmount);
        assertEq(uint256(matchData.state), uint256(ChainFlip.MatchState.WAITING_FOR_PLAYER));
    }

    function testFuzzJoinMatch(uint256 betAmount) public {
        betAmount = bound(betAmount, minimumBetAmount, 1 ether);

        vm.prank(PLAYER1);
        chainflip.createMatch{value: betAmount}(true);

        vm.prank(PLAYER2);
        chainflip.joinMatch{value: betAmount}(1);

        ChainFlip.Match memory matchData = chainflip.getMatch(1);
        assertEq(matchData.player2, PLAYER2);
        assertEq(uint256(matchData.state), uint256(ChainFlip.MatchState.FLIPPING_COIN));
    }

    function testFuzzVRFCallback(uint256 randomWord) public {
        randomWord = bound(randomWord, 0, type(uint256).max);

        vm.prank(PLAYER1);
        chainflip.createMatch{value: minimumBetAmount}(true);
        vm.prank(PLAYER2);
        chainflip.joinMatch{value: minimumBetAmount}(1);

        ChainFlip.Match memory matchData = chainflip.getMatch(1);
        VRFCoordinatorV2_5Mock(vrfCoordinator).fulfillRandomWords(matchData.vrfRequestId, address(chainflip));

        matchData = chainflip.getMatch(1);
        assertEq(uint256(matchData.state), uint256(ChainFlip.MatchState.ENDED));
        assertTrue(matchData.winner == PLAYER1 || matchData.winner == PLAYER2);
    }

    function testFuzzCancelMatch(uint256 betAmount) public {
        betAmount = bound(betAmount, minimumBetAmount, 1 ether);

        vm.prank(PLAYER1);
        chainflip.createMatch{value: betAmount}(true);

        vm.prank(PLAYER1);
        chainflip.cancelMatch(1);

        ChainFlip.Match memory matchData = chainflip.getMatch(1);
        assertEq(uint256(matchData.state), uint256(ChainFlip.MatchState.CANCELED));
        assertEq(chainflip.getRefunds(PLAYER1), betAmount);
    }

    function testFuzzInvalidJoin(uint256 invalidMatchId, uint256 betAmount) public {
        invalidMatchId = bound(invalidMatchId, 2, 100); // Ensure it’s an invalid ID
        betAmount = bound(betAmount, minimumBetAmount, 1 ether);

        vm.prank(PLAYER2);
        vm.expectRevert(ChainFlip.CoinFlip__MatchDoesNotExist.selector);
        chainflip.joinMatch{value: betAmount}(invalidMatchId);
    }

    function testFuzzCannotJoinOwnMatch(uint256 betAmount) public {
        betAmount = bound(betAmount, minimumBetAmount, 1 ether);

        vm.prank(PLAYER1);
        chainflip.createMatch{value: betAmount}(true);

        vm.prank(PLAYER1);
        vm.expectRevert(ChainFlip.CoinFlip__CantJoinYourOwnGame.selector);
        chainflip.joinMatch{value: betAmount}(1);
    }

    function testFuzzSetFee(uint256 newFee) public {
        newFee = bound(newFee, 1, 10); // Fees should be between 0-10%

        vm.prank(account);
        chainflip.setFeePercent(newFee);

        assertEq(chainflip.getFeePercent(), newFee);
    }

    function testFuzzWithdrawFees(uint256 betAmount) public {
        betAmount = bound(betAmount, minimumBetAmount, 1 ether);

        vm.prank(PLAYER1);
        chainflip.createMatch{value: betAmount}(true);
        vm.prank(PLAYER2);
        chainflip.joinMatch{value: betAmount}(1);

        ChainFlip.Match memory matchData = chainflip.getMatch(1);
        uint256 requestId = matchData.vrfRequestId;
        VRFCoordinatorV2_5Mock(vrfCoordinator).fulfillRandomWords(requestId, address(chainflip));
        console2.log("Collected fees", chainflip.getCollectedFees());
        uint256 collectedFees = chainflip.getCollectedFees();

        vm.prank(account);
        chainflip.withdrawFees(payable(DEVADDRESS), collectedFees);

        assertEq(chainflip.getCollectedFees(), 0);
        assertEq(DEVADDRESS.balance, collectedFees);
    }

    function testFuzzCreateMatchWithRandomBetAmounts(uint256 betAmount) public {
        // Bound betAmount to a reasonable range (0.01 ether to 100 ether)
        betAmount = bound(betAmount, 0.01 ether, 100 ether);

        vm.prank(PLAYER1);
        if (betAmount < minimumBetAmount) {
            vm.expectRevert(ChainFlip.CoinFlip__InvalidBetAmount.selector);
            chainflip.createMatch{value: betAmount}(true);
        } else {
            chainflip.createMatch{value: betAmount}(true);
            ChainFlip.Match memory matchData = chainflip.getMatch(1);
            assertEq(matchData.betAmount, betAmount);
        }
    }

    function testFuzzJoinMatchWithRandomBetAmounts(uint256 betAmount) public createMatch {
        // Bound betAmount to a reasonable range (0.01 ether to 100 ether)
        betAmount = bound(betAmount, 0.01 ether, 100 ether);
        vm.prank(PLAYER2);
        if (betAmount != minimumBetAmount) {
            vm.expectRevert(ChainFlip.CoinFlip__InvalidBetAmount.selector);
            chainflip.joinMatch{value: betAmount}(1);
        } else {
            chainflip.joinMatch{value: betAmount}(1);
            ChainFlip.Match memory matchData = chainflip.getMatch(1);
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
        (bool upkeepNeeded, bytes memory performData) = chainflip.checkUpkeep("");
        if (upkeepNeeded) {
            vm.prank(address(this));
            chainflip.performUpkeep(performData);

            // Verify that the match is canceled and refunds are issued
            ChainFlip.Match memory matchData = chainflip.getMatch(1);
            assertEq(uint256(matchData.state), uint256(ChainFlip.MatchState.CANCELED));
            assertEq(chainflip.getRefunds(PLAYER1), minimumBetAmount);
            assertEq(chainflip.getRefunds(PLAYER2), minimumBetAmount);
        }
    }
}
