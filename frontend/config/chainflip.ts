//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// AggregatorV3Interface
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const aggregatorV3InterfaceAbi = [
  {
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'description',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '_roundId', internalType: 'uint80', type: 'uint80' }],
    name: 'getRoundData',
    outputs: [
      { name: 'roundId', internalType: 'uint80', type: 'uint80' },
      { name: 'answer', internalType: 'int256', type: 'int256' },
      { name: 'startedAt', internalType: 'uint256', type: 'uint256' },
      { name: 'updatedAt', internalType: 'uint256', type: 'uint256' },
      { name: 'answeredInRound', internalType: 'uint80', type: 'uint80' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'latestRoundData',
    outputs: [
      { name: 'roundId', internalType: 'uint80', type: 'uint80' },
      { name: 'answer', internalType: 'int256', type: 'int256' },
      { name: 'startedAt', internalType: 'uint256', type: 'uint256' },
      { name: 'updatedAt', internalType: 'uint256', type: 'uint256' },
      { name: 'answeredInRound', internalType: 'uint80', type: 'uint80' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'version',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// AutomationBase
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const automationBaseAbi = [
  { type: 'error', inputs: [], name: 'OnlySimulatedBackend' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// AutomationCompatible
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const automationCompatibleAbi = [
  {
    type: 'function',
    inputs: [{ name: 'checkData', internalType: 'bytes', type: 'bytes' }],
    name: 'checkUpkeep',
    outputs: [
      { name: 'upkeepNeeded', internalType: 'bool', type: 'bool' },
      { name: 'performData', internalType: 'bytes', type: 'bytes' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'performData', internalType: 'bytes', type: 'bytes' }],
    name: 'performUpkeep',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  { type: 'error', inputs: [], name: 'OnlySimulatedBackend' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// AutomationCompatibleInterface
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const automationCompatibleInterfaceAbi = [
  {
    type: 'function',
    inputs: [{ name: 'checkData', internalType: 'bytes', type: 'bytes' }],
    name: 'checkUpkeep',
    outputs: [
      { name: 'upkeepNeeded', internalType: 'bool', type: 'bool' },
      { name: 'performData', internalType: 'bytes', type: 'bytes' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'performData', internalType: 'bytes', type: 'bytes' }],
    name: 'performUpkeep',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ChainFlip
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const chainFlipAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'minimumBetAmount', internalType: 'uint256', type: 'uint256' },
      { name: 'subscriptionId', internalType: 'uint256', type: 'uint256' },
      { name: 'vrfCoordinator', internalType: 'address', type: 'address' },
      { name: 'keyHash', internalType: 'bytes32', type: 'bytes32' },
      { name: 'callbackGasLimit', internalType: 'uint32', type: 'uint32' },
    ],
    stateMutability: 'nonpayable',
  },
  { type: 'fallback', stateMutability: 'payable' },
  { type: 'receive', stateMutability: 'payable' },
  {
    type: 'function',
    inputs: [],
    name: 'acceptOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'activeMatches',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'matchId', internalType: 'uint256', type: 'uint256' }],
    name: 'cancelMatch',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'bytes', type: 'bytes' }],
    name: 'checkUpkeep',
    outputs: [
      { name: 'upkeepNeeded', internalType: 'bool', type: 'bool' },
      { name: 'performData', internalType: 'bytes', type: 'bytes' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'claimPrize',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'choice', internalType: 'bool', type: 'bool' }],
    name: 'createMatch',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getActiveMatches',
    outputs: [
      {
        name: '',
        internalType: 'struct ChainFlip.Match[]',
        type: 'tuple[]',
        components: [
          { name: 'id', internalType: 'uint256', type: 'uint256' },
          { name: 'startTime', internalType: 'uint256', type: 'uint256' },
          { name: 'endTime', internalType: 'uint256', type: 'uint256' },
          { name: 'betAmount', internalType: 'uint256', type: 'uint256' },
          { name: 'vrfRequestId', internalType: 'uint256', type: 'uint256' },
          { name: 'player1', internalType: 'address', type: 'address' },
          { name: 'player2', internalType: 'address', type: 'address' },
          { name: 'winner', internalType: 'address', type: 'address' },
          { name: 'result', internalType: 'bool', type: 'bool' },
          { name: 'player1Choice', internalType: 'bool', type: 'bool' },
          { name: 'player2Choice', internalType: 'bool', type: 'bool' },
          {
            name: 'state',
            internalType: 'enum ChainFlip.MatchState',
            type: 'uint8',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getCollectedFees',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getCurrentMatchId',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getFeePercent',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'matchId', internalType: 'uint256', type: 'uint256' }],
    name: 'getMatch',
    outputs: [
      {
        name: '',
        internalType: 'struct ChainFlip.Match',
        type: 'tuple',
        components: [
          { name: 'id', internalType: 'uint256', type: 'uint256' },
          { name: 'startTime', internalType: 'uint256', type: 'uint256' },
          { name: 'endTime', internalType: 'uint256', type: 'uint256' },
          { name: 'betAmount', internalType: 'uint256', type: 'uint256' },
          { name: 'vrfRequestId', internalType: 'uint256', type: 'uint256' },
          { name: 'player1', internalType: 'address', type: 'address' },
          { name: 'player2', internalType: 'address', type: 'address' },
          { name: 'winner', internalType: 'address', type: 'address' },
          { name: 'result', internalType: 'bool', type: 'bool' },
          { name: 'player1Choice', internalType: 'bool', type: 'bool' },
          { name: 'player2Choice', internalType: 'bool', type: 'bool' },
          {
            name: 'state',
            internalType: 'enum ChainFlip.MatchState',
            type: 'uint8',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'matchId', internalType: 'uint256', type: 'uint256' }],
    name: 'getMatchResult',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'matchId', internalType: 'uint256', type: 'uint256' }],
    name: 'getMatchState',
    outputs: [
      { name: '', internalType: 'enum ChainFlip.MatchState', type: 'uint8' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'matchId', internalType: 'uint256', type: 'uint256' }],
    name: 'getMatchWinner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'player', internalType: 'address', type: 'address' }],
    name: 'getMatchesByPlayer',
    outputs: [{ name: '', internalType: 'uint256[]', type: 'uint256[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'offset', internalType: 'uint256', type: 'uint256' },
      { name: 'limit', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getMatchesPaginated',
    outputs: [
      {
        name: '',
        internalType: 'struct ChainFlip.Match[]',
        type: 'tuple[]',
        components: [
          { name: 'id', internalType: 'uint256', type: 'uint256' },
          { name: 'startTime', internalType: 'uint256', type: 'uint256' },
          { name: 'endTime', internalType: 'uint256', type: 'uint256' },
          { name: 'betAmount', internalType: 'uint256', type: 'uint256' },
          { name: 'vrfRequestId', internalType: 'uint256', type: 'uint256' },
          { name: 'player1', internalType: 'address', type: 'address' },
          { name: 'player2', internalType: 'address', type: 'address' },
          { name: 'winner', internalType: 'address', type: 'address' },
          { name: 'result', internalType: 'bool', type: 'bool' },
          { name: 'player1Choice', internalType: 'bool', type: 'bool' },
          { name: 'player2Choice', internalType: 'bool', type: 'bool' },
          {
            name: 'state',
            internalType: 'enum ChainFlip.MatchState',
            type: 'uint8',
          },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getMinimumBetAmount',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'player', internalType: 'address', type: 'address' }],
    name: 'getPlayerStats',
    outputs: [
      { name: 'totalMatches', internalType: 'uint256', type: 'uint256' },
      { name: 'totalWins', internalType: 'uint256', type: 'uint256' },
      { name: 'totalLosses', internalType: 'uint256', type: 'uint256' },
      { name: 'totalCanceled', internalType: 'uint256', type: 'uint256' },
      {
        name: 'totalAmountWonByPlayer',
        internalType: 'uint256',
        type: 'uint256',
      },
      {
        name: 'totalAmountInvestedByPlayer',
        internalType: 'uint256',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'player', internalType: 'address', type: 'address' }],
    name: 'getRefunds',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getTimeOutForStuckMatches',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getTopWinners',
    outputs: [
      { name: 'allPlayers', internalType: 'address[]', type: 'address[]' },
      { name: 'allWins', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'player', internalType: 'address', type: 'address' }],
    name: 'getTotalAmountInvested',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'player', internalType: 'address', type: 'address' }],
    name: 'getTotalAmountWon',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getTotalWinnings',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'isPlayer',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'matchId', internalType: 'uint256', type: 'uint256' }],
    name: 'joinMatch',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'matchIndexInActive',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'matches',
    outputs: [
      { name: 'id', internalType: 'uint256', type: 'uint256' },
      { name: 'startTime', internalType: 'uint256', type: 'uint256' },
      { name: 'endTime', internalType: 'uint256', type: 'uint256' },
      { name: 'betAmount', internalType: 'uint256', type: 'uint256' },
      { name: 'vrfRequestId', internalType: 'uint256', type: 'uint256' },
      { name: 'player1', internalType: 'address', type: 'address' },
      { name: 'player2', internalType: 'address', type: 'address' },
      { name: 'winner', internalType: 'address', type: 'address' },
      { name: 'result', internalType: 'bool', type: 'bool' },
      { name: 'player1Choice', internalType: 'bool', type: 'bool' },
      { name: 'player2Choice', internalType: 'bool', type: 'bool' },
      {
        name: 'state',
        internalType: 'enum ChainFlip.MatchState',
        type: 'uint8',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'performData', internalType: 'bytes', type: 'bytes' }],
    name: 'performUpkeep',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'playerMatches',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'playerWins',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'players',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'requestId', internalType: 'uint256', type: 'uint256' },
      { name: 'randomWords', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'rawFulfillRandomWords',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'refunds',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'requestIdToMatchId',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'player', internalType: 'address', type: 'address' }],
    name: 'retryFailedTransfer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 's_vrfCoordinator',
    outputs: [
      {
        name: '',
        internalType: 'contract IVRFCoordinatorV2Plus',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_vrfCoordinator', internalType: 'address', type: 'address' },
    ],
    name: 'setCoordinator',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'newFee', internalType: 'uint256', type: 'uint256' }],
    name: 'setFeePercent',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'amount', internalType: 'uint256', type: 'uint256' }],
    name: 'setMinimumBetAmount',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'timeOut', internalType: 'uint256', type: 'uint256' }],
    name: 'setTimeOutForStuckMatches',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'totalAmountInvested',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'totalAmountWon',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'to', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'unclaimedPrizes',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'recipient', internalType: 'address payable', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'withdrawFees',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'withdrawRefund',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'vrfCoordinator',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'CoordinatorSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'newFee',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'FeeUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'recipient',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'FeesWithdrawn',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'matchId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'player1',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'MatchCanceledByPlayer',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'matchId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'requestId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
    ],
    name: 'MatchCanceledByUpkeep',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'matchId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'startTime',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'player1',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'choice', internalType: 'bool', type: 'bool', indexed: false },
      {
        name: 'betAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'MatchCreated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'matchId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'winner',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'prize',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'endTime',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'MatchEnded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'matchId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'player2',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      { name: 'choice', internalType: 'bool', type: 'bool', indexed: false },
      {
        name: 'betAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'MatchJoined',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'matchId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'winner',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      {
        name: 'outcome',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'MatchResult',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'matchId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'state',
        internalType: 'enum ChainFlip.MatchState',
        type: 'uint8',
        indexed: false,
      },
    ],
    name: 'MatchSkipped',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'newAmount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'MinimumBetAmountUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'OwnershipTransferRequested',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'player',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'PrizeClaimed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'player',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'PrizeTransferRetried',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'player',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'RefundFailed',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'player',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'RefundIssued',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'requestId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'matchId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'numWords',
        internalType: 'uint32',
        type: 'uint32',
        indexed: false,
      },
    ],
    name: 'RequestSent',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'newTimeOut',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'TimeOutUpdated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'player',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'TransferPrize',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'player',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'TransferPrizeFailed',
  },
  { type: 'error', inputs: [], name: 'CoinFlip__CantJoinYourOwnGame' },
  { type: 'error', inputs: [], name: 'CoinFlip__FeeTooHigh' },
  { type: 'error', inputs: [], name: 'CoinFlip__FeeTooLow' },
  { type: 'error', inputs: [], name: 'CoinFlip__InvalidBetAmount' },
  { type: 'error', inputs: [], name: 'CoinFlip__InvalidMatchId' },
  { type: 'error', inputs: [], name: 'CoinFlip__InvalidMatchState' },
  { type: 'error', inputs: [], name: 'CoinFlip__InvalidMinimumBetAmount' },
  { type: 'error', inputs: [], name: 'CoinFlip__MatchAlreadyEnded' },
  { type: 'error', inputs: [], name: 'CoinFlip__MatchDoesNotExist' },
  { type: 'error', inputs: [], name: 'CoinFlip__NoFeesToWithdraw' },
  { type: 'error', inputs: [], name: 'CoinFlip__NoPrizeToClaim' },
  { type: 'error', inputs: [], name: 'CoinFlip__NoRefundToClaim' },
  { type: 'error', inputs: [], name: 'CoinFlip__NotTheMatchCreator' },
  { type: 'error', inputs: [], name: 'CoinFlip__NotValidTimeOut' },
  { type: 'error', inputs: [], name: 'CoinFlip__TransferFailed' },
  {
    type: 'error',
    inputs: [
      { name: 'have', internalType: 'address', type: 'address' },
      { name: 'want', internalType: 'address', type: 'address' },
    ],
    name: 'OnlyCoordinatorCanFulfill',
  },
  {
    type: 'error',
    inputs: [
      { name: 'have', internalType: 'address', type: 'address' },
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'coordinator', internalType: 'address', type: 'address' },
    ],
    name: 'OnlyOwnerOrCoordinator',
  },
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
  { type: 'error', inputs: [], name: 'ZeroAddress' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ConfirmedOwner
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const confirmedOwnerAbi = [
  {
    type: 'constructor',
    inputs: [{ name: 'newOwner', internalType: 'address', type: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'acceptOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'to', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'OwnershipTransferRequested',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'OwnershipTransferred',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ConfirmedOwnerWithProposal
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const confirmedOwnerWithProposalAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: 'newOwner', internalType: 'address', type: 'address' },
      { name: 'pendingOwner', internalType: 'address', type: 'address' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'acceptOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'to', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'OwnershipTransferRequested',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'OwnershipTransferred',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ERC20
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc20Abi = [
  {
    type: 'function',
    inputs: [],
    name: 'DOMAIN_SEPARATOR',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'address', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'nonces',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'deadline', internalType: 'uint256', type: 'uint256' },
      { name: 'v', internalType: 'uint8', type: 'uint8' },
      { name: 'r', internalType: 'bytes32', type: 'bytes32' },
      { name: 's', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'permit',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'spender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Transfer',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ERC677Receiver
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const erc677ReceiverAbi = [
  {
    type: 'function',
    inputs: [
      { name: '_sender', internalType: 'address', type: 'address' },
      { name: '_value', internalType: 'uint256', type: 'uint256' },
      { name: '_data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'onTokenTransfer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IERC677Receiver
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ierc677ReceiverAbi = [
  {
    type: 'function',
    inputs: [
      { name: 'sender', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'onTokenTransfer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IMulticall3
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iMulticall3Abi = [
  {
    type: 'function',
    inputs: [
      {
        name: 'calls',
        internalType: 'struct IMulticall3.Call[]',
        type: 'tuple[]',
        components: [
          { name: 'target', internalType: 'address', type: 'address' },
          { name: 'callData', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    name: 'aggregate',
    outputs: [
      { name: 'blockNumber', internalType: 'uint256', type: 'uint256' },
      { name: 'returnData', internalType: 'bytes[]', type: 'bytes[]' },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'calls',
        internalType: 'struct IMulticall3.Call3[]',
        type: 'tuple[]',
        components: [
          { name: 'target', internalType: 'address', type: 'address' },
          { name: 'allowFailure', internalType: 'bool', type: 'bool' },
          { name: 'callData', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    name: 'aggregate3',
    outputs: [
      {
        name: 'returnData',
        internalType: 'struct IMulticall3.Result[]',
        type: 'tuple[]',
        components: [
          { name: 'success', internalType: 'bool', type: 'bool' },
          { name: 'returnData', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'calls',
        internalType: 'struct IMulticall3.Call3Value[]',
        type: 'tuple[]',
        components: [
          { name: 'target', internalType: 'address', type: 'address' },
          { name: 'allowFailure', internalType: 'bool', type: 'bool' },
          { name: 'value', internalType: 'uint256', type: 'uint256' },
          { name: 'callData', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    name: 'aggregate3Value',
    outputs: [
      {
        name: 'returnData',
        internalType: 'struct IMulticall3.Result[]',
        type: 'tuple[]',
        components: [
          { name: 'success', internalType: 'bool', type: 'bool' },
          { name: 'returnData', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'calls',
        internalType: 'struct IMulticall3.Call[]',
        type: 'tuple[]',
        components: [
          { name: 'target', internalType: 'address', type: 'address' },
          { name: 'callData', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    name: 'blockAndAggregate',
    outputs: [
      { name: 'blockNumber', internalType: 'uint256', type: 'uint256' },
      { name: 'blockHash', internalType: 'bytes32', type: 'bytes32' },
      {
        name: 'returnData',
        internalType: 'struct IMulticall3.Result[]',
        type: 'tuple[]',
        components: [
          { name: 'success', internalType: 'bool', type: 'bool' },
          { name: 'returnData', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getBasefee',
    outputs: [{ name: 'basefee', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'blockNumber', internalType: 'uint256', type: 'uint256' }],
    name: 'getBlockHash',
    outputs: [{ name: 'blockHash', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getBlockNumber',
    outputs: [
      { name: 'blockNumber', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getChainId',
    outputs: [{ name: 'chainid', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getCurrentBlockCoinbase',
    outputs: [{ name: 'coinbase', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getCurrentBlockDifficulty',
    outputs: [{ name: 'difficulty', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getCurrentBlockGasLimit',
    outputs: [{ name: 'gaslimit', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getCurrentBlockTimestamp',
    outputs: [{ name: 'timestamp', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'addr', internalType: 'address', type: 'address' }],
    name: 'getEthBalance',
    outputs: [{ name: 'balance', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'getLastBlockHash',
    outputs: [{ name: 'blockHash', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'requireSuccess', internalType: 'bool', type: 'bool' },
      {
        name: 'calls',
        internalType: 'struct IMulticall3.Call[]',
        type: 'tuple[]',
        components: [
          { name: 'target', internalType: 'address', type: 'address' },
          { name: 'callData', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    name: 'tryAggregate',
    outputs: [
      {
        name: 'returnData',
        internalType: 'struct IMulticall3.Result[]',
        type: 'tuple[]',
        components: [
          { name: 'success', internalType: 'bool', type: 'bool' },
          { name: 'returnData', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'requireSuccess', internalType: 'bool', type: 'bool' },
      {
        name: 'calls',
        internalType: 'struct IMulticall3.Call[]',
        type: 'tuple[]',
        components: [
          { name: 'target', internalType: 'address', type: 'address' },
          { name: 'callData', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    name: 'tryBlockAndAggregate',
    outputs: [
      { name: 'blockNumber', internalType: 'uint256', type: 'uint256' },
      { name: 'blockHash', internalType: 'bytes32', type: 'bytes32' },
      {
        name: 'returnData',
        internalType: 'struct IMulticall3.Result[]',
        type: 'tuple[]',
        components: [
          { name: 'success', internalType: 'bool', type: 'bool' },
          { name: 'returnData', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    stateMutability: 'payable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IOwnable
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const iOwnableAbi = [
  {
    type: 'function',
    inputs: [],
    name: 'acceptOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'recipient', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IVRFCoordinatorV2Plus
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ivrfCoordinatorV2PlusAbi = [
  {
    type: 'function',
    inputs: [{ name: 'subId', internalType: 'uint256', type: 'uint256' }],
    name: 'acceptSubscriptionOwnerTransfer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'subId', internalType: 'uint256', type: 'uint256' },
      { name: 'consumer', internalType: 'address', type: 'address' },
    ],
    name: 'addConsumer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'subId', internalType: 'uint256', type: 'uint256' },
      { name: 'to', internalType: 'address', type: 'address' },
    ],
    name: 'cancelSubscription',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'createSubscription',
    outputs: [{ name: 'subId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'subId', internalType: 'uint256', type: 'uint256' }],
    name: 'fundSubscriptionWithNative',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'startIndex', internalType: 'uint256', type: 'uint256' },
      { name: 'maxCount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getActiveSubscriptionIds',
    outputs: [{ name: '', internalType: 'uint256[]', type: 'uint256[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'subId', internalType: 'uint256', type: 'uint256' }],
    name: 'getSubscription',
    outputs: [
      { name: 'balance', internalType: 'uint96', type: 'uint96' },
      { name: 'nativeBalance', internalType: 'uint96', type: 'uint96' },
      { name: 'reqCount', internalType: 'uint64', type: 'uint64' },
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'consumers', internalType: 'address[]', type: 'address[]' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'subId', internalType: 'uint256', type: 'uint256' }],
    name: 'pendingRequestExists',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'subId', internalType: 'uint256', type: 'uint256' },
      { name: 'consumer', internalType: 'address', type: 'address' },
    ],
    name: 'removeConsumer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: 'req',
        internalType: 'struct VRFV2PlusClient.RandomWordsRequest',
        type: 'tuple',
        components: [
          { name: 'keyHash', internalType: 'bytes32', type: 'bytes32' },
          { name: 'subId', internalType: 'uint256', type: 'uint256' },
          {
            name: 'requestConfirmations',
            internalType: 'uint16',
            type: 'uint16',
          },
          { name: 'callbackGasLimit', internalType: 'uint32', type: 'uint32' },
          { name: 'numWords', internalType: 'uint32', type: 'uint32' },
          { name: 'extraArgs', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    name: 'requestRandomWords',
    outputs: [{ name: 'requestId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'subId', internalType: 'uint256', type: 'uint256' },
      { name: 'newOwner', internalType: 'address', type: 'address' },
    ],
    name: 'requestSubscriptionOwnerTransfer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IVRFMigratableConsumerV2Plus
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ivrfMigratableConsumerV2PlusAbi = [
  {
    type: 'function',
    inputs: [
      { name: 'vrfCoordinator', internalType: 'address', type: 'address' },
    ],
    name: 'setCoordinator',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'vrfCoordinator',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'CoordinatorSet',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// IVRFSubscriptionV2Plus
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const ivrfSubscriptionV2PlusAbi = [
  {
    type: 'function',
    inputs: [{ name: 'subId', internalType: 'uint256', type: 'uint256' }],
    name: 'acceptSubscriptionOwnerTransfer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'subId', internalType: 'uint256', type: 'uint256' },
      { name: 'consumer', internalType: 'address', type: 'address' },
    ],
    name: 'addConsumer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'subId', internalType: 'uint256', type: 'uint256' },
      { name: 'to', internalType: 'address', type: 'address' },
    ],
    name: 'cancelSubscription',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'createSubscription',
    outputs: [{ name: 'subId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'subId', internalType: 'uint256', type: 'uint256' }],
    name: 'fundSubscriptionWithNative',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'startIndex', internalType: 'uint256', type: 'uint256' },
      { name: 'maxCount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getActiveSubscriptionIds',
    outputs: [{ name: '', internalType: 'uint256[]', type: 'uint256[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'subId', internalType: 'uint256', type: 'uint256' }],
    name: 'getSubscription',
    outputs: [
      { name: 'balance', internalType: 'uint96', type: 'uint96' },
      { name: 'nativeBalance', internalType: 'uint96', type: 'uint96' },
      { name: 'reqCount', internalType: 'uint64', type: 'uint64' },
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'consumers', internalType: 'address[]', type: 'address[]' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'subId', internalType: 'uint256', type: 'uint256' }],
    name: 'pendingRequestExists',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'subId', internalType: 'uint256', type: 'uint256' },
      { name: 'consumer', internalType: 'address', type: 'address' },
    ],
    name: 'removeConsumer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'subId', internalType: 'uint256', type: 'uint256' },
      { name: 'newOwner', internalType: 'address', type: 'address' },
    ],
    name: 'requestSubscriptionOwnerTransfer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LinkToken
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const linkTokenAbi = [
  { type: 'constructor', inputs: [], stateMutability: 'nonpayable' },
  {
    type: 'function',
    inputs: [],
    name: 'DOMAIN_SEPARATOR',
    outputs: [{ name: '', internalType: 'bytes32', type: 'bytes32' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: '', internalType: 'address', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ name: '', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'address', type: 'address' }],
    name: 'nonces',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'deadline', internalType: 'uint256', type: 'uint256' },
      { name: 'v', internalType: 'uint8', type: 'uint8' },
      { name: 'r', internalType: 'bytes32', type: 'bytes32' },
      { name: 's', internalType: 'bytes32', type: 'bytes32' },
    ],
    name: 'permit',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: '', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_to', internalType: 'address', type: 'address' },
      { name: '_value', internalType: 'uint256', type: 'uint256' },
      { name: '_data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'transferAndCall',
    outputs: [{ name: 'success', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'spender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Approval',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'Transfer',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
      {
        name: 'value',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      { name: 'data', internalType: 'bytes', type: 'bytes', indexed: false },
    ],
    name: 'Transfer',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LinkTokenInterface
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const linkTokenInterfaceAbi = [
  {
    type: 'function',
    inputs: [
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'spender', internalType: 'address', type: 'address' },
    ],
    name: 'allowance',
    outputs: [{ name: 'remaining', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ name: 'success', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: 'balance', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'decimals',
    outputs: [{ name: 'decimalPlaces', internalType: 'uint8', type: 'uint8' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'addedValue', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'decreaseApproval',
    outputs: [{ name: 'success', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'spender', internalType: 'address', type: 'address' },
      { name: 'subtractedValue', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'increaseApproval',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'name',
    outputs: [{ name: 'tokenName', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'symbol',
    outputs: [{ name: 'tokenSymbol', internalType: 'string', type: 'string' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'totalSupply',
    outputs: [
      { name: 'totalTokensIssued', internalType: 'uint256', type: 'uint256' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transfer',
    outputs: [{ name: 'success', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'transferAndCall',
    outputs: [{ name: 'success', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'from', internalType: 'address', type: 'address' },
      { name: 'to', internalType: 'address', type: 'address' },
      { name: 'value', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'transferFrom',
    outputs: [{ name: 'success', internalType: 'bool', type: 'bool' }],
    stateMutability: 'nonpayable',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// ReentrancyGuard
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const reentrancyGuardAbi = [
  { type: 'error', inputs: [], name: 'ReentrancyGuardReentrantCall' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// SubscriptionAPI
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const subscriptionApiAbi = [
  {
    type: 'function',
    inputs: [],
    name: 'LINK',
    outputs: [
      {
        name: '',
        internalType: 'contract LinkTokenInterface',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'LINK_NATIVE_FEED',
    outputs: [
      {
        name: '',
        internalType: 'contract AggregatorV3Interface',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MAX_CONSUMERS',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'acceptOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'subId', internalType: 'uint256', type: 'uint256' }],
    name: 'acceptSubscriptionOwnerTransfer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'subId', internalType: 'uint256', type: 'uint256' },
      { name: 'consumer', internalType: 'address', type: 'address' },
    ],
    name: 'addConsumer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'subId', internalType: 'uint256', type: 'uint256' },
      { name: 'to', internalType: 'address', type: 'address' },
    ],
    name: 'cancelSubscription',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'createSubscription',
    outputs: [{ name: 'subId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'subId', internalType: 'uint256', type: 'uint256' }],
    name: 'fundSubscriptionWithNative',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'startIndex', internalType: 'uint256', type: 'uint256' },
      { name: 'maxCount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getActiveSubscriptionIds',
    outputs: [{ name: 'ids', internalType: 'uint256[]', type: 'uint256[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'subId', internalType: 'uint256', type: 'uint256' }],
    name: 'getSubscription',
    outputs: [
      { name: 'balance', internalType: 'uint96', type: 'uint96' },
      { name: 'nativeBalance', internalType: 'uint96', type: 'uint96' },
      { name: 'reqCount', internalType: 'uint64', type: 'uint64' },
      { name: 'subOwner', internalType: 'address', type: 'address' },
      { name: 'consumers', internalType: 'address[]', type: 'address[]' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'onTokenTransfer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'subId', internalType: 'uint256', type: 'uint256' }],
    name: 'ownerCancelSubscription',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'subId', internalType: 'uint256', type: 'uint256' }],
    name: 'pendingRequestExists',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'to', internalType: 'address', type: 'address' }],
    name: 'recoverFunds',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'to', internalType: 'address payable', type: 'address' }],
    name: 'recoverNativeFunds',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'subId', internalType: 'uint256', type: 'uint256' },
      { name: 'consumer', internalType: 'address', type: 'address' },
    ],
    name: 'removeConsumer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'subId', internalType: 'uint256', type: 'uint256' },
      { name: 'newOwner', internalType: 'address', type: 'address' },
    ],
    name: 'requestSubscriptionOwnerTransfer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 's_config',
    outputs: [
      {
        name: 'minimumRequestConfirmations',
        internalType: 'uint16',
        type: 'uint16',
      },
      { name: 'maxGasLimit', internalType: 'uint32', type: 'uint32' },
      { name: 'reentrancyLock', internalType: 'bool', type: 'bool' },
      { name: 'stalenessSeconds', internalType: 'uint32', type: 'uint32' },
      {
        name: 'gasAfterPaymentCalculation',
        internalType: 'uint32',
        type: 'uint32',
      },
      {
        name: 'fulfillmentFlatFeeNativePPM',
        internalType: 'uint32',
        type: 'uint32',
      },
      {
        name: 'fulfillmentFlatFeeLinkDiscountPPM',
        internalType: 'uint32',
        type: 'uint32',
      },
      { name: 'nativePremiumPercentage', internalType: 'uint8', type: 'uint8' },
      { name: 'linkPremiumPercentage', internalType: 'uint8', type: 'uint8' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 's_currentSubNonce',
    outputs: [{ name: '', internalType: 'uint64', type: 'uint64' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 's_totalBalance',
    outputs: [{ name: '', internalType: 'uint96', type: 'uint96' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 's_totalNativeBalance',
    outputs: [{ name: '', internalType: 'uint96', type: 'uint96' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'link', internalType: 'address', type: 'address' },
      { name: 'linkNativeFeed', internalType: 'address', type: 'address' },
    ],
    name: 'setLINKAndLINKNativeFeed',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'to', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'recipient', internalType: 'address', type: 'address' }],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'recipient', internalType: 'address payable', type: 'address' },
    ],
    name: 'withdrawNative',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'to', internalType: 'address', type: 'address', indexed: false },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'FundsRecovered',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'to', internalType: 'address', type: 'address', indexed: false },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'NativeFundsRecovered',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'OwnershipTransferRequested',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'subId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      { name: 'to', internalType: 'address', type: 'address', indexed: false },
      {
        name: 'amountLink',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'amountNative',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'SubscriptionCanceled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'subId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'consumer',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'SubscriptionConsumerAdded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'subId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'consumer',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'SubscriptionConsumerRemoved',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'subId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'SubscriptionCreated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'subId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'oldBalance',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'newBalance',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'SubscriptionFunded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'subId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'oldNativeBalance',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'newNativeBalance',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'SubscriptionFundedWithNative',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'subId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'from',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      { name: 'to', internalType: 'address', type: 'address', indexed: false },
    ],
    name: 'SubscriptionOwnerTransferRequested',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'subId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'from',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      { name: 'to', internalType: 'address', type: 'address', indexed: false },
    ],
    name: 'SubscriptionOwnerTransferred',
  },
  {
    type: 'error',
    inputs: [
      { name: 'internalBalance', internalType: 'uint256', type: 'uint256' },
      { name: 'externalBalance', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'BalanceInvariantViolated',
  },
  { type: 'error', inputs: [], name: 'FailedToSendNative' },
  { type: 'error', inputs: [], name: 'FailedToTransferLink' },
  { type: 'error', inputs: [], name: 'IndexOutOfRange' },
  { type: 'error', inputs: [], name: 'InsufficientBalance' },
  { type: 'error', inputs: [], name: 'InvalidCalldata' },
  {
    type: 'error',
    inputs: [
      { name: 'subId', internalType: 'uint256', type: 'uint256' },
      { name: 'consumer', internalType: 'address', type: 'address' },
    ],
    name: 'InvalidConsumer',
  },
  { type: 'error', inputs: [], name: 'InvalidSubscription' },
  { type: 'error', inputs: [], name: 'LinkAlreadySet' },
  { type: 'error', inputs: [], name: 'LinkNotSet' },
  {
    type: 'error',
    inputs: [
      { name: 'proposedOwner', internalType: 'address', type: 'address' },
    ],
    name: 'MustBeRequestedOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'MustBeSubOwner',
  },
  { type: 'error', inputs: [], name: 'OnlyCallableFromLink' },
  { type: 'error', inputs: [], name: 'PendingRequestExists' },
  { type: 'error', inputs: [], name: 'Reentrant' },
  { type: 'error', inputs: [], name: 'TooManyConsumers' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Test
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const testAbi = [
  {
    type: 'function',
    inputs: [],
    name: 'IS_TEST',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'excludeArtifacts',
    outputs: [
      {
        name: 'excludedArtifacts_',
        internalType: 'string[]',
        type: 'string[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'excludeContracts',
    outputs: [
      {
        name: 'excludedContracts_',
        internalType: 'address[]',
        type: 'address[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'excludeSelectors',
    outputs: [
      {
        name: 'excludedSelectors_',
        internalType: 'struct StdInvariant.FuzzSelector[]',
        type: 'tuple[]',
        components: [
          { name: 'addr', internalType: 'address', type: 'address' },
          { name: 'selectors', internalType: 'bytes4[]', type: 'bytes4[]' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'excludeSenders',
    outputs: [
      {
        name: 'excludedSenders_',
        internalType: 'address[]',
        type: 'address[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'failed',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'targetArtifactSelectors',
    outputs: [
      {
        name: 'targetedArtifactSelectors_',
        internalType: 'struct StdInvariant.FuzzArtifactSelector[]',
        type: 'tuple[]',
        components: [
          { name: 'artifact', internalType: 'string', type: 'string' },
          { name: 'selectors', internalType: 'bytes4[]', type: 'bytes4[]' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'targetArtifacts',
    outputs: [
      {
        name: 'targetedArtifacts_',
        internalType: 'string[]',
        type: 'string[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'targetContracts',
    outputs: [
      {
        name: 'targetedContracts_',
        internalType: 'address[]',
        type: 'address[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'targetInterfaces',
    outputs: [
      {
        name: 'targetedInterfaces_',
        internalType: 'struct StdInvariant.FuzzInterface[]',
        type: 'tuple[]',
        components: [
          { name: 'addr', internalType: 'address', type: 'address' },
          { name: 'artifacts', internalType: 'string[]', type: 'string[]' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'targetSelectors',
    outputs: [
      {
        name: 'targetedSelectors_',
        internalType: 'struct StdInvariant.FuzzSelector[]',
        type: 'tuple[]',
        components: [
          { name: 'addr', internalType: 'address', type: 'address' },
          { name: 'selectors', internalType: 'bytes4[]', type: 'bytes4[]' },
        ],
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'targetSenders',
    outputs: [
      {
        name: 'targetedSenders_',
        internalType: 'address[]',
        type: 'address[]',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: '', internalType: 'string', type: 'string', indexed: false },
    ],
    name: 'log',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: '', internalType: 'address', type: 'address', indexed: false },
    ],
    name: 'log_address',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'val',
        internalType: 'uint256[]',
        type: 'uint256[]',
        indexed: false,
      },
    ],
    name: 'log_array',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'val',
        internalType: 'int256[]',
        type: 'int256[]',
        indexed: false,
      },
    ],
    name: 'log_array',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'val',
        internalType: 'address[]',
        type: 'address[]',
        indexed: false,
      },
    ],
    name: 'log_array',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: '', internalType: 'bytes', type: 'bytes', indexed: false },
    ],
    name: 'log_bytes',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: '', internalType: 'bytes32', type: 'bytes32', indexed: false },
    ],
    name: 'log_bytes32',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: '', internalType: 'int256', type: 'int256', indexed: false },
    ],
    name: 'log_int',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'key', internalType: 'string', type: 'string', indexed: false },
      { name: 'val', internalType: 'address', type: 'address', indexed: false },
    ],
    name: 'log_named_address',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'key', internalType: 'string', type: 'string', indexed: false },
      {
        name: 'val',
        internalType: 'uint256[]',
        type: 'uint256[]',
        indexed: false,
      },
    ],
    name: 'log_named_array',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'key', internalType: 'string', type: 'string', indexed: false },
      {
        name: 'val',
        internalType: 'int256[]',
        type: 'int256[]',
        indexed: false,
      },
    ],
    name: 'log_named_array',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'key', internalType: 'string', type: 'string', indexed: false },
      {
        name: 'val',
        internalType: 'address[]',
        type: 'address[]',
        indexed: false,
      },
    ],
    name: 'log_named_array',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'key', internalType: 'string', type: 'string', indexed: false },
      { name: 'val', internalType: 'bytes', type: 'bytes', indexed: false },
    ],
    name: 'log_named_bytes',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'key', internalType: 'string', type: 'string', indexed: false },
      { name: 'val', internalType: 'bytes32', type: 'bytes32', indexed: false },
    ],
    name: 'log_named_bytes32',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'key', internalType: 'string', type: 'string', indexed: false },
      { name: 'val', internalType: 'int256', type: 'int256', indexed: false },
      {
        name: 'decimals',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'log_named_decimal_int',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'key', internalType: 'string', type: 'string', indexed: false },
      { name: 'val', internalType: 'uint256', type: 'uint256', indexed: false },
      {
        name: 'decimals',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'log_named_decimal_uint',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'key', internalType: 'string', type: 'string', indexed: false },
      { name: 'val', internalType: 'int256', type: 'int256', indexed: false },
    ],
    name: 'log_named_int',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'key', internalType: 'string', type: 'string', indexed: false },
      { name: 'val', internalType: 'string', type: 'string', indexed: false },
    ],
    name: 'log_named_string',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'key', internalType: 'string', type: 'string', indexed: false },
      { name: 'val', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'log_named_uint',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: '', internalType: 'string', type: 'string', indexed: false },
    ],
    name: 'log_string',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: '', internalType: 'uint256', type: 'uint256', indexed: false },
    ],
    name: 'log_uint',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: '', internalType: 'bytes', type: 'bytes', indexed: false },
    ],
    name: 'logs',
  },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// VRFConsumerBaseV2Plus
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const vrfConsumerBaseV2PlusAbi = [
  {
    type: 'function',
    inputs: [],
    name: 'acceptOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: 'requestId', internalType: 'uint256', type: 'uint256' },
      { name: 'randomWords', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'rawFulfillRandomWords',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 's_vrfCoordinator',
    outputs: [
      {
        name: '',
        internalType: 'contract IVRFCoordinatorV2Plus',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '_vrfCoordinator', internalType: 'address', type: 'address' },
    ],
    name: 'setCoordinator',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'to', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'vrfCoordinator',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'CoordinatorSet',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'OwnershipTransferRequested',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'error',
    inputs: [
      { name: 'have', internalType: 'address', type: 'address' },
      { name: 'want', internalType: 'address', type: 'address' },
    ],
    name: 'OnlyCoordinatorCanFulfill',
  },
  {
    type: 'error',
    inputs: [
      { name: 'have', internalType: 'address', type: 'address' },
      { name: 'owner', internalType: 'address', type: 'address' },
      { name: 'coordinator', internalType: 'address', type: 'address' },
    ],
    name: 'OnlyOwnerOrCoordinator',
  },
  { type: 'error', inputs: [], name: 'ZeroAddress' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// VRFCoordinatorV2_5Mock
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const vrfCoordinatorV2_5MockAbi = [
  {
    type: 'constructor',
    inputs: [
      { name: '_baseFee', internalType: 'uint96', type: 'uint96' },
      { name: '_gasPrice', internalType: 'uint96', type: 'uint96' },
      { name: '_weiPerUnitLink', internalType: 'int256', type: 'int256' },
    ],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'LINK',
    outputs: [
      {
        name: '',
        internalType: 'contract LinkTokenInterface',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'LINK_NATIVE_FEED',
    outputs: [
      {
        name: '',
        internalType: 'contract AggregatorV3Interface',
        type: 'address',
      },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'MAX_CONSUMERS',
    outputs: [{ name: '', internalType: 'uint16', type: 'uint16' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'acceptOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'subId', internalType: 'uint256', type: 'uint256' }],
    name: 'acceptSubscriptionOwnerTransfer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'subId', internalType: 'uint256', type: 'uint256' },
      { name: 'consumer', internalType: 'address', type: 'address' },
    ],
    name: 'addConsumer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_subId', internalType: 'uint256', type: 'uint256' },
      { name: '_to', internalType: 'address', type: 'address' },
    ],
    name: 'cancelSubscription',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_subId', internalType: 'uint256', type: 'uint256' },
      { name: '_consumer', internalType: 'address', type: 'address' },
    ],
    name: 'consumerIsAdded',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'createSubscription',
    outputs: [{ name: 'subId', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_requestId', internalType: 'uint256', type: 'uint256' },
      { name: '_consumer', internalType: 'address', type: 'address' },
    ],
    name: 'fulfillRandomWords',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_requestId', internalType: 'uint256', type: 'uint256' },
      { name: '_consumer', internalType: 'address', type: 'address' },
      { name: '_words', internalType: 'uint256[]', type: 'uint256[]' },
    ],
    name: 'fulfillRandomWordsWithOverride',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_subId', internalType: 'uint256', type: 'uint256' },
      { name: '_amount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'fundSubscription',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'subId', internalType: 'uint256', type: 'uint256' }],
    name: 'fundSubscriptionWithNative',
    outputs: [],
    stateMutability: 'payable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'startIndex', internalType: 'uint256', type: 'uint256' },
      { name: 'maxCount', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'getActiveSubscriptionIds',
    outputs: [{ name: 'ids', internalType: 'uint256[]', type: 'uint256[]' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'subId', internalType: 'uint256', type: 'uint256' }],
    name: 'getSubscription',
    outputs: [
      { name: 'balance', internalType: 'uint96', type: 'uint96' },
      { name: 'nativeBalance', internalType: 'uint96', type: 'uint96' },
      { name: 'reqCount', internalType: 'uint64', type: 'uint64' },
      { name: 'subOwner', internalType: 'address', type: 'address' },
      { name: 'consumers', internalType: 'address[]', type: 'address[]' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'i_base_fee',
    outputs: [{ name: '', internalType: 'uint96', type: 'uint96' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'i_gas_price',
    outputs: [{ name: '', internalType: 'uint96', type: 'uint96' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'i_wei_per_unit_link',
    outputs: [{ name: '', internalType: 'int256', type: 'int256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [
      { name: '', internalType: 'address', type: 'address' },
      { name: 'amount', internalType: 'uint256', type: 'uint256' },
      { name: 'data', internalType: 'bytes', type: 'bytes' },
    ],
    name: 'onTokenTransfer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 'owner',
    outputs: [{ name: '', internalType: 'address', type: 'address' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [{ name: 'subId', internalType: 'uint256', type: 'uint256' }],
    name: 'ownerCancelSubscription',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    name: 'pendingRequestExists',
    outputs: [{ name: '', internalType: 'bool', type: 'bool' }],
    stateMutability: 'pure',
  },
  {
    type: 'function',
    inputs: [{ name: 'to', internalType: 'address', type: 'address' }],
    name: 'recoverFunds',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'to', internalType: 'address payable', type: 'address' }],
    name: 'recoverNativeFunds',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: '_subId', internalType: 'uint256', type: 'uint256' },
      { name: '_consumer', internalType: 'address', type: 'address' },
    ],
    name: 'removeConsumer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      {
        name: '_req',
        internalType: 'struct VRFV2PlusClient.RandomWordsRequest',
        type: 'tuple',
        components: [
          { name: 'keyHash', internalType: 'bytes32', type: 'bytes32' },
          { name: 'subId', internalType: 'uint256', type: 'uint256' },
          {
            name: 'requestConfirmations',
            internalType: 'uint16',
            type: 'uint16',
          },
          { name: 'callbackGasLimit', internalType: 'uint32', type: 'uint32' },
          { name: 'numWords', internalType: 'uint32', type: 'uint32' },
          { name: 'extraArgs', internalType: 'bytes', type: 'bytes' },
        ],
      },
    ],
    name: 'requestRandomWords',
    outputs: [{ name: '', internalType: 'uint256', type: 'uint256' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'subId', internalType: 'uint256', type: 'uint256' },
      { name: 'newOwner', internalType: 'address', type: 'address' },
    ],
    name: 'requestSubscriptionOwnerTransfer',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [],
    name: 's_config',
    outputs: [
      {
        name: 'minimumRequestConfirmations',
        internalType: 'uint16',
        type: 'uint16',
      },
      { name: 'maxGasLimit', internalType: 'uint32', type: 'uint32' },
      { name: 'reentrancyLock', internalType: 'bool', type: 'bool' },
      { name: 'stalenessSeconds', internalType: 'uint32', type: 'uint32' },
      {
        name: 'gasAfterPaymentCalculation',
        internalType: 'uint32',
        type: 'uint32',
      },
      {
        name: 'fulfillmentFlatFeeNativePPM',
        internalType: 'uint32',
        type: 'uint32',
      },
      {
        name: 'fulfillmentFlatFeeLinkDiscountPPM',
        internalType: 'uint32',
        type: 'uint32',
      },
      { name: 'nativePremiumPercentage', internalType: 'uint8', type: 'uint8' },
      { name: 'linkPremiumPercentage', internalType: 'uint8', type: 'uint8' },
    ],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 's_currentSubNonce',
    outputs: [{ name: '', internalType: 'uint64', type: 'uint64' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 's_totalBalance',
    outputs: [{ name: '', internalType: 'uint96', type: 'uint96' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 's_totalNativeBalance',
    outputs: [{ name: '', internalType: 'uint96', type: 'uint96' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    inputs: [],
    name: 'setConfig',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'link', internalType: 'address', type: 'address' },
      { name: 'linkNativeFeed', internalType: 'address', type: 'address' },
    ],
    name: 'setLINKAndLINKNativeFeed',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'to', internalType: 'address', type: 'address' }],
    name: 'transferOwnership',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [{ name: 'recipient', internalType: 'address', type: 'address' }],
    name: 'withdraw',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    inputs: [
      { name: 'recipient', internalType: 'address payable', type: 'address' },
    ],
    name: 'withdrawNative',
    outputs: [],
    stateMutability: 'nonpayable',
  },
  { type: 'event', anonymous: false, inputs: [], name: 'ConfigSet' },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'to', internalType: 'address', type: 'address', indexed: false },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'FundsRecovered',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'to', internalType: 'address', type: 'address', indexed: false },
      {
        name: 'amount',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'NativeFundsRecovered',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'OwnershipTransferRequested',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      { name: 'from', internalType: 'address', type: 'address', indexed: true },
      { name: 'to', internalType: 'address', type: 'address', indexed: true },
    ],
    name: 'OwnershipTransferred',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'requestId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'outputSeed',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'subId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'payment',
        internalType: 'uint96',
        type: 'uint96',
        indexed: false,
      },
      {
        name: 'nativePayment',
        internalType: 'bool',
        type: 'bool',
        indexed: false,
      },
      { name: 'success', internalType: 'bool', type: 'bool', indexed: false },
      {
        name: 'onlyPremium',
        internalType: 'bool',
        type: 'bool',
        indexed: false,
      },
    ],
    name: 'RandomWordsFulfilled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'keyHash',
        internalType: 'bytes32',
        type: 'bytes32',
        indexed: true,
      },
      {
        name: 'requestId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'preSeed',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'subId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'minimumRequestConfirmations',
        internalType: 'uint16',
        type: 'uint16',
        indexed: false,
      },
      {
        name: 'callbackGasLimit',
        internalType: 'uint32',
        type: 'uint32',
        indexed: false,
      },
      {
        name: 'numWords',
        internalType: 'uint32',
        type: 'uint32',
        indexed: false,
      },
      {
        name: 'extraArgs',
        internalType: 'bytes',
        type: 'bytes',
        indexed: false,
      },
      {
        name: 'sender',
        internalType: 'address',
        type: 'address',
        indexed: true,
      },
    ],
    name: 'RandomWordsRequested',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'subId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      { name: 'to', internalType: 'address', type: 'address', indexed: false },
      {
        name: 'amountLink',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'amountNative',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'SubscriptionCanceled',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'subId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'consumer',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'SubscriptionConsumerAdded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'subId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'consumer',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'SubscriptionConsumerRemoved',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'subId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'owner',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
    ],
    name: 'SubscriptionCreated',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'subId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'oldBalance',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'newBalance',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'SubscriptionFunded',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'subId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'oldNativeBalance',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
      {
        name: 'newNativeBalance',
        internalType: 'uint256',
        type: 'uint256',
        indexed: false,
      },
    ],
    name: 'SubscriptionFundedWithNative',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'subId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'from',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      { name: 'to', internalType: 'address', type: 'address', indexed: false },
    ],
    name: 'SubscriptionOwnerTransferRequested',
  },
  {
    type: 'event',
    anonymous: false,
    inputs: [
      {
        name: 'subId',
        internalType: 'uint256',
        type: 'uint256',
        indexed: true,
      },
      {
        name: 'from',
        internalType: 'address',
        type: 'address',
        indexed: false,
      },
      { name: 'to', internalType: 'address', type: 'address', indexed: false },
    ],
    name: 'SubscriptionOwnerTransferred',
  },
  {
    type: 'error',
    inputs: [
      { name: 'internalBalance', internalType: 'uint256', type: 'uint256' },
      { name: 'externalBalance', internalType: 'uint256', type: 'uint256' },
    ],
    name: 'BalanceInvariantViolated',
  },
  { type: 'error', inputs: [], name: 'FailedToSendNative' },
  { type: 'error', inputs: [], name: 'FailedToTransferLink' },
  { type: 'error', inputs: [], name: 'IndexOutOfRange' },
  { type: 'error', inputs: [], name: 'InsufficientBalance' },
  { type: 'error', inputs: [], name: 'InvalidCalldata' },
  {
    type: 'error',
    inputs: [
      { name: 'subId', internalType: 'uint256', type: 'uint256' },
      { name: 'consumer', internalType: 'address', type: 'address' },
    ],
    name: 'InvalidConsumer',
  },
  { type: 'error', inputs: [], name: 'InvalidExtraArgsTag' },
  { type: 'error', inputs: [], name: 'InvalidRandomWords' },
  { type: 'error', inputs: [], name: 'InvalidRequest' },
  { type: 'error', inputs: [], name: 'InvalidSubscription' },
  { type: 'error', inputs: [], name: 'LinkAlreadySet' },
  { type: 'error', inputs: [], name: 'LinkNotSet' },
  {
    type: 'error',
    inputs: [
      { name: 'proposedOwner', internalType: 'address', type: 'address' },
    ],
    name: 'MustBeRequestedOwner',
  },
  {
    type: 'error',
    inputs: [{ name: 'owner', internalType: 'address', type: 'address' }],
    name: 'MustBeSubOwner',
  },
  { type: 'error', inputs: [], name: 'NotImplemented' },
  { type: 'error', inputs: [], name: 'OnlyCallableFromLink' },
  { type: 'error', inputs: [], name: 'PendingRequestExists' },
  { type: 'error', inputs: [], name: 'Reentrant' },
  { type: 'error', inputs: [], name: 'TooManyConsumers' },
] as const

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// VRFV2PlusClient
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const vrfv2PlusClientAbi = [
  {
    type: 'function',
    inputs: [],
    name: 'EXTRA_ARGS_V1_TAG',
    outputs: [{ name: '', internalType: 'bytes4', type: 'bytes4' }],
    stateMutability: 'view',
  },
] as const
