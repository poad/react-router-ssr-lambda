// @ts-check

import { fixupConfigRules } from "@eslint/compat";
import jsxA11Y from "eslint-plugin-jsx-a11y";
import tseslint from "typescript-eslint";
// @ts-expect-error ignore errors
import _import from "eslint-plugin-import";
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

export default tseslint.config({
  ignores: [
    '**/*.{js,d.ts}'
  ],
},
  {
    ..._import.flatConfigs.recommended,
    ..._import.flatConfigs.typescript,
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 'latest',
      sourceType: 'module',
    },
    plugins: {
      'jsx-a11y': jsxA11Y,
    },
    settings: {
      "import/internal-regex": "^~/",
      'import/resolver': {
        typescript: true,
        node: true,
      },
    },
  },
  ...tseslint.configs.strict,
  ...tseslint.configs.stylistic,
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