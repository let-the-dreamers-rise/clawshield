// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {ClawShieldPolicyRegistry} from "../src/ClawShieldPolicyRegistry.sol";

contract ClawShieldPolicyRegistryTest is Test {
    ClawShieldPolicyRegistry registry;
    bytes32 constant AGENT = keccak256("policy-agent");

    function setUp() public {
        registry = new ClawShieldPolicyRegistry();
    }

    function testAttestAndVerify() public {
        bytes32 hash = keccak256("policy-v1");
        registry.attestPolicy(AGENT, hash, "ipfs://policy-v1");

        ClawShieldPolicyRegistry.PolicyRecord memory rec = registry.getPolicy(AGENT);
        assertEq(rec.policyHash, hash);
        assertEq(rec.version, 1);
        assertTrue(registry.verifyPolicyHash(AGENT, hash));
        assertFalse(registry.verifyPolicyHash(AGENT, keccak256("wrong")));
    }

    function testVersionIncrements() public {
        registry.attestPolicy(AGENT, keccak256("v1"), "");
        registry.attestPolicy(AGENT, keccak256("v2"), "");
        assertEq(registry.getPolicyVersion(AGENT), 2);
        assertEq(registry.getPolicy(AGENT).policyHash, keccak256("v2"));
    }

    function testFuzz_attest(bytes32 agentId, bytes32 hash) public {
        vm.assume(hash != bytes32(0));
        registry.attestPolicy(agentId, hash, "uri");
        assertTrue(registry.verifyPolicyHash(agentId, hash));
    }
}
