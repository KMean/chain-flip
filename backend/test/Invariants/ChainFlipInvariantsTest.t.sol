// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {StdInvariant} from "forge-std/StdInvariant.sol";
import {ChainFlip} from "src/ChainFlip.sol";
import {DeployChainFlip} from "script/DeployChainFlip.s.sol";
import {HelperConfig} from "script/HelperConfig.s.sol";

contract ChainFlipInvariantsTest is StdInvariant, Test {
    ChainFlip public chainflip;
    HelperConfig public helperConfig;

    function setUp() public {
        // Deploy as normal
        DeployChainFlip deployer = new DeployChainFlip();
        (chainflip, helperConfig) = deployer.deployContract();

        bytes4[] memory selectors = new bytes4[](2);
        selectors[0] = chainflip.createMatch.selector;
        selectors[1] = chainflip.joinMatch.selector;

        targetSelector(FuzzSelector({addr: address(chainflip), selectors: selectors}));
    }

    function invariant_feeWithinBounds() public view {
        uint256 fee = chainflip.getFeePercent();
        require(fee >= 1 && fee <= 10, "Fee out of bounds!");
    }

    function invariant_timeOutIsValid() public view {
        uint256 timeOut = chainflip.getTimeOutForStuckMatches();
        require(timeOut >= 60 minutes, "Invariant broken: timeOut < 60 minutes!");
    }

    function invariant_minBetAtLeastPoint01() public view {
        uint256 minBet = chainflip.getMinimumBetAmount();
        require(minBet >= 0.01 ether, "Invariant broken: minBet < 0.01 ether!");
    }

    function invariant_matchStatesConsistent() public view {
        uint256 latestMatchId = chainflip.getCurrentMatchId();
        for (uint256 matchId = 1; matchId <= latestMatchId; matchId++) {
            (bool isInvalid, string memory reason) = checkMatchConsistency(matchId);
            require(!isInvalid, reason);
        }
    }

    function checkMatchConsistency(uint256 matchId) internal view returns (bool isInvalid, string memory reason) {
        // We'll read the match struct
        ChainFlip.Match memory m = chainflip.getMatch(matchId);

        // Skip if it doesn't exist
        if (m.player1 == address(0)) {
            // If your contract reuses IDs or doesn't skip them, you can handle that differently.
            return (false, "");
        }

        // 1) WAITING_FOR_PLAYER => player2 == address(0)
        if (m.state == ChainFlip.MatchState.WAITING_FOR_PLAYER) {
            if (m.player2 != address(0)) {
                return (true, "Waiting but second player is set");
            }
        }

        // 2) FLIPPING_COIN => must have a valid player2
        if (m.state == ChainFlip.MatchState.FLIPPING_COIN) {
            if (m.player2 == address(0)) {
                return (true, "Flipping coin but no second player");
            }
        }

        // 3) ENDED => endTime should be > 0
        if (m.state == ChainFlip.MatchState.ENDED) {
            if (m.endTime == 0) {
                return (true, "Ended but endTime not set");
            }
        }

        return (false, "");
    }

    function invariant_activeMatchesAreValid() public view {
        // 1) For each activeMatch, ensure the match is WAITING_FOR_PLAYER or FLIPPING_COIN
        uint256[] memory active = getActiveMatchIds();
        for (uint256 i = 0; i < active.length; i++) {
            ChainFlip.Match memory m = chainflip.getMatch(active[i]);
            require(
                m.state == ChainFlip.MatchState.WAITING_FOR_PLAYER || m.state == ChainFlip.MatchState.FLIPPING_COIN,
                "Invariant broken: match is active but not WAITING or FLIPPING"
            );
        }

        // 2) Also check the reverse: no ENDED or CANCELED match remains in the activeMatches array
        // (the same check above also covers it, but you can do it explicitly if you prefer).
    }

    function getActiveMatchIds() internal view returns (uint256[] memory) {
        // ChainFlip doesn't have a direct "getter" that returns just the match IDs
        // but it has `getActiveMatches()` returning an array of Match structs
        ChainFlip.Match[] memory matches_ = chainflip.getActiveMatches();
        uint256[] memory ids = new uint256[](matches_.length);
        for (uint256 i = 0; i < matches_.length; i++) {
            ids[i] = matches_[i].id;
        }
        return ids;
    }
}
