import { defineConfig } from "@neon/config/v1";

export default defineConfig({
  preview: {
    realtime: {
      allowedOrigins: [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://solo-desk-eg.vercel.app",
      ],
    },
  },
  auth: true,
  branch: (branch) => {
    if (branch.isDefault) {
      return {};
    }
    if (!branch.exists) {
      return { ttl: "7d" };
    }
    return {};
  },
});
