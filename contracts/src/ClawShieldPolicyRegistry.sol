// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title ClawShieldPolicyRegistry
/// @author ClawShield
/// @notice On-chain policy hash attestation per agent for auditability
/// @dev Stores keccak256 of canonical policy JSON; agents prove policy integrity to marketplaces
contract ClawShieldPolicyRegistry {
    /// @notice Policy attestation record
    struct PolicyRecord {
        bytes32 policyHash;
        uint256 version;
        uint256 updatedAt;
        address updatedBy;
        string policyUri;
    }

    /// @notice Emitted when an agent's policy hash is attested
    event PolicyAttested(
        bytes32 indexed agentId,
        bytes32 policyHash,
        uint256 version,
        address indexed updatedBy,
        string policyUri
    );

    mapping(bytes32 => PolicyRecord) private _policies;
    mapping(bytes32 => uint256) private _versionCounter;

    /// @notice Contract owner
    address public owner;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    /// @notice Deploy with msg.sender as owner
    constructor() {
        owner = msg.sender;
    }

    /// @notice Attest or update policy hash for an agent
    /// @param agentId Agent identifier
    /// @param policyHash keccak256 of canonical policy JSON
    /// @param policyUri Optional IPFS/HTTPS URI to full policy document
    function attestPolicy(bytes32 agentId, bytes32 policyHash, string calldata policyUri) external onlyOwner {
        require(policyHash != bytes32(0), "Invalid hash");
        _versionCounter[agentId] += 1;
        _policies[agentId] = PolicyRecord({
            policyHash: policyHash,
            version: _versionCounter[agentId],
            updatedAt: block.timestamp,
            updatedBy: msg.sender,
            policyUri: policyUri
        });
        emit PolicyAttested(agentId, policyHash, _versionCounter[agentId], msg.sender, policyUri);
    }

    /// @notice Get current policy attestation for an agent
    /// @param agentId Agent identifier
    function getPolicy(bytes32 agentId) external view returns (PolicyRecord memory) {
        return _policies[agentId];
    }

    /// @notice Check if agent policy hash matches expected value
    /// @param agentId Agent identifier
    /// @param expectedHash Expected policy hash
    function verifyPolicyHash(bytes32 agentId, bytes32 expectedHash) external view returns (bool) {
        return _policies[agentId].policyHash == expectedHash && expectedHash != bytes32(0);
    }

    /// @notice Current policy version number for an agent
    /// @param agentId Agent identifier
    function getPolicyVersion(bytes32 agentId) external view returns (uint256) {
        return _versionCounter[agentId];
    }
}
