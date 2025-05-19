import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverComponentsExternalPackages: ["sharp", "fluent-ffmpeg"]
  },
  serverRuntimeConfig: {
    PROJECT_ROOT: process.cwd()
  }
};

export default nextConfig;
