import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["@clawshield/core", "@clawshield/ui", "@clawshield/react"],
  outputFileTracingRoot: path.join(__dirname, "../../"),
  experimental: {
    webpackBuildWorker: false,
    cpus: 1,
  },
};

export default nextConfig;
