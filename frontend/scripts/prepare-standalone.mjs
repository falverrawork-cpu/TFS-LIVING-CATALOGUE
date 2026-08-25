import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const projectRoot = process.cwd();
const standaloneRoot = join(projectRoot, ".next", "standalone");
const appRoot = join(standaloneRoot, "frontend");

if (!existsSync(join(appRoot, "server.js"))) {
  throw new Error("Next.js standalone server was not generated");
}

writeFileSync(join(standaloneRoot, "server.js"), 'require("./frontend/server.js");\n');

const staticSource = join(projectRoot, ".next", "static");
const staticTarget = join(appRoot, ".next", "static");
mkdirSync(join(appRoot, ".next"), { recursive: true });
cpSync(staticSource, staticTarget, { recursive: true });

const publicSource = join(projectRoot, "public");
if (existsSync(publicSource)) {
  cpSync(publicSource, join(appRoot, "public"), { recursive: true });
}

const workspacePnpm = join(projectRoot, "..", "node_modules", ".pnpm");
const standalonePnpm = join(standaloneRoot, "node_modules", ".pnpm");
const chromiumPackage = readdirSync(workspacePnpm).find((name) => name.startsWith("@sparticuz+chromium@"));
if (!chromiumPackage) throw new Error("Serverless Chromium package was not installed");
const chromiumBinSource = join(workspacePnpm, chromiumPackage, "node_modules", "@sparticuz", "chromium", "bin");
const chromiumBinTarget = join(standalonePnpm, chromiumPackage, "node_modules", "@sparticuz", "chromium", "bin");
cpSync(chromiumBinSource, chromiumBinTarget, { recursive: true });

const deploymentRoot = join(projectRoot, "dist");
rmSync(deploymentRoot, { recursive: true, force: true });
cpSync(standaloneRoot, deploymentRoot, { recursive: true });
