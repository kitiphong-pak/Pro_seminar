import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
  { ignores: ['dist', 'node_modules'] },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      // `process` ถูกใช้แบบมี typeof guard ในไฟล์ฝั่ง browser จึงประกาศเป็น readonly
      globals: { ...globals.browser, process: 'readonly' },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    settings: { react: { version: '18.3' } },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...react.configs['jsx-runtime'].rules,
      ...reactHooks.configs.recommended.rules,
      'react/jsx-no-target-blank': 'off',
      // catch {} ใช้กันพังโดยตั้งใจ (เช่น optional storage / clearInterval)
      'no-empty': ['error', { allowEmptyCatch: true }],
      // โปรเจกต์นี้ไม่ได้ใช้ PropTypes เป็นมาตรฐาน — ปิดไว้เพื่อไม่ให้กลบ error จริง
      'react/prop-types': 'off',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
    },
  },
  {
    // ไฟล์ config รันด้วย Node
    files: ['vite.config.js', 'tailwind.config.js', 'postcss.config.cjs', 'eslint.config.js'],
    languageOptions: { globals: globals.node },
  },
]
