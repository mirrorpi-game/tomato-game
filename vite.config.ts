import { defineConfig } from 'vite'

export default defineConfig({
  base: '/tomato-game/', // GitHub 레포지토리 이름에 맞게 수정
  server: {
    port: 3000,
    open: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets'
  }
})
