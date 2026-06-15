import { ethers } from "hardhat";
import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const DecisionRegistry = await ethers.getContractFactory("ClawShieldDecisionRegistry");
  const decisionRegistry = await DecisionRegistry.deploy();
  await decisionRegistry.waitForDeployment();
  const decisionAddr = await decisionRegistry.getAddress();
  console.log("DecisionRegistry:", decisionAddr);

  const Verified = await ethers.getContractFactory("ClawShieldVerified");
  const verified = await Verified.deploy();
  await verified.waitForDeployment();
  const verifiedAddr = await verified.getAddress();
  console.log("Verified:", verifiedAddr);

  const erc8004Rep = process.env.ERC8004_REPUTATION_REGISTRY || "0x8004B663056A597Dffe9eCcC1965A193B7388713";

  const ReputationReader = await ethers.getContractFactory("ClawShieldReputationReader");
  const reader = await ReputationReader.deploy(decisionAddr, verifiedAddr, erc8004Rep);
  await reader.waitForDeployment();
  const readerAddr = await reader.getAddress();
  console.log("ReputationReader:", readerAddr);

  const addresses = {
    decisionRegistry: decisionAddr,
    verified: verifiedAddr,
    reputationReader: readerAddr,
    erc8004Identity: process.env.ERC8004_IDENTITY_REGISTRY || "0x8004A818BFB912233c491871b3d84c89A494BD9e",
    erc8004Reputation: erc8004Rep,
    chainId: 5003,
    deployedAt: new Date().toISOString(),
  };

  const outPath = resolve(__dirname, "../deployments/mantle-sepolia.json");
  writeFileSync(outPath, JSON.stringify(addresses, null, 2));
  console.log("Saved deployments to", outPath);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
