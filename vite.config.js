import { defineConfig } from 'vite'
import checker from 'vite-plugin-checker'

export default defineConfig((a) => {
  const IS_PRODUCTION = a.mode === 'production'

  const tsConfig = IS_PRODUCTION ? 'tsconfig.prod.json' : 'tsconfig.dev.json'

  return {
    plugins: [
      checker({
        typescript: {
          tsconfigPath: tsConfig
        },
        lintCommand: 'eslint "./src/**/*.{ts}"'
      })
    ]
  }
})
