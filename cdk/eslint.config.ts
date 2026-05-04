import { defineConfig } from 'eslint/config';
import eslint from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import {configs, parser} from 'typescript-eslint';
import { importX, createNodeResolver } from 'eslint-plugin-import-x';
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript';
import cdkPlugin from "eslint-plugin-awscdk";

import { includeIgnoreFile } from '@eslint/compat';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve(__dirname, './.gitignore');

export default defineConfig(
  includeIgnoreFile(gitignorePath),
  {
    ignores: [
      '**/*.d.ts',
      '**/*.{js,jsx}',
      'src/tsconfig.json',
      'src/stories',
      '**/*.css',
      '**/node_modules/**/*',
      './.next/*',
      'out',
      '.storybook',
      'dist',
      '.vinxi',
      '.output',
      '**/build/**',
    ],
  },
  eslint.configs.recommended,
  ...configs.strict,
  ...configs.stylistic,
  {
    files: ['{bin,lib,lambda}/**/*.ts'],
    languageOptions: {
      parser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        tsconfigRootDir: __dirname,
        allowDefaultProject: ['eslint.config.ts'],
      },
    },
    plugins: {
      'import-x': importX,
      '@stylistic': stylistic,
    },
    extends: [
      'import-x/flat/recommended',
      cdkPlugin.configs.recommended,
    ],
    settings: {
      'import-x/resolver-next': [
        createTypeScriptImportResolver({
          alwaysTryTypes: true,
        }),
        createNodeResolver(),
      ],
    },
    rules: {
      '@stylistic/semi': ['error', 'always'],
      '@stylistic/indent': ['error', 2],
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
      '@stylistic/quotes': ['error', 'single'],
    },
  }
);
