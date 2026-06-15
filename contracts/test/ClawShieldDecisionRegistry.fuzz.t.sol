// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {ClawShieldDecisionRegistry} from "../src/ClawShieldDecisionRegistry.sol";

contract ClawShieldDecisionRegistryFuzzTest is Test {
    ClawShieldDecisionRegistry registry;

    function setUp() public {
        registry = new ClawShieldDecisionRegistry();
    }

    function testFuzz_recordDecision_statsConsistent(
        bytes32 agentId,
        bytes32 decisionHash,
        uint8 riskScore,
        uint8 verdictRaw
    ) public {
        vm.assume(decisionHash != bytes32(0));
        uint8 verdict = verdictRaw % 3;
        uint8[] memory reasons = new uint8[](0);

        registry.recordDecision(
            agentId,
            decisionHash,
            0,
            riskScore,
            reasons,
            ClawShieldDecisionRegistry.Verdict(verdict),
            "ref"
        );

        ClawShieldDecisionRegistry.AgentStats memory stats = registry.getAgentStats(agentId);
        assertEq(stats.totalActions, 1);
        assertEq(stats.avgRisk, riskScore);
        if (verdict == 2) assertEq(stats.blocks, 1);
    }

    function testFuzz_batchRecordDecisions(uint8 count) public {
        count = uint8(bound(count, 1, 20));
        bytes32 agent = keccak256("fuzz-agent");

        ClawShieldDecisionRegistry.DecisionInput[] memory inputs =
            new ClawShieldDecisionRegistry.DecisionInput[](count);

        for (uint256 i = 0; i < count; i++) {
            inputs[i] = ClawShieldDecisionRegistry.DecisionInput({
                agentId: agent,
                decisionHash: keccak256(abi.encode(i)),
                actionType: 0,
                riskScore: uint8(i % 100),
                reasonCodes: new uint8[](0),
                verdict: ClawShieldDecisionRegistry.Verdict.ALLOW,
                execTxRef: "batch"
            });
        }

        registry.batchRecordDecisions(inputs);
        assertEq(registry.getDecisionCount(agent), count);
    }

    function testFuzz_pagination_bounds(uint8 totalRaw, uint8 offsetRaw, uint8 limitRaw) public {
        uint256 total = bound(totalRaw, 1, 30);
        bytes32 agent = keccak256("page-agent");
        uint8[] memory reasons = new uint8[](0);

        for (uint256 i = 0; i < total; i++) {
            registry.recordDecision(
                agent,
                keccak256(abi.encode("d", i)),
                0,
                10,
                reasons,
                ClawShieldDecisionRegistry.Verdict.ALLOW,
                ""
            );
        }

        uint256 offset = bound(offsetRaw, 0, total);
        uint256 limit = bound(limitRaw, 0, total);
        ClawShieldDecisionRegistry.HistoryPage memory page =
            registry.getAgentHistoryPaginated(agent, offset, limit);

        assertEq(page.total, total);
        assertLe(page.decisions.length, limit);
    }
}

contract ClawShieldDecisionRegistryInvariantTest is Test {
    ClawShieldDecisionRegistry registry;
    bytes32 constant AGENT = keccak256("inv-agent");

    function setUp() public {
        registry = new ClawShieldDecisionRegistry();
    }

    function invariant_totalActionsMatchesCount() public view {
        assertEq(registry.getDecisionCount(AGENT), registry.getAgentStats(AGENT).totalActions);
    }

    function test_invariant_afterMultipleRecords() public {
        uint8[] memory reasons = new uint8[](0);
        for (uint256 i = 0; i < 5; i++) {
            registry.recordDecision(
                AGENT,
                keccak256(abi.encode(i)),
                0,
                20,
                reasons,
                ClawShieldDecisionRegistry.Verdict.ALLOW,
                ""
            );
        }
        invariant_totalActionsMatchesCount();
    }
}
