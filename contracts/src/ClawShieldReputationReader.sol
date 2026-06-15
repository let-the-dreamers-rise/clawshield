// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ClawShieldDecisionRegistry} from "./ClawShieldDecisionRegistry.sol";
import {ClawShieldVerified} from "./ClawShieldVerified.sol";
import {IERC8004Reputation} from "./interfaces/IERC8004Reputation.sol";

/// @title ClawShieldReputationReader
/// @notice Composable view aggregating DecisionRegistry + ERC-8004 + Verified badge
contract ClawShieldReputationReader {
    ClawShieldDecisionRegistry public immutable decisionRegistry;
    ClawShieldVerified public immutable verified;
    IERC8004Reputation public immutable erc8004Reputation;

    constructor(
        address _decisionRegistry,
        address _verified,
        address _erc8004Reputation
    ) {
        decisionRegistry = ClawShieldDecisionRegistry(_decisionRegistry);
        verified = ClawShieldVerified(_verified);
        erc8004Reputation = IERC8004Reputation(_erc8004Reputation);
    }

    /// @notice Single-call marketplace query for agent trustworthiness
    function getClawShieldScore(bytes32 agentId)
        external
        view
        returns (
            uint256 riskScore,
            uint256 violationCount,
            uint8 verifiedTier,
            uint256 decisionCount,
            uint256 erc8004Score
        )
    {
        ClawShieldDecisionRegistry.AgentStats memory stats = decisionRegistry.getAgentStats(agentId);
        decisionCount = stats.totalActions;
        riskScore = stats.avgRisk;
        violationCount = stats.violations;

        (bool isVerified_, uint8 tier,) = verified.isVerified(agentId);
        verifiedTier = isVerified_ ? tier : 0;

        uint256 ercAgentId = uint256(agentId);
        address[] memory clients = new address[](0);
        try erc8004Reputation.getSummary(ercAgentId, clients, "clawshield", "guard") returns (
            uint256 count,
            int256 summaryValue,
            uint8 summaryValueDecimals
        ) {
            if (count > 0 && summaryValue > 0) {
                erc8004Score = _normalizeScore(summaryValue, summaryValueDecimals);
            }
        } catch {}
    }

    function _normalizeScore(int256 value, uint8 decimals) internal pure returns (uint256) {
        if (value <= 0) return 0;
        uint256 v = uint256(value);
        if (decimals > 2) {
            v = v / (10 ** (decimals - 2));
        } else if (decimals < 2) {
            v = v * (10 ** (2 - decimals));
        }
        return v > 100 ? 100 : v;
    }
}
