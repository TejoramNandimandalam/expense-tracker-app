import { FlatCompat } from "@eslint/eslintrc";

// FlatCompat lets ESLint 9 load Next.js's older-style rule sets
const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

export default [
  // Next.js rules: React, hooks, performance, web-vitals
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  // Don't check these folders
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts"] },
];