import { defineConfig, devices } from '@playwright/test'
import dotenv from 'dotenv'
import path from 'path'

// Carrega variáveis do .env.local para os testes
dotenv.config({ path: path.resolve(__dirname, '.env.local') })

// PLAYWRIGHT_BASE_URL deve apontar para o servidor já em execução.
// Localmente: inicie `npm run dev` em outro terminal antes de rodar os testes.
// Em CI / Vercel preview: defina PLAYWRIGHT_BASE_URL com a URL do ambiente.
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,     // Supabase free tier tem rate limits — serial é mais seguro
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['html', { outputFolder: 'tests/reports' }], ['list']],

  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },

  projects: [
    // Setup: cria usuários de teste antes da suíte
    { name: 'setup', testMatch: '**/global.setup.ts' },

    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
    },
  ],

  // webServer removido: o Playwright no Windows não encerra corretamente a
  // árvore de processos do `npm run dev`, acumulando instâncias Node.js a
  // cada execução e travando a máquina. Suba o servidor manualmente antes
  // de rodar os testes (`npm run dev` em outro terminal).
})
