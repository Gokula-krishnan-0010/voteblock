import { network } from "hardhat";

async function main() {
  // ── Connect to network and get Viem clients ───────────────────────
  const connection = await network.connect("hardhatMainnet");
  const { viem }   = connection;

  const publicClient        = await viem.getPublicClient();
  const [deployer]          = await viem.getWalletClients();

  console.log("► Deployer :", deployer.account.address);

  const balance = await publicClient.getBalance({
    address: deployer.account.address,
  });
  console.log("► Balance  :", (Number(balance) / 1e18).toFixed(4), "ETH");

  // ── Deploy Admin.sol ──────────────────────────────────────────────
  // No constructor args — msg.sender becomes SUPER_ADMIN
  console.log("\n► Deploying Admin.sol...");

  const admin = await viem.deployContract("Admin");

  console.log("✔ Admin deployed at :", admin.address);

  // ── Quick read verify ─────────────────────────────────────────────
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