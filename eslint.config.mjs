import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "react/display-name": "off", // Disable the ESLint rule
      "@typescript-eslint/no-explicit-any": "off", // Disable the ESLint rule
      "@typescript-eslint/no-unused-vars": "off", // Disable the ESLint rule
      "@next/next/no-img-element": "off", // Disable the ESLint rule
      "react-hooks/exhaustive-deps": "off",
      "prefer-const": "off",
      "react-hooks/rules-of-hooks": "off" // Add this line to disable the hooks rule
    },
  },
];    

export default eslintConfig;