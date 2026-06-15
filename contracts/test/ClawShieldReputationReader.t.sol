// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {ClawShieldDecisionRegistry} from "../src/ClawShieldDecisionRegistry.sol";
import {ClawShieldVerified} from "../src/ClawShieldVerified.sol";
import {ClawShieldReputationReader} from "../src/ClawShieldReputationReader.sol";

contract MockERC8004Reputation {
    mapping(uint256 => int256) public scores;

    function setScore(uint256 agentId, int256 score) external {
        scores[agentId] = score;
    }

    function getSummary(
        uint256 agentId,
        address[] calldata,
        string calldata,
        string calldata
    ) external view returns (uint256 count, int256 summaryValue, uint8 summaryValueDecimals) {
        int256 score = scores[agentId];
        if (score == 0) return (0, 0, 0);
        return (1, score, 2);
    }
}

contract ClawShieldReputationReaderTest is Test {
    ClawShieldDecisionRegistry registry;
    ClawShieldVerified verified;
    MockERC8004Reputation mockRep;
    ClawShieldReputationReader reader;
    bytes32 constant AGENT = keccak256("balanced-agent");

    function setUp() public {
        registry = new ClawShieldDecisionRegistry();
        verified = new ClawShieldVerified();
        mockRep = new MockERC8004Reputation();
        reader = new ClawShieldReputationReader(
            address(registry),
            address(verified),
            address(mockRep)
        );
    }

    function testGetClawShieldScore() public {
        uint8[] memory reasons = new uint8[](0);
        registry.recordDecision(
            AGENT,
            keccak256("d1"),
            0,
            40,
            reasons,
            ClawShieldDecisionRegistry.Verdict.ALLOW,
            "tx1"
        );
        registry.recordDecision(
            AGENT,
            keccak256("d2"),
            0,
            60,
            reasons,
            ClawShieldDecisionRegistry.Verdict.WARN,
            "tx2"
        );

        verified.mintVerified(AGENT, ClawShieldVerified.Tier.Gold);
        mockRep.setScore(uint256(AGENT), 75);

        (
            uint256 riskScore,
            uint256 violationCount,
            uint8 verifiedTier,
            uint256 decisionCount,
            uint256 erc8004Score
        ) = reader.getClawShieldScore(AGENT);

        assertEq(decisionCount, 2);
        assertEq(riskScore, 50);
        assertEq(violationCount, 0);
        assertEq(verifiedTier, uint8(ClawShieldVerified.Tier.Gold));
        assertEq(erc8004Score, 75);
    }
}
