module.exports = {
  extends: 'next/core-web-vitals',
  overrides: [
    {
      files: ['src/components/layout/Hero.tsx'],
      rules: {
        'react/no-unescaped-entities': 'off'
      }
    }
  ]
} 