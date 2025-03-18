// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs';
import { FlatCompat } from '@eslint/eslintrc';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default withNuxt([
  {
    files: ['src/**/*.{js,mjs,cjs,jsx,ts,tsx,vue}'],
  },
  ...compat.extends(
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:vue/vue3-recommended',
    'plugin:prettier/recommended',
  ),
  {
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/no-unused-vars': 'warn',
      'no-console': 'warn',
      'no-debugger': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_' },
      ],
      'unused-imports/no-unused-imports': 'warn',
    },
    plugins: {
      'unused-imports': require('eslint-plugin-unused-imports'),
    },
  },
]);
