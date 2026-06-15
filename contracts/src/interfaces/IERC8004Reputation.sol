// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC8004Reputation {
    function getSummary(
        uint256 agentId,
        address[] calldata clientAddresses,
        string calldata tag1,
        string calldata tag2
    ) external view returns (uint256 count, int256 summaryValue, uint8 summaryValueDecimals);
}
