// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title ClawShieldVerified
/// @notice Soulbound ERC-721 badge tiers for verified agents
contract ClawShieldVerified is ERC721, Ownable {
    enum Tier {
        None,
        Verified,
        Gold,
        Enterprise
    }

    struct Badge {
        Tier tier;
        uint256 expiry;
        uint256 mintedAt;
    }

    uint256 public constant BADGE_DURATION = 365 days;

    mapping(bytes32 => uint256) public agentToTokenId;
    mapping(uint256 => bytes32) public tokenIdToAgent;
    mapping(uint256 => Badge) public badges;

    uint256 private _nextTokenId = 1;

    event BadgeMinted(bytes32 indexed agentId, uint256 indexed tokenId, Tier tier, uint256 expiry);
    event BadgeRenewed(bytes32 indexed agentId, uint256 indexed tokenId, uint256 newExpiry);

    constructor() ERC721("ClawShield Verified", "CLAWV") Ownable(msg.sender) {}

    function isVerified(bytes32 agentId)
        external
        view
        returns (bool verified, uint8 tier, uint256 expiry)
    {
        uint256 tokenId = agentToTokenId[agentId];
        if (tokenId == 0) {
            return (false, 0, 0);
        }

        Badge memory badge = badges[tokenId];
        bool active = badge.tier != Tier.None && block.timestamp <= badge.expiry;
        return (active, uint8(badge.tier), badge.expiry);
    }

    function mintVerified(bytes32 agentId, Tier tier) external onlyOwner {
        require(tier != Tier.None, "Invalid tier");
        require(agentId != bytes32(0), "Invalid agent");

        uint256 existingId = agentToTokenId[agentId];
        if (existingId != 0) {
            badges[existingId].tier = tier;
            badges[existingId].expiry = block.timestamp + BADGE_DURATION;
            emit BadgeMinted(agentId, existingId, tier, badges[existingId].expiry);
            return;
        }

        uint256 tokenId = _nextTokenId++;
        _mint(owner(), tokenId);

        agentToTokenId[agentId] = tokenId;
        tokenIdToAgent[tokenId] = agentId;
        badges[tokenId] = Badge({
            tier: tier,
            expiry: block.timestamp + BADGE_DURATION,
            mintedAt: block.timestamp
        });

        emit BadgeMinted(agentId, tokenId, tier, badges[tokenId].expiry);
    }

    function renew(bytes32 agentId) external onlyOwner {
        uint256 tokenId = agentToTokenId[agentId];
        require(tokenId != 0, "No badge");
        require(badges[tokenId].tier != Tier.None, "Invalid badge");

        badges[tokenId].expiry = block.timestamp + BADGE_DURATION;
        emit BadgeRenewed(agentId, tokenId, badges[tokenId].expiry);
    }

    function transferFrom(address, address, uint256) public pure override {
        revert("Soulbound: non-transferable");
    }

    function safeTransferFrom(address, address, uint256, bytes memory) public pure override {
        revert("Soulbound: non-transferable");
    }

    /// @dev Soulbound — block internal transfers except mint/burn
}
