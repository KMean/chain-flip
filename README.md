Chain-Flip
==========

Overview
--------

**Chain-Flip** is a decentralized coin flip betting game built on blockchain technology using Chainlink VRF (Verifiable Random Function) for secure and provably fair randomness. The project allows players to create and join matches with automatic payout distribution, fee management, and advanced security measures.

Features
--------

-   **Decentralized Betting:** Players can create and join coin flip matches directly on the blockchain.

-   **Provably Fair Randomness:** Utilizes Chainlink VRF to ensure tamper-proof random outcomes.

-   **Automatic Payouts:** Winnings are automatically transferred to the winner's address.

-   **Fee Management:** The contract collects a customizable fee (default 5%, max 10%) on each match.

-   **Unclaimed Prizes & Refunds:** Handles failed prize transfers and match cancellations with refund mechanisms.

-   **Automation:** Uses Chainlink Automation to handle stuck matches and ensure smooth operation.

-   **Security:** Implements reentrancy guards and permissioned functions to secure the contract.

Technologies Used
-----------------

-   **Solidity:** Smart contract development language.

-   **Chainlink VRF:** Provides secure randomness.

-   **Chainlink Automation:** Automates contract upkeep.

-   **OpenZeppelin ReentrancyGuard:** Protects against reentrancy attacks.

-   **Forge:** Development and testing framework for Ethereum smart contracts.

Smart Contract Details
----------------------

### CoinFlip.sol

-   **createMatch:** Allows a player to create a new betting match.

-   **joinMatch:** Enables another player to join an existing match.

-   **cancelMatch:** Cancels a match before another player joins.

-   **fulfillRandomWords:** Callback function from Chainlink VRF to determine match results.

-   **withdrawRefund & claimPrize:** Allow players to withdraw refunds or claim unclaimed prizes.

-   **Admin Functions:** Set minimum bet amounts, fee percentages, and withdraw collected fees.

### Interactions Scripts

-   **DeployCoinFlip:** Deploys the CoinFlip contract and sets up Chainlink VRF subscriptions.

-   **CreateSubscription:** Manages Chainlink VRF subscription creation.

-   **FundSubscription:** Funds the Chainlink VRF subscription.

-   **AddConsumer:** Registers the CoinFlip contract as a consumer for the VRF subscription.

Installation & Setup
--------------------

### Prerequisites

-   **Node.js & npm**

-   **Foundry** (for smart contract development)

-   **MetaMask** (for interacting with deployed contracts)

### Clone the Repository

```
git clone https://github.com/KMean/chain-flip.git
cd chain-flip
```

### Install Dependencies

```
forge install
```

### Configuration

Update the `HelperConfig` contract with your specific Chainlink VRF subscription details and network configurations.

Running the Project
-------------------

### Deploy Contracts

```
forge script script/DeployCoinFlip.s.sol:DeployCoinFlip --broadcast --rpc-url <YOUR_RPC_URL>
```

### Running Tests

```
forge test
```

### Fuzz Testing

```
forge test --match-path test/CoinFlipFuzzTest.t.sol
```

Contributing
------------

Contributions are welcome! Feel free to fork the repository and submit pull requests.

1.  Fork the repository.

2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).

3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).

4.  Push to the branch (`git push origin feature/AmazingFeature`).

5.  Open a pull request.

License
-------

This project is licensed under the MIT License.

Acknowledgments
---------------

-   [Chainlink](https://chain.link/)

-   [OpenZeppelin](https://openzeppelin.com/)

-   Foundry

* * * * *

**Author:** Kim Ranzani - KMean