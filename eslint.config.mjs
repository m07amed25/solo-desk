import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["components/site-header.tsx", "components/landing-page.tsx", "components/auth-entry-page.tsx", "app/**/app/page.tsx"],
    // Full document links intentionally discard private/prefetched shells at account boundaries.
    rules: { "@next/next/no-html-link-for-pages": "off" },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "coverage/**",
    "**/*.min.js",
    ".agents/**",
    ".codex/**",
    ".claude/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
