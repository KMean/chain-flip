# Chain-Flip

**ChainFlip** is a decentralized coin flip betting game, leveraging Chainlink VRF for provable randomness. Players can create and join matches, with automatic payout to the winner. 

Try it out at [HERE](https://chainflip-pink.vercel.app)!
## Features

- **Decentralized Betting**: Fair and transparent coin flip game.
- **Chainlink VRF Integration**: Ensures unbiased randomness for outcomes.
- **Automated Refunds**: Handles failed transactions and refunds automatically.
- **Flexible Configuration**: Owners can set minimum bet amounts and fees.
- **Chainlink Automation**: Automatically detects and resolves stuck matches.

## **Frontend Features**

The frontend is built with **Next.js**, **Wagmi** for blockchain interactions and **RainbowKit** for wallet connection.

#### **Matches**  
- 🏆 **Create a Match** – Players can create a new coin flip match by selecting a side and setting a bet amount.  
- 🔄 **Join a Match** – Players can join an existing match, taking the opposite side.  
- ❌ **Cancel a Match** – Match creators can cancel a match before it starts. If canceled, the player can withdraw their funds from the **Dashboard**.  

#### **Dashboard**  
- 📊 **Match Overview** – Users can view their **active matches**, **match history** with results, and overall **stats**.  

#### **Leaderboard**  
- 🥇 **Top Winners** – Displays the **top players** based on total winnings.  

#### **Admin Panel**  
- ⚙️ **Contract Owner Controls**:  
  - Set **fee percent**, **minimum bet amount**, and **timeout for stuck matches** (minutes before Chainlink automation cancels and refunds).  
  - 💰 **Withdraw accumulated fees**.


## Project Structure

```plaintext
chain-flip/
├── backend/                            # Forge project for smart contracts
│   ├── script/                         # Deployment & interaction scripts (Foundry)
│   │   ├── DeployChainFlip.s.sol
│   │   ├── HelperConfig.s.sol
│   │   └── Interactions.s.sol
│   ├── src/                            # Solidity contracts
│   │   └── ChainFlip.sol
│   ├── foundry.toml                    # Foundry configuration
│   └── test/                           # Unit, fuzz, integration, and invariant tests
├── frontend/                           # Next.js project for the user interface
│   ├── app/                            # App Router folder for Next.js
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── providers.tsx
│   ├── components/                     # Reusable React components
│   │   ├── AdminDashboard.tsx
│   │   ├── FlipCoin.tsx
│   │   ├── MatchCard.tsx
│   │   └── Navbar.tsx
│   ├── config/                         # Wagmi & contract configuration
│   │   ├── chainflip.ts
│   │   ├── contracts.config.ts
│   │   ├── wagmi.ts
│   │   └── wagmiGenerate.config.ts
│   ├── public/                         # Static assets
│   │   ├── background.mp4
│   │   ├── chainflip_logo.png
│   │   └── coin.png
│   ├── package.json                    # Frontend dependencies
│   └── ...other files
├── README.md                           # Project documentation
└── .gitignore                          # Git ignore file
```

## Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Foundry](https://book.getfoundry.sh/) for Solidity development
- [Git](https://git-scm.com/)

### Clone the Repository

```bash
git clone https://github.com/KMean/chain-flip.git
cd chain-flip
```

### Initialize Submodules

Ensure submodules are properly initialized to fetch all dependencies:

```bash
git submodule update --init --recursive
```

## Backend Setup

1. **Navigate** to the backend directory:
   ```bash
   cd backend
   ```
2. **Install dependencies**:
   ```bash
   forge install
   ```
3. **Copy environment variables**:
   ```bash
   cp .env_example .env
   ```

   Update `AMOY_RPC_URL`, `SEPOLIA_RPC_UR`, `BNBTESTNET_RPC_URL`, `CHAINLINK_VRF_AMOY_SUBSCRIPTION_ID`, `CHAINLINK_VRF_SEPOLIA_SUBSCRIPTION_ID`, `CHAINLINK_VRF_BNBTESTNET_SUBSCRIPTION_ID`, `ACCOUNT`, `POLYGON_SCAN_API_KEY`, `ETHERSCAN_API_KEY`, `BSCSCAN_API_KEY` in `.env`.

4. **Run tests**:
   ```bash
   forge test
   ```

5. **Encrypt Metamask Private Key** (Optional but recommended):
   ```bash
   cast wallet import your-account-name --interactive
   ```
   Follow the prompts to secure your private key.

### Deploy the Contract

```bash
forge script --chain amoy script/DeployChainFlip.s.sol --rpc-url $AMOY_RPC_URL --account 'your-account-name' --broadcast --verify -vvvv  
```

## Frontend Setup

1. **Navigate** to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Copy environment variables**:
   ```bash
   cp .env.local_example .env.local
   ```
   Update `NEXT_PUBLIC_RAINBOW_PROJECT_ID`, `NEXT_PUBLIC_AMOY_ALCHEMY_API_URL`, `NEXT_PUBLIC_SEPOLIA_ALCHEMY_API_URL`, `NEXT_PUBLIC_BNBTESTNET_ALCHEMY_API_URL`, `NEXT_PUBLIC_AMOY_CHAINFLIP_CONTRACT_ADDRESS`,`NEXT_PUBLIC_SEPOLIA_CHAINFLIP_CONTRACT_ADDRESS`, `NEXT_PUBLIC_BNBTESTNET_CHAINFLIP_CONTRACT_ADDRESS`.


4. **Start the development server**:
   ```bash
   npm run dev
   ```
   The frontend will be available at [http://localhost:3000](http://localhost:3000/).

## Generate Wagmi Hooks

If modifying the contract, regenerate frontend hooks:
```bash
wagmi generate --config frontend/config/wagmiGenerate.config.ts
```
This will update the ABI for the frontend to interact with the contract. The output defaults to `chainflip.ts` inside the same folder, but you can change this setup as needed in `wagmiGenerate.config.ts`. If you do so, remember to update `contracts.config.ts` to extract the correct ABI.

## Contributing

1. Fork the repository.
2. Create your feature branch:
   ```bash
   git checkout -b feature/your-feature
   ```
3. Commit your changes:
   ```bash
   git commit -m 'Add new feature'
   ```
4. Push to the branch:
   ```bash
   git push origin feature/your-feature
   ```
5. Open a Pull Request.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

Enjoy flipping with **ChainFlip**!
