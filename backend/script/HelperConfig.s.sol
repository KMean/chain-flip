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
    uint256 public constant SEPOLIA_CHAIN_ID = 11155111;
    uint256 public constant AMOY_CHAIN_ID = 80002;
    uint256 public constant LOCAL_CHAIN_ID = 31337;
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
        chainIdToNetworkConfig[SEPOLIA_CHAIN_ID] = getSepoliaConfig();
        chainIdToNetworkConfig[AMOY_CHAIN_ID] = getAmoyConfig();
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

    function getETHMainetConfig() public pure returns (NetworkConfig memory) {
        return NetworkConfig({
            minimumBetAmount: 0.01 ether,
            vrfCoordinator: 0xD7f86b4b8Cae7D942340FF628F82735b7a20893a,
            keyHash: 0x3fd2fec10d06ee8f65e7f2e95f5c56511359ece3f33960ad8a866ae24a8ff10b, //500 gwei keyhash
            subscriptionId: 0, //change this
            callbackGasLimit: 500000,
            linkToken: 0x514910771AF9Ca656af840dff83E8264EcF986CA,
            account: 0xc6CD8842EB67684a763Fe776843f693bB3e48850
        });
    }

    function getSepoliaConfig() public pure returns (NetworkConfig memory) {
        return NetworkConfig({
            minimumBetAmount: 0.01 ether,
            vrfCoordinator: 0x9DdfaCa8183c41ad55329BdeeD9F6A8d53168B1B,
            keyHash: 0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae,
            subscriptionId: 92912893321928830876765544058373703346150501163827818919661610957836575975005,
            callbackGasLimit: 500000,
            linkToken: 0x779877A7B0D9E8603169DdbD7836e478b4624789,
            account: 0xc6CD8842EB67684a763Fe776843f693bB3e48850
        });
    }

    function getAmoyConfig() public pure returns (NetworkConfig memory) {
        return NetworkConfig({
            minimumBetAmount: 0.01 ether,
            vrfCoordinator: 0x343300b5d84D444B2ADc9116FEF1bED02BE49Cf2,
            keyHash: 0x3f631d5ec60a0ce16203bcd6aff7ffbc423e22e452786288e172d467354304c8,
            subscriptionId: 13706559019438070441991592172454793127526154298938152266421088026372246684282,
            callbackGasLimit: 500000,
            linkToken: 0x0Fd9e8d3aF1aaee056EB9e802c3A762a667b1904,
            account: 0xc6CD8842EB67684a763Fe776843f693bB3e48850
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
