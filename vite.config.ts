import million from "million/compiler";
import { installGlobals } from "@remix-run/node";
import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

installGlobals();

export default defineConfig({
  plugins: [million.vite({ auto: true }), remix(), tsconfigPaths()],
  test: {
    include: ["./app/**/*.test.ts"],
    reporters: ["verbose"],
  },
});
