import base from "@arnaud-zg/configs/eslint";
import { defineConfig } from "eslint/config";

export default defineConfig(...base, {
  files: ["**/*.{ts,tsx}"],
  languageOptions: {
    parserOptions: {
      project: ["./tsconfig.json", "./tsconfig.vitest.json"],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
