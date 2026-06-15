// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {ClawShieldDecisionRegistry} from "../src/ClawShieldDecisionRegistry.sol";
import {ClawShieldVerified} from "../src/ClawShieldVerified.sol";
import {ClawShieldReputationReader} from "../src/ClawShieldReputationReader.sol";
import {ClawShieldPolicyRegistry} from "../src/ClawShieldPolicyRegistry.sol";

contract Deploy is Script {
    address constant ERC8004_REPUTATION =
        0x8004B663056A597Dffe9eCcC1965A193B7388713;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("MANTLE_PRIVATE_KEY");
        vm.startBroadcast(deployerPrivateKey);

        ClawShieldDecisionRegistry registry = new ClawShieldDecisionRegistry();
        ClawShieldVerified verified = new ClawShieldVerified();
        ClawShieldPolicyRegistry policyRegistry = new ClawShieldPolicyRegistry();
        ClawShieldReputationReader reader = new ClawShieldReputationReader(
            address(registry),
            address(verified),
            ERC8004_REPUTATION
        );

        vm.stopBroadcast();

        console2.log("ClawShieldDecisionRegistry:", address(registry));
        console2.log("ClawShieldVerified:", address(verified));
        console2.log("ClawShieldPolicyRegistry:", address(policyRegistry));
        console2.log("ClawShieldReputationReader:", address(reader));
    }
}
