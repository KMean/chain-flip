// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {LinkToken} from "test/mocks/LinkToken.sol";
import {Script, console} from "lib/forge-std/src/Script.sol";
import {VRFCoordinatorV2_5Mock} from "@chainlink/contracts/src/v0.8/vrf/mocks/VRFCoordinatorV2_5Mock.sol";

abstract contract CodeConstants {
    /*VRF MOCK Values*/
    uint96 public MOCK_BASE_FEE = 100000000000000000;
    uint96 public MOCK_GAS_PRICE_LINK = 1e9; // 1 gwei per gas
    address public FOUNDRY_DEFAULT_SENDER = 0x1804c8AB1F12E6bbf3894d4083f33e07309d1f38;
    int256 public MOCK_WEI_PER_UNIT_LINK = 7e15; // LINK/ETH Price
    uint256 public constant AMOY_CHAIN_ID = 80002;
    uint256 public constant SEPOLIA_CHAIN_ID = 11155111;
    uint256 public constant LOCAL_CHAIN_ID = 31337;
    uint256 public constant BNB_TESTNET_CHAIN_ID = 97;
}

contract HelperConfig is CodeConstants, Script {
    error HelperConfig__InvalidChainId();

    struct NetworkConfig {
        uint256 minimumBetAmount;
        address vrfCoordinator;
        bytes32 keyHash;
        uint256 subscriptionId;
        uint32 callbackGasLimit;
        address linkToken;
        address account;
    }

    NetworkConfig public localNetworkConfig;
    mapping(uint256 chainId => NetworkConfig) public chainIdToNetworkConfig;

    constructor() {
        chainIdToNetworkConfig[AMOY_CHAIN_ID] = getAmoyConfig();
        chainIdToNetworkConfig[SEPOLIA_CHAIN_ID] = getSepoliaConfig();
        chainIdToNetworkConfig[BNB_TESTNET_CHAIN_ID] = getBNBTestnetConfig();
    }

    function getConfigByChainId(uint256 chainId) public returns (NetworkConfig memory) {
        if (chainIdToNetworkConfig[chainId].vrfCoordinator != address(0)) {
            return chainIdToNetworkConfig[chainId];
        } else if (chainId == LOCAL_CHAIN_ID) {
            return getOrCreateAnvilConfig();
        } else {
            revert HelperConfig__InvalidChainId();
        }
    }

    function getConfig() public returns (NetworkConfig memory) {
        return getConfigByChainId(block.chainid);
    }

    function getAmoyConfig() public view returns (NetworkConfig memory) {
        // Load from .env
        uint256 chainlinkVrfAmoySubscriptionId = vm.envUint("CHAINLINK_VRF_AMOY_SUBSCRIPTION_ID");
        address account = vm.envAddress("ACCOUNT");

        return NetworkConfig({
            minimumBetAmount: 0.1 ether,
            vrfCoordinator: 0x343300b5d84D444B2ADc9116FEF1bED02BE49Cf2,
            keyHash: 0x816bedba8a50b294e5cbd47842baf240c2385f2eaf719edbd4f250a137a8c899,
            subscriptionId: chainlinkVrfAmoySubscriptionId,
            callbackGasLimit: 500000, // max 500_000
            linkToken: 0x0Fd9e8d3aF1aaee056EB9e802c3A762a667b1904,
            account: account
        });
    }

    function getSepoliaConfig() public view returns (NetworkConfig memory) {
        // Load from .env
        uint256 chainlinkVrfSepoliaSubscriptionId = vm.envUint("CHAINLINK_VRF_SEPOLIA_SUBSCRIPTION_ID");
        address account = vm.envAddress("ACCOUNT");

        return NetworkConfig({
            minimumBetAmount: 0.001 ether,
            vrfCoordinator: 0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B,
            keyHash: 0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae,
            subscriptionId: chainlinkVrfSepoliaSubscriptionId,
            callbackGasLimit: 1000000, //max 2_500_000
            linkToken: 0x779877A7B0D9E8603169DdbD7836e478b4624789,
            account: account
        });
    }

    function getBNBTestnetConfig() public view returns (NetworkConfig memory) {
        // Load from .env
        uint256 chainlinkVrfBnbTestnetSubscriptionId = vm.envUint("CHAINLINK_VRF_BNBTESTNET_SUBSCRIPTION_ID");
        address account = vm.envAddress("ACCOUNT");

        return NetworkConfig({
            minimumBetAmount: 0.005 ether,
            vrfCoordinator: 0xDA3b641D438362C440Ac5458c57e00a712b66700,
            keyHash: 0x8596b430971ac45bdf6088665b9ad8e8630c9d5049ab54b14dff711bee7c0e26,
            subscriptionId: chainlinkVrfBnbTestnetSubscriptionId,
            callbackGasLimit: 1000000, //max 2_500_000
            linkToken: 0x84b9B910527Ad5C03A9Ca831909E21e236EA7b06,
            account: account
        });
    }

    function getOrCreateAnvilConfig() public returns (NetworkConfig memory) {
        // check if we set an active network config
        if (localNetworkConfig.vrfCoordinator != address(0)) {
            return localNetworkConfig;
        }

        // create mocks for local network
        vm.startBroadcast(FOUNDRY_DEFAULT_SENDER);
        VRFCoordinatorV2_5Mock vrfCoordinatorMock =
            new VRFCoordinatorV2_5Mock(MOCK_BASE_FEE, MOCK_GAS_PRICE_LINK, MOCK_WEI_PER_UNIT_LINK);
        LinkToken linkToken = new LinkToken();
        vm.stopBroadcast();

        localNetworkConfig = NetworkConfig({
            minimumBetAmount: 0.01 ether,
            vrfCoordinator: address(vrfCoordinatorMock),
            keyHash: 0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae,
            subscriptionId: 0,
            callbackGasLimit: 500000,
            linkToken: address(linkToken),
            account: FOUNDRY_DEFAULT_SENDER
        });
        return localNetworkConfig;
    }
}
