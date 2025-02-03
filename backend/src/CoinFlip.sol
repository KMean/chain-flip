// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";
import {AutomationCompatibleInterface} from "@chainlink/contracts/src/v0.8/automation/AutomationCompatible.sol";

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title CoinFlip
 * @author Kim Ranzani - KMean
 * @dev A decentralized coin flip betting game using Chainlink VRF for randomness.
 *      Players can create and join matches, and winnings are automatically paid out.
 *      The contract also collects a fee on each match.
 * @notice fees can be withdrawn by the owner to a specified address.
 * @notice unclaimed prizes (in case of a transfer fails) can be withdrawn later by the players.
 * @notice refunds can be claimed by the player if the match is canceled.
 * @notice the owner can set the minimum bet amount and the fee percentage (max 10%).
 * @notice the owner can also retry failed prize transfers in case of a dispute.
 *
 */
contract CoinFlip is VRFConsumerBaseV2Plus, AutomationCompatibleInterface, ReentrancyGuard {
    /*//////////////////////////////////////////////////////////////
                            TYPE DECLARATIONS
    //////////////////////////////////////////////////////////////*/

    struct Match {
        uint256 id; // Unique match ID
        uint256 startTime; // Timestamp when the match started
        uint256 endTime; // Timestamp when the match ended
        uint256 betAmount; // Amount wagered by each player
        uint256 vrfRequestId; // Request ID from Chainlink VRF
        address player1; // Address of the first player
        address player2; // Address of the second player
        address winner; // Address of the winner
        bool result; // Result of the coin flip (true for heads, false for tails)
        bool player1Choice; // Choice of player1 (true for heads, false for tails)
        bool player2Choice; // Choice of player2 (opposite of player1)
        MatchState state; // Current state of the match
    }

    enum MatchState {
        WAITING_FOR_PLAYER,
        FLIPPING_COIN,
        CANCELED,
        ENDED
    }

    /*//////////////////////////////////////////////////////////////
                            STATE VARIABLES
    //////////////////////////////////////////////////////////////*/

    //needed for the automation if a match is stuck (something went wrong with the chainlink vrf)
    uint256[] public activeMatches;
    mapping(uint256 => uint256) public matchIndexInActive; // Maps matchId to its index in activeMatches

    uint256 private s_currentMatchId;
    uint256 private s_minimumBetAmount = 0.01 ether;
    uint256 private feePercent = 5; //defaults to 5% fee on each match (max fee 10%)
    uint256 private collectedFees;
    uint256 private timeOutForStuckMatches = 60 minutes;
    /*//////////////////////////////////////////////////////////////
                                CHAINLINK 
    //////////////////////////////////////////////////////////////*/
    uint256 private immutable i_subscriptionId;
    bytes32 private immutable i_keyHash;
    uint32 private immutable i_callbackGasLimit;
    uint32 private constant NUM_WORDS = 1;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;

    mapping(uint256 => Match) public matches;
    mapping(uint256 => uint256) public requestIdToMatchId;
    mapping(address => uint256[]) public playerMatches;
    mapping(address => uint256) public unclaimedPrizes;
    mapping(address => uint256) public refunds;

    /*//////////////////////////////////////////////////////////////
                                 EVENTS
    //////////////////////////////////////////////////////////////*/

    event RequestSent(uint256 requestId, uint256 matchId, uint32 numWords);
    event MatchCreated(
        uint256 indexed matchId, uint256 startTime, address indexed player1, bool choice, uint256 betAmount
    );
    event MatchJoined(uint256 indexed matchId, address indexed player2, bool choice, uint256 betAmount);
    event MatchCanceled(uint256 indexed matchId, address indexed player1);
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
    event MatchSkipped(uint256 matchId, MatchState state);
    event TimeOutUpdated(uint256 newTimeOut);
    /*//////////////////////////////////////////////////////////////
                                 ERRORS
    //////////////////////////////////////////////////////////////*/

    error CoinFlip__InvalidMatchId();
    error CoinFlip__InvalidMatchState();
    error CoinFlip__InvalidBetAmount();
    error CoinFlip__NotTheMatchCreator();
    error CoinFlip__CantJoinYourOwnGame();
    error CoinFlip__MatchAlreadyEnded();
    error CoinFlip__MatchDoesNotExist();
    error CoinFlip__NoPrizeToClaim();
    error CoinFlip__TransferFailed();
    error CoinFlip__NoFeesToWithdraw();
    error CoinFlip__FeeTooHigh();
    error CoinFlip__NoRefundToClaim();
    error NotValidTimeOut();

    /**
     * @notice Deploys the contract and initializes Chainlink VRF settings.
     * @param minimumBetAmount Minimum bet amount required to create a match.
     * @param subscriptionId Chainlink VRF subscription ID.
     * @param vrfCoordinator Address of the Chainlink VRF Coordinator.
     * @param keyHash Chainlink VRF key hash.
     * @param callbackGasLimit Gas limit for the VRF callback.
     */
    constructor(
        uint256 minimumBetAmount,
        uint256 subscriptionId,
        address vrfCoordinator,
        bytes32 keyHash,
        uint32 callbackGasLimit
    ) VRFConsumerBaseV2Plus(vrfCoordinator) {
        s_minimumBetAmount = minimumBetAmount;
        s_currentMatchId = 0;
        i_subscriptionId = subscriptionId;
        i_keyHash = keyHash;
        i_callbackGasLimit = callbackGasLimit;
    }

    /*//////////////////////////////////////////////////////////////
                               FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /**
     * @notice Callback function that receives random words from Chainlink VRF.
     * @dev Determines match results and transfers the winnings.
     * @param requestId ID of the VRF request.
     * @param _randomWords Random number(s) received from Chainlink VRF.
     */
    function fulfillRandomWords(uint256 requestId, uint256[] calldata _randomWords) internal override nonReentrant {
        uint256 matchId = requestIdToMatchId[requestId];
        Match storage _match = matches[matchId];

        /// @dev If a match is canceled by Chainlink Automation (due to a stuck VRF request), the fulfillRandomWords function might still process the match once the VRF response arrives.This would overwrite the CANCELED state to ENDED, potentially causing:
        ///Double refunds and payouts (if refunds were issued during cancellation).
        ///Contract balance issues if funds have already been withdrawn or claimed.
        ///State inconsistency, leading to unpredictable behavior in the UI and backend.
        ///To prevent this, we check if the match is still in the FLIPPING_COIN state before proceeding.
        if (_match.state != MatchState.FLIPPING_COIN) {
            emit MatchSkipped(matchId, _match.state);
            return; // Exit if the match is no longer in the correct state
        }

        // Proceed with processing the match
        bool result = (_randomWords[0] % 2 == 0);
        _match.result = result;
        _match.state = MatchState.ENDED;
        _match.endTime = block.timestamp;
        _match.winner = result == _match.player1Choice ? _match.player1 : _match.player2;

        uint256 totalPool = _match.betAmount * 2;
        uint256 fee = (totalPool * feePercent) / 100;
        collectedFees += fee;
        uint256 prizeAmount = totalPool - fee;

        (bool success,) = _match.winner.call{value: prizeAmount}("");
        if (!success) {
            unclaimedPrizes[_match.winner] += prizeAmount; // Only store if transfer fails
            emit TransferPrizeFailed(_match.winner, prizeAmount);
        } else {
            emit TransferPrize(_match.winner, prizeAmount);
        }

        // Double removal protection: remove only if it's still active
        if (matchIndexInActive[matchId] != 0 || (activeMatches.length > 0 && activeMatches[0] == matchId)) {
            removeActiveMatch(matchId);
        }

        emit MatchResult(matchId, _match.winner, _randomWords[0]);
        emit MatchEnded(matchId, _match.winner, prizeAmount, _match.endTime);
    }

    /**
     * @notice Removes a match from the active matches list.
     * @param matchId The ID of the match to remove.
     */
    function removeActiveMatch(uint256 matchId) internal {
        uint256 index = matchIndexInActive[matchId];
        uint256 lastIndex = activeMatches.length - 1;

        if (index != lastIndex) {
            uint256 lastMatchId = activeMatches[lastIndex];
            activeMatches[index] = lastMatchId;
            matchIndexInActive[lastMatchId] = index;
        }

        activeMatches.pop();
        delete matchIndexInActive[matchId];
    }

    /**
     * @notice Chainlink Automation Trigger. Checks if any matches are stuck and need action.
     * @dev Checks if any matches are stuck in the FLIPPING_COIN state for too long.
     * @param upkeepNeeded Boolean indicating if any matches are stuck.
     * @param performData Data to perform the upkeep action.
     */
    function checkUpkeep(bytes calldata) external view returns (bool upkeepNeeded, bytes memory performData) {
        if (activeMatches.length == 0) return (false, bytes(""));

        uint256[] memory stuckMatches = new uint256[](activeMatches.length);
        uint256 count = 0;

        for (uint256 i = 0; i < activeMatches.length; i++) {
            uint256 matchId = activeMatches[i];
            Match storage _match = matches[matchId];

            if (_match.state == MatchState.FLIPPING_COIN && block.timestamp > _match.startTime + timeOutForStuckMatches)
            {
                stuckMatches[count] = matchId;
                count++;
                if (count >= 5) break;
            }
        }

        upkeepNeeded = count > 0;
        performData = abi.encode(stuckMatches, count);
    }

    /**
     * @notice Chainlink Automation Perform. Handles stuck matches by retrying VRF requests or canceling matches.
     * @dev Attempts to retry VRF requests for stuck matches, or cancels the match and refunds players.
     * @param performData Data to perform the upkeep action.
     */
    function performUpkeep(bytes calldata performData) external nonReentrant {
        (uint256[] memory stuckMatches, uint256 count) = abi.decode(performData, (uint256[], uint256));

        for (uint256 i = 0; i < count; i++) {
            uint256 matchId = stuckMatches[i];
            Match storage _match = matches[matchId];

            if (_match.state == MatchState.FLIPPING_COIN) {
                // Option 1: Retry VRF request (if supported)
                // requestRandomWordsAgain(matchId);

                // Option 2: Cancel the match and refund players
                _match.state = MatchState.CANCELED;
                refunds[_match.player1] += _match.betAmount;
                refunds[_match.player2] += _match.betAmount;

                // Double removal protection: remove only if it's still active
                if (matchIndexInActive[matchId] != 0 || (activeMatches.length > 0 && activeMatches[0] == matchId)) {
                    removeActiveMatch(matchId);
                }

                emit MatchCanceled(matchId, _match.player1);
            }
        }
    }

    /**
     * @notice Allows a player to create a new match.
     * @param choice The player's choice (true for heads, false for tails).
     */
    function createMatch(bool choice) external payable {
        if (msg.value < s_minimumBetAmount) revert CoinFlip__InvalidBetAmount();

        unchecked {
            s_currentMatchId++;
        }

        Match memory newMatch = Match({
            id: s_currentMatchId,
            startTime: block.timestamp,
            endTime: 0,
            player1: msg.sender,
            player2: address(0),
            winner: address(0),
            betAmount: msg.value,
            result: false,
            player1Choice: choice,
            player2Choice: !choice,
            state: MatchState.WAITING_FOR_PLAYER,
            vrfRequestId: 0
        });

        matches[s_currentMatchId] = newMatch;
        playerMatches[msg.sender].push(s_currentMatchId);
        emit MatchCreated(s_currentMatchId, newMatch.startTime, msg.sender, choice, msg.value);
    }

    /**
     * @notice Allows a second player to join an existing match, by design he will take the opposite side of the bet.
     * @dev The match is then transitioned to the FLIPPING_COIN state.
     * @dev After Joining the match, the Chainlink VRF is requested for a random number.
     * @param matchId ID of the match to join.
     */
    function joinMatch(uint256 matchId) external payable nonReentrant {
        Match storage matchToJoin = matches[matchId];

        if (matchToJoin.player1 == address(0)) revert CoinFlip__MatchDoesNotExist();
        if (msg.value != matchToJoin.betAmount) revert CoinFlip__InvalidBetAmount();
        if (matchToJoin.state != MatchState.WAITING_FOR_PLAYER) revert CoinFlip__InvalidMatchState();
        if (matchToJoin.player1 == msg.sender) revert CoinFlip__CantJoinYourOwnGame();

        matchToJoin.player2 = msg.sender;
        matchToJoin.state = MatchState.FLIPPING_COIN;
        playerMatches[msg.sender].push(matchId);

        // Request random words from Chainlink VRF
        uint256 requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: i_keyHash,
                subId: i_subscriptionId,
                requestConfirmations: REQUEST_CONFIRMATIONS,
                callbackGasLimit: i_callbackGasLimit,
                numWords: NUM_WORDS,
                extraArgs: VRFV2PlusClient._argsToBytes(VRFV2PlusClient.ExtraArgsV1({nativePayment: false}))
            })
        );

        matchToJoin.vrfRequestId = requestId;
        requestIdToMatchId[requestId] = matchId;

        ///@dev add the match to the active matches for the automation in case the vrf request fails
        activeMatches.push(matchId);
        matchIndexInActive[matchId] = activeMatches.length - 1;

        emit MatchJoined(matchId, msg.sender, matchToJoin.player2Choice, matchToJoin.betAmount);
    }

    /**
     * @notice Cancels an ongoing match before another player joins.
     * @dev Only the match creator (player1) can cancel the match.
     *      The match must be in the `WAITING_FOR_PLAYER` state.
     *      **Manual Cancellation Behavior:** Only player1 is refunded since no other player has joined the match.
     * @param matchId The ID of the match to cancel.
     * @custom:throws CoinFlip__NotTheMatchCreator if called by someone other than the match creator.
     * @custom:throws CoinFlip__InvalidMatchState if the match is not in the `WAITING_FOR_PLAYER` state.
     * @custom:throws CoinFlip__MatchDoesNotExist if the match does not exist.
     */
    function cancelMatch(uint256 matchId) external {
        Match storage matchToCancel = matches[matchId];

        if (msg.sender != matchToCancel.player1) revert CoinFlip__NotTheMatchCreator();
        if (matchToCancel.state != MatchState.WAITING_FOR_PLAYER) revert CoinFlip__InvalidMatchState();
        if (matchToCancel.player1 == address(0)) revert CoinFlip__MatchDoesNotExist();

        matchToCancel.state = MatchState.CANCELED;

        refunds[matchToCancel.player1] += matchToCancel.betAmount;

        emit MatchCanceled(matchId, msg.sender);
    }

    /**
     * @notice Withdraws a refund if the player has an available refund.
     * @dev Ensures the player has a refund balance before attempting withdrawal.
     *      Uses re-entrancy protection to prevent attacks.
     *      Refund amount is reset to zero before sending to prevent re-entrancy.
     * @custom:throws CoinFlip__NoRefundToClaim if the player has no refund available.
     * @custom:throws CoinFlip__TransferFailed if the refund transfer fails.
     */
    function withdrawRefund() external nonReentrant {
        uint256 amount = refunds[msg.sender];
        if (amount == 0) revert CoinFlip__NoRefundToClaim();

        refunds[msg.sender] = 0; // Prevent re-entrancy
        (bool success,) = msg.sender.call{value: amount}("");
        if (!success) {
            refunds[msg.sender] = amount; // Restore balance if transfer fails
            emit RefundFailed(msg.sender, amount);
            revert CoinFlip__TransferFailed();
        }
        emit RefundIssued(msg.sender, amount);
    }

    /**
     * @notice Claims a prize if the player has unclaimed winnings.
     * @dev Ensures the player has a prize to claim before sending funds.
     *      Uses re-entrancy protection to prevent attacks.
     *      Prize amount is reset to zero before sending to prevent re-entrancy.
     * @custom:throws CoinFlip__NoPrizeToClaim if the player has no prize available.
     * @custom:throws CoinFlip__TransferFailed if the prize transfer fails.
     */
    function claimPrize() external nonReentrant {
        uint256 amount = unclaimedPrizes[msg.sender];
        if (amount == 0) revert CoinFlip__NoPrizeToClaim();

        unclaimedPrizes[msg.sender] = 0; // Prevent re-entrancy
        (bool success,) = msg.sender.call{value: amount}("");
        if (!success) {
            unclaimedPrizes[msg.sender] = amount; // Restore balance
            emit TransferPrizeFailed(msg.sender, amount);
            revert CoinFlip__TransferFailed();
        }

        emit PrizeClaimed(msg.sender, amount);
    }

    /**
     * @notice Retries a failed prize transfer for a player.
     * @dev Can only be called by the contract owner.
     *      Uses re-entrancy protection.
     * @param player The address of the player to whom the prize should be sent.
     * @custom:throws CoinFlip__NoPrizeToClaim if the player has no unclaimed prize.
     * @custom:throws CoinFlip__TransferFailed if the transfer attempt fails.
     */
    function retryFailedTransfer(address player) external onlyOwner nonReentrant {
        uint256 amount = unclaimedPrizes[player];
        if (amount == 0) revert CoinFlip__NoPrizeToClaim();

        unclaimedPrizes[player] = 0;
        (bool success,) = player.call{value: amount}("");
        if (!success) {
            unclaimedPrizes[player] = amount;
            revert CoinFlip__TransferFailed();
        }

        emit PrizeClaimed(player, amount);
        emit PrizeTransferRetried(player, amount);
    }

    /**
     * @notice Withdraws collected fees to a specified recipient.
     * @dev Can only be called by the contract owner.
     *      Ensures the requested amount does not exceed collected fees.
     * @param recipient The address that will receive the withdrawn fees.
     * @param amount The amount to withdraw.
     * @custom:throws CoinFlip__NoFeesToWithdraw if the requested amount is zero or exceeds collected fees.
     * @custom:throws CoinFlip__TransferFailed if the transfer to the recipient fails.
     */
    function withdrawFees(address payable recipient, uint256 amount) external onlyOwner nonReentrant {
        if (amount == 0 || amount > collectedFees) revert CoinFlip__NoFeesToWithdraw();

        collectedFees -= amount;
        (bool success,) = recipient.call{value: amount}("");
        if (!success) {
            collectedFees += amount; // Restore balance
            revert CoinFlip__TransferFailed();
        }

        emit FeesWithdrawn(recipient, amount);
    }

    /**
     * @notice Updates the fee percentage for the game.
     * @dev Can only be called by the contract owner.
     *      The fee cannot exceed 10%.
     * @param newFee The new fee percentage to set.
     * @return The updated fee percentage.
     * @custom:throws CoinFlip__FeeTooHigh if the new fee is greater than 10%.
     */
    function setFeePercent(uint256 newFee) external onlyOwner returns (uint256) {
        if (newFee > 10) revert CoinFlip__FeeTooHigh();
        feePercent = newFee;
        emit FeeUpdated(newFee);
        return feePercent;
    }

    /**
     * @notice Updates the minimum bet amount required to create a match.
     * @dev Can only be called by the contract owner.
     * @param amount The new minimum bet amount.
     */
    function setMinimumBetAmount(uint256 amount) external onlyOwner {
        s_minimumBetAmount = amount;
        emit MinimumBetAmountUpdated(amount);
    }

    /**
     * @notice Sets the timeout duration for identifying stuck matches.
     * @dev Only callable by the contract owner. The timeout is specified in minutes.
     * @param timeOut The new timeout duration in minutes.
     */
    function setTimeOutForStuckMatches(uint256 timeOut) external onlyOwner {
        if (timeOut < 60) revert NotValidTimeOut();
        timeOutForStuckMatches = timeOut * 1 minutes; // Ensure it's converted to seconds
        emit TimeOutUpdated(timeOutForStuckMatches); // Optional: Emit an event for transparency
    }

    /**
     * @notice Prevents direct ETH transfers to the contract.
     * @dev Always reverts with a message.
     */
    receive() external payable {
        revert("Direct ETH transfers not allowed");
    }

    /**
     * @notice Prevents interactions with the contract through unknown functions.
     * @dev Always reverts with a message.
     */
    fallback() external payable {
        revert("Fallback function triggered");
    }

    /*//////////////////////////////////////////////////////////////
                            GETTER FUNCTIONS
    //////////////////////////////////////////////////////////////*/
    /**
     * @notice Returns all match IDs associated with a given player.
     * @param player The address of the player.
     * @return An array of match IDs the player has participated in.
     */
    function getMatchesByPlayer(address player) external view returns (uint256[] memory) {
        return playerMatches[player];
    }

    /**
     * @notice Retrieves details of a specific match.
     * @param matchId The ID of the match to retrieve.
     * @return The match data including players, bet amount, and result.
     */
    function getMatch(uint256 matchId) external view returns (Match memory) {
        return matches[matchId];
    }

    /**
     * @notice Gets the result of a specific match.
     * @param matchId The ID of the match.
     * @return A boolean indicating the result of the match (true for heads, false for tails).
     */
    function getMatchResult(uint256 matchId) external view returns (bool) {
        return matches[matchId].result;
    }

    /**
     * @notice Retrieves the current state of a specific match.
     * @param matchId The ID of the match.
     * @return The match state (WAITING_FOR_PLAYER, FLIPPING_COIN, CANCELED, or ENDED).
     */
    function getMatchState(uint256 matchId) external view returns (MatchState) {
        return matches[matchId].state;
    }

    /**
     * @notice Retrieves the winner of a specific match.
     * @param matchId The ID of the match.
     * @return The address of the winner or address(0) if the match is not yet decided.
     */
    function getMatchWinner(uint256 matchId) external view returns (address) {
        return matches[matchId].winner;
    }

    /**
     * @notice Returns the current match ID.
     * @return The latest match ID that has been created.
     */
    function getCurrentMatchId() external view returns (uint256) {
        return s_currentMatchId;
    }

    /**
     * @notice Retrieves the current fee percentage applied to match winnings.
     * @return The fee percentage as an integer (e.g., 5 for 5%).
     */
    function getFeePercent() external view returns (uint256) {
        return feePercent;
    }

    /**
     * @notice Retrieves the refund balance of a given player.
     * @param player The address of the player.
     * @return The refund amount available for the player.
     */
    function getRefunds(address player) external view returns (uint256) {
        return refunds[player];
    }

    /**
     * @notice Retrieves the total collected fees from matches.
     * @return The total amount of collected fees in the contract.
     */
    function getCollectedFees() external view returns (uint256) {
        return collectedFees;
    }

    /**
     * @notice Retrieves the minimum bet amount required to create a match.
     * @return The minimum bet amount in wei.
     */
    function getBetAmount() external view returns (uint256) {
        return s_minimumBetAmount;
    }
}
