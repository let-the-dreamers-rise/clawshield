// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ClawShieldDecisionRegistry
/// @author ClawShield
/// @notice Permanent black-box record of every guard decision on Mantle
/// @dev Stores full decision history per agent with aggregated stats for reputation queries
contract ClawShieldDecisionRegistry {
    /// @notice Verdict enum matching off-chain guard output
    enum Verdict {
        ALLOW,
        WARN,
        BLOCK
    }

    /// @notice Single recorded guard decision
    struct Decision {
        bytes32 decisionHash;
        uint8 actionType;
        uint8 riskScore;
        uint8[] reasonCodes;
        Verdict verdict;
        string execTxRef;
        uint256 timestamp;
    }

    /// @notice Aggregated per-agent statistics
    struct AgentStats {
        uint256 totalActions;
        uint256 blocks;
        uint256 avgRisk;
        uint256 violations;
    }

    /// @notice Batch input for recordDecisions
    struct DecisionInput {
        bytes32 agentId;
        bytes32 decisionHash;
        uint8 actionType;
        uint8 riskScore;
        uint8[] reasonCodes;
        Verdict verdict;
        string execTxRef;
    }

    /// @notice Paginated history slice
    struct HistoryPage {
        Decision[] decisions;
        uint256 total;
        uint256 offset;
        uint256 limit;
    }

    /// @notice Emitted when a decision is permanently recorded
    event DecisionRecorded(
        bytes32 indexed agentId,
        bytes32 indexed decisionHash,
        uint8 actionType,
        uint8 riskScore,
        uint8[] reasonCodes,
        uint8 verdict,
        string execTxRef
    );

    mapping(bytes32 => Decision[]) private _history;
    mapping(bytes32 => AgentStats) private _stats;
    mapping(bytes32 => uint256) private _riskSum;

    /// @notice Contract owner authorized to record decisions
    address public owner;

    /// @notice Restricts mutating calls to owner
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    /// @notice Deploy registry with msg.sender as owner
    constructor() {
        owner = msg.sender;
    }

    /// @notice Record a single guard decision on-chain
    /// @param agentId Unique agent identifier (keccak256 of agent string id)
    /// @param decisionHash Deterministic hash of the guard payload
    /// @param actionType Encoded action type (0=swap, 1=lp_open, etc.)
    /// @param riskScore Risk score 0-100 from ClawShield engine
    /// @param reasonCodes Array of reason code indices
    /// @param verdict ALLOW, WARN, or BLOCK
    /// @param execTxRef Execution tx reference (Solana hash or empty if blocked)
    function recordDecision(
        bytes32 agentId,
        bytes32 decisionHash,
        uint8 actionType,
        uint8 riskScore,
        uint8[] calldata reasonCodes,
        Verdict verdict,
        string calldata execTxRef
    ) external onlyOwner {
        _recordOne(agentId, decisionHash, actionType, riskScore, reasonCodes, verdict, execTxRef);
    }

    /// @notice Batch record multiple decisions in one transaction
    /// @param inputs Array of decision payloads
    function batchRecordDecisions(DecisionInput[] calldata inputs) external onlyOwner {
        for (uint256 i = 0; i < inputs.length; i++) {
            DecisionInput calldata input = inputs[i];
            _recordOne(
                input.agentId,
                input.decisionHash,
                input.actionType,
                input.riskScore,
                input.reasonCodes,
                input.verdict,
                input.execTxRef
            );
        }
    }

    /// @notice Return full decision history for an agent
    /// @param agentId Agent identifier
    /// @return Full array of decisions (use paginated variant for large histories)
    function getAgentHistory(bytes32 agentId) external view returns (Decision[] memory) {
        return _history[agentId];
    }

    /// @notice Return paginated decision history (newest first)
    /// @param agentId Agent identifier
    /// @param offset Number of most recent decisions to skip
    /// @param limit Maximum decisions to return
    function getAgentHistoryPaginated(bytes32 agentId, uint256 offset, uint256 limit)
        external
        view
        returns (HistoryPage memory page)
    {
        Decision[] storage hist = _history[agentId];
        uint256 total = hist.length;
        page.total = total;
        page.offset = offset;
        page.limit = limit;

        if (total == 0 || offset >= total || limit == 0) {
            return page;
        }

        uint256 end = total - offset;
        uint256 start = end > limit ? end - limit : 0;
        uint256 count = end - start;
        page.decisions = new Decision[](count);

        for (uint256 i = 0; i < count; i++) {
            page.decisions[i] = hist[start + i];
        }
    }

    /// @notice Return aggregated stats for an agent
    /// @param agentId Agent identifier
    function getAgentStats(bytes32 agentId) external view returns (AgentStats memory) {
        return _stats[agentId];
    }

    /// @notice Return total decision count for an agent
    /// @param agentId Agent identifier
    function getDecisionCount(bytes32 agentId) external view returns (uint256) {
        return _history[agentId].length;
    }

    /// @notice Fetch a single decision by index (0 = oldest)
    /// @param agentId Agent identifier
    /// @param index Decision index
    function getDecisionAt(bytes32 agentId, uint256 index) external view returns (Decision memory) {
        require(index < _history[agentId].length, "Index OOB");
        return _history[agentId][index];
    }

    /// @dev Internal record + stats update
    function _recordOne(
        bytes32 agentId,
        bytes32 decisionHash,
        uint8 actionType,
        uint8 riskScore,
        uint8[] calldata reasonCodes,
        Verdict verdict,
        string calldata execTxRef
    ) internal {
        require(decisionHash != bytes32(0), "Invalid hash");

        _history[agentId].push(
            Decision({
                decisionHash: decisionHash,
                actionType: actionType,
                riskScore: riskScore,
                reasonCodes: reasonCodes,
                verdict: verdict,
                execTxRef: execTxRef,
                timestamp: block.timestamp
            })
        );

        AgentStats storage stats = _stats[agentId];
        stats.totalActions += 1;
        _riskSum[agentId] += riskScore;
        stats.avgRisk = _riskSum[agentId] / stats.totalActions;

        if (verdict == Verdict.BLOCK) {
            stats.blocks += 1;
        }

        for (uint256 i = 0; i < reasonCodes.length; i++) {
            if (_isCriticalViolation(reasonCodes[i])) {
                stats.violations += 1;
                break;
            }
        }

        emit DecisionRecorded(
            agentId,
            decisionHash,
            actionType,
            riskScore,
            reasonCodes,
            uint8(verdict),
            execTxRef
        );
    }

    /// @dev Critical codes: SLIPPAGE_EXCEEDED(0), OVEREXPOSED(2), TOKEN_NOT_ALLOWLISTED(3)
    function _isCriticalViolation(uint8 code) internal pure returns (bool) {
        return code == 0 || code == 2 || code == 3;
    }
}
