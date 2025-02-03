Chain Flip
=========

ChainFlip is a decentralized coin flip betting game built on the blockchain, utilizing Chainlink VRF for provable randomness. Players can create and join matches, with winnings automatically distributed to the winner.

Features
--------

-   **Decentralized Betting**: Fair and transparent coin flip game.
-   **Chainlink VRF Integration**: Ensures unbiased randomness.
-   **Automated Refunds**: Handles failed transactions and refunds automatically.
-   **Flexible Configuration**: Owners can set minimum bet amounts and fees.
-   **Chainlink Automation**: Detects and handles stuck matches automatically.

Project Structure
-----------------

```
chain-flip/
├── backend/               # Forge project for smart contracts
│   ├── src/               # Solidity contracts
│   ├── script/            # Deployment and interaction scripts
│   ├── test/              # Unit and integration tests
│   ├── lib/               # Git submodules for dependencies
│   ├── foundry.toml       # Foundry configuration
│   ├── .gitignore         # Backend-specific ignores
├── frontend/              # Next.js project for frontend
│   ├── pages/             # Next.js pages
│   ├── components/        # React components
│   ├── public/            # Static files
│   ├── styles/            # CSS/SCSS styles
│   ├── package.json       # Node.js dependencies
│   ├── next.config.js     # Next.js configuration
│   ├── .gitignore         # Frontend-specific ignores
├── README.md              # Project documentation
└── .gitignore             # Root Git ignore file

```

Getting Started
---------------

### Prerequisites

Make sure you have the following installed:

-   [Node.js](https://nodejs.org/) (v16 or higher)
-   [Foundry](https://getfoundry.sh/) for Solidity development
-   [Git](https://git-scm.com/)

### Clone the Repository

```
git clone https://github.com/KMean/chain-flip.git
cd chain-flip

```

### Initialize Submodules

Ensure that the submodules are properly initialized to fetch all dependencies:

```
git submodule update --init --recursive

```

### Backend Setup

Navigate to the backend directory and ensure everything is installed:

```
cd backend
forge install

```

Run tests to ensure everything is set up correctly:

```
forge test

```

### Frontend Setup

Navigate to the frontend directory and install dependencies:

```
cd ../frontend
npm install

```

Start the development server:

```
npm run dev

```

The frontend will be available at [http://localhost:3000](http://localhost:3000/).
ChainFlip
=========

ChainFlip is a decentralized coin flip betting game built on the blockchain, utilizing Chainlink VRF for provable randomness. Players can create and join matches, with winnings automatically distributed to the winner.

Features
--------

-   **Decentralized Betting**: Fair and transparent coin flip game.
-   **Chainlink VRF Integration**: Ensures unbiased randomness.
-   **Automated Refunds**: Handles failed transactions and refunds automatically.
-   **Flexible Configuration**: Owners can set minimum bet amounts and fees.
-   **Chainlink Automation**: Detects and handles stuck matches automatically.

Project Structure
-----------------

```
chain-flip/
├── backend/               # Forge project for smart contracts
│   ├── src/               # Solidity contracts
│   ├── script/            # Deployment and interaction scripts
│   ├── test/              # Unit and integration tests
│   ├── lib/               # Git submodules for dependencies
│   ├── foundry.toml       # Foundry configuration
├── frontend/              # Next.js project for frontend
│   ├── pages/             # Next.js pages
│   ├── components/        # React components
│   ├── public/            # Static files
│   ├── styles/            # CSS/SCSS styles
│   ├── package.json       # Node.js dependencies
│   ├── next.config.js     # Next.js configuration
├── README.md              # Project documentation
└── .gitignore             # Root Git ignore file

```

Getting Started
---------------

### Prerequisites

Make sure you have the following installed:

-   [Node.js](https://nodejs.org/) (v16 or higher)
-   [Foundry](https://getfoundry.sh/) for Solidity development
-   [Git](https://git-scm.com/)

### Clone the Repository

```
git clone https://github.com/yourusername/chain-flip.git
cd chain-flip

```

### Initialize Submodules

Ensure that the submodules are properly initialized to fetch all dependencies:

```
git submodule update --init --recursive

```

### Backend Setup

Navigate to the backend directory and ensure everything is installed:

```
cd backend
forge install

```

**Important:** Update the `subscriptionId` and `account` fields in `HelperConfig.s.sol` to match your Chainlink VRF subscription details.
**Important:** Copy `.env_example` to `.env` and update it with your own Alchemy or Infura API keys:

Run tests to ensure everything is set up correctly:

```
forge test

```

### Frontend Setup

Navigate to the frontend directory and install dependencies:

```
cd ../frontend
npm install

```



Start the development server:

```
npm run dev

```

The frontend will be available at [http://localhost:3000](http://localhost:3000/).

Deployment
----------

### Deploy Smart Contracts

From the `backend` directory, deploy the contracts:

```
forge script script/DeployCoinFlip.s.sol --broadcast --verify

```

### Configure Frontend

After deployment, update the frontend with the deployed contract addresses and ABI in the environment variables or configuration files.

Contributing
------------

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/your-feature`).
3.  Commit your changes (`git commit -m 'Add new feature'`).
4.  Push to the branch (`git push origin feature/your-feature`).
5.  Open a Pull Request.

License
-------

This project is licensed under the MIT License. See the [LICENSE](https://chatgpt.com/c/LICENSE) file for details.

* * * * *

Enjoy flipping with ChainFlip! 🌪️
Deployment
----------

### Deploy Smart Contracts

From the `backend` directory, deploy the contracts:

```
forge script script/DeployCoinFlip.s.sol --broadcast --verify

```

### Configure Frontend

After deployment, update the frontend with the deployed contract addresses and ABI in the environment variables or configuration files.

Contributing
------------

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/your-feature`).
3.  Commit your changes (`git commit -m 'Add new feature'`).
4.  Push to the branch (`git push origin feature/your-feature`).
5.  Open a Pull Request.

License
-------

This project is licensed under the MIT License. See the [LICENSE](https://chatgpt.com/c/LICENSE) file for details.

* * * * *

Enjoy flipping with ChainFlip! 🎲