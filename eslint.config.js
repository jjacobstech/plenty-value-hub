import { configApp } from '@adonisjs/eslint-config'
import { react } from '@adonisjs/eslint-config/react'

export default [
  { ignores: ['plenty-value-hub/**', 'build/**', 'node_modules/**'] },
  ...configApp(...react),
  // React components use PascalCase filenames; shadcn UI uses custom HTML attrs; UI copy has apostrophes
  {
    files: ['inertia/**/*.{ts,tsx}'],
    rules: {
      '@unicorn/filename-case': 'off',
      'react/no-unknown-property': 'off',
      'react/no-unescaped-entities': 'off',
      '@typescript-eslint/no-shadow': 'warn',
      'react-hooks/no-nested-components': 'off',
    },
  },
  // shadcn/ui auto-generated components use patterns that violate some rules by design
  {
    files: ['inertia/components/ui/**/*.{ts,tsx}', 'inertia/hooks/**/*.{ts,tsx}'],
    rules: {
      'react-hooks/set-state-in-effect': 'off',
      'react-hooks/purity': 'off',
      '@typescript-eslint/naming-convention': 'off',
      'react-hooks/no-create-component-on-render': 'off',
    },
  },
  // Page components use valid React patterns that these rules flag
  {
    files: ['inertia/pages/**/*.{ts,tsx}'],
    rules: {
      'react-hooks/set-state-in-effect': 'off',
    },
  },
]
