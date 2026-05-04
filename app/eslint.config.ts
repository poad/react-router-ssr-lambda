import { defineConfig } from 'eslint/config';
import jsxA11Y from "eslint-plugin-jsx-a11y";
import stylistic from '@stylistic/eslint-plugin';
import { configs, parser } from "typescript-eslint";
import { importX, createNodeResolver } from 'eslint-plugin-import-x';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all
});

export default defineConfig(
  {
    ignores: [
      '**/*.{js,d.ts}',
      '**/build/**'
    ],
    languageOptions: {
      parser,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      'jsx-a11y': jsxA11Y,
      'import-x': importX,
      '@stylistic': stylistic,
    },
    extends: [
      'import-x/flat/recommended',
    ],
    settings: {
      'import-x/resolver-next': [
        createTypeScriptImportResolver({
          alwaysTryTypes: true,
        }),
        createNodeResolver(),
      ],
    },
  },
  ...configs.strict,
  ...configs.stylistic,
  ...compat.extends(
    "plugin:react/jsx-runtime",
    "plugin:react-hooks/recommended",
  ).map(config => ({
    ...config,
    files: ["**/*.{ts,tsx}"],

    settings: {
      react: {
        version: "detect",
      },

      formComponents: ["Form"],

      linkComponents: [{
        name: "Link",
        linkAttribute: "to",
      }, {
        name: "NavLink",
        linkAttribute: "to",
      }],

      "import/resolver": {
        typescript: {},
      },
    },
  })),
);