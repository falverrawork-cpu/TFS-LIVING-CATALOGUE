import { cpSync, existsSync, mkdirSync, renameSync, rmSync } from "node:fs";
import { join } from "node:path";

const frontendRoot = process.cwd();
const workspaceRoot = join(frontendRoot, "..");
const openNextRoot = join(frontendRoot, ".open-next");
const deploymentRoot = join(workspaceRoot, "dist");
const serverRoot = join(deploymentRoot, "server");

if (!existsSync(join(openNextRoot, "worker.js"))) {
  throw new Error("OpenNext did not produce .open-next/worker.js");
}

rmSync(deploymentRoot, { recursive: true, force: true });
mkdirSync(serverRoot, { recursive: true });
cpSync(openNextRoot, serverRoot, { recursive: true });
renameSync(join(serverRoot, "worker.js"), join(serverRoot, "index.js"));

const assetsRoot = join(openNextRoot, "assets");
if (existsSync(assetsRoot)) {
  cpSync(assetsRoot, join(deploymentRoot, "assets"), { recursive: true });
}
