// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script} from "forge-std/Script.sol";
import {LinkToken} from "test/mocks/LinkToken.sol";
import {VRFCoordinatorV2_5Mock} from "@chainlink/contracts/src/v0.8/vrf/mocks/VRFCoordinatorV2_5Mock.sol";
import {HelperConfig} from "script/HelperConfig.s.sol";
import {CreateSubscription, FundSubscription, AddConsumer} from "script/Interactions.s.sol";
import {ChainFlip} from "src/ChainFlip.sol";

contract DeployChainFlip is Script {
    function run() external {
        deployContract();
    }

    function deployContract() public returns (ChainFlip, HelperConfig) {
        HelperConfig helperConfig = new HelperConfig();
        HelperConfig.NetworkConfig memory config = helperConfig.getConfig();

        if (config.subscriptionId == 0) {
            CreateSubscription createSubscription = new CreateSubscription();
            (config.subscriptionId, config.vrfCoordinator) =
                createSubscription.createSubscription(config.vrfCoordinator, config.account);

            FundSubscription fundSubscription = new FundSubscription();
            fundSubscription.fundSubscription(
                config.vrfCoordinator, config.subscriptionId, config.linkToken, config.account
            );
        }

        vm.startBroadcast(config.account);

        ChainFlip chainflip = new ChainFlip(
            config.minimumBetAmount,
            config.subscriptionId,
            config.vrfCoordinator,
            config.keyHash,
            config.callbackGasLimit
        );
        vm.stopBroadcast();
        AddConsumer addConsumer = new AddConsumer();
        addConsumer.addConsumer(address(chainflip), config.vrfCoordinator, config.subscriptionId, config.account);
        return (chainflip, helperConfig);
    }
}
