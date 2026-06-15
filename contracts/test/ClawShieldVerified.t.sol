// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {ClawShieldVerified} from "../src/ClawShieldVerified.sol";

contract ClawShieldVerifiedTest is Test {
    ClawShieldVerified verified;
    bytes32 constant AGENT = keccak256("safe-agent");

    function setUp() public {
        verified = new ClawShieldVerified();
    }

    function testMintVerified() public {
        verified.mintVerified(AGENT, ClawShieldVerified.Tier.Verified);

        (bool isVerified_, uint8 tier, uint256 expiry) = verified.isVerified(AGENT);
        assertTrue(isVerified_);
        assertEq(tier, uint8(ClawShieldVerified.Tier.Verified));
        assertGt(expiry, block.timestamp);
    }

    function testRenewExtendsExpiry() public {
        verified.mintVerified(AGENT, ClawShieldVerified.Tier.Gold);
        (, , uint256 expiryBefore) = verified.isVerified(AGENT);

        vm.warp(block.timestamp + 100 days);
        verified.renew(AGENT);

        (, , uint256 expiryAfter) = verified.isVerified(AGENT);
        assertGt(expiryAfter, expiryBefore);
    }

    function testSoulboundTransferReverts() public {
        verified.mintVerified(AGENT, ClawShieldVerified.Tier.Verified);
        uint256 tokenId = verified.agentToTokenId(AGENT);
        address holder = verified.owner();

        vm.expectRevert("Soulbound: non-transferable");
        verified.transferFrom(holder, address(0xBEEF), tokenId);
    }

    function testUpgradeTier() public {
        verified.mintVerified(AGENT, ClawShieldVerified.Tier.Verified);
        verified.mintVerified(AGENT, ClawShieldVerified.Tier.Enterprise);

        (, uint8 tier,) = verified.isVerified(AGENT);
        assertEq(tier, uint8(ClawShieldVerified.Tier.Enterprise));
    }
}
