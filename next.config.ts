import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const nextConfig: NextConfig = {
  distDir: process.env.SOLODESK_NEXT_DIST_DIR || ".next",
  /* config options here */
  experimental: {
    agentFeedback: true,
    globalNotFound: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
};

export default createNextIntlPlugin()(nextConfig);
