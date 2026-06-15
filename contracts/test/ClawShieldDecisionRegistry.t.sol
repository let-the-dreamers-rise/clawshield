// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {ClawShieldDecisionRegistry} from "../src/ClawShieldDecisionRegistry.sol";

contract ClawShieldDecisionRegistryTest is Test {
    ClawShieldDecisionRegistry registry;
    bytes32 constant AGENT = keccak256("risky-agent");

    function setUp() public {
        registry = new ClawShieldDecisionRegistry();
    }

    function testRecordDecisionAndStats() public {
        uint8[] memory reasons = new uint8[](1);
        reasons[0] = 2; // OVEREXPOSED

        registry.recordDecision(
            AGENT,
            keccak256("decision-1"),
            0,
            85,
            reasons,
            ClawShieldDecisionRegistry.Verdict.BLOCK,
            "sol-tx-abc"
        );

        ClawShieldDecisionRegistry.AgentStats memory stats = registry.getAgentStats(AGENT);
        assertEq(stats.totalActions, 1);
        assertEq(stats.blocks, 1);
        assertEq(stats.avgRisk, 85);
        assertEq(stats.violations, 1);

        ClawShieldDecisionRegistry.Decision[] memory history = registry.getAgentHistory(AGENT);
        assertEq(history.length, 1);
        assertEq(history[0].riskScore, 85);
    }

    function testAllowDecisionNoBlock() public {
        uint8[] memory reasons = new uint8[](0);

        registry.recordDecision(
            AGENT,
            keccak256("decision-2"),
            0,
            20,
            reasons,
            ClawShieldDecisionRegistry.Verdict.ALLOW,
            "sol-tx-def"
        );

        ClawShieldDecisionRegistry.AgentStats memory stats = registry.getAgentStats(AGENT);
        assertEq(stats.blocks, 0);
        assertEq(stats.violations, 0);
    }

    function testEmitsDecisionRecorded() public {
        uint8[] memory reasons = new uint8[](0);
        bytes32 hash = keccak256("decision-3");

        vm.expectEmit(true, true, false, true);
        emit ClawShieldDecisionRegistry.DecisionRecorded(
            AGENT, hash, 1, 30, reasons, 0, "ref"
        );

        registry.recordDecision(
            AGENT, hash, 1, 30, reasons, ClawShieldDecisionRegistry.Verdict.ALLOW, "ref"
        );
    }

    function testBatchRecord() public {
        ClawShieldDecisionRegistry.DecisionInput[] memory inputs =
            new ClawShieldDecisionRegistry.DecisionInput[](2);
        uint8[] memory reasons = new uint8[](0);

        inputs[0] = ClawShieldDecisionRegistry.DecisionInput({
            agentId: AGENT,
            decisionHash: keccak256("batch-1"),
            actionType: 0,
            riskScore: 20,
            reasonCodes: reasons,
            verdict: ClawShieldDecisionRegistry.Verdict.ALLOW,
            execTxRef: "tx1"
        });
        inputs[1] = ClawShieldDecisionRegistry.DecisionInput({
            agentId: AGENT,
            decisionHash: keccak256("batch-2"),
            actionType: 1,
            riskScore: 80,
            reasonCodes: reasons,
            verdict: ClawShieldDecisionRegistry.Verdict.BLOCK,
            execTxRef: ""
        });

        registry.batchRecordDecisions(inputs);
        assertEq(registry.getDecisionCount(AGENT), 2);
    }
}
