import { network } from "hardhat";

async function main() {
  // ── v3 style — use network.connect() with exact network name ─────
  const { viem } = await network.connect("sepolia");

  const publicClient = await viem.getPublicClient();
  const [deployer]   = await viem.getWalletClients();

  console.log("► Network  : sepolia");
  console.log("► Deployer :", deployer.account.address);

  const balance = await publicClient.getBalance({
    address: deployer.account.address,
  });
  console.log("► Balance  :", (Number(balance) / 1e18).toFixed(4), "ETH");

  if (balance === 0n) {
    throw new Error("Deployer has no ETH — fund your Sepolia wallet first");
  }

  // ── Deploy Admin.sol ──────────────────────────────────────────────
  console.log("\n► Deploying Admin.sol...");
  const admin = await viem.deployContract("Admin");
  console.log("✔ Admin deployed at :", admin.address);

  // ── Read verify ───────────────────────────────────────────────────
  const superAdmin = await admin.read.SUPER_ADMIN();
  console.log("✔ SUPER_ADMIN       :", superAdmin);

  // ── Print for .env.local ──────────────────────────────────────────
  console.log("\n══════════════════════════════════════════════════");
  console.log("  Add to your Next.js .env.local:");
  console.log(`  NEXT_PUBLIC_ADMIN_CONTRACT_ADDRESS=${admin.address}`);
  console.log("══════════════════════════════════════════════════\n");
}

main().catch((error) => {
  console.error("✗ Deployment failed:", error);
  process.exit(1);
});