import hre, { network } from "hardhat";

async function main() {
  // acquire viem client from the hardhat network
  const { viem } = await network.connect({ network: "hardhatMainnet" });
  const [deployer] = await viem.getWalletClients();

  console.log("Deploying from:", deployer.account.address);

  const admin = await viem.deployContract("Admin", []);

  console.log("Admin deployed at:", admin.address);
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exit(1);
});