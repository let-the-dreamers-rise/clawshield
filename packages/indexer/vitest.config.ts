import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    pool: "forks",
    environment: "node",
  },
  ssr: {
    external: ["node:sqlite"],
  },
});
