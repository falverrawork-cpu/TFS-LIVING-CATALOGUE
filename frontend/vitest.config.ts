import {defineConfig} from "vitest/config";
export default defineConfig({test:{include:["lib/**/*.test.ts"],exclude:["node_modules/**","node_modules.pnpm-broken/**"]},resolve:{alias:{"@":new URL(".",import.meta.url).pathname}}});
