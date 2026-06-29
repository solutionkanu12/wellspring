import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Some web3 dependencies reference Node's `global`; map it to the browser
  // global object so the Sui SDK works in the browser. Standard polyfill for
  // the "global is not defined" error.
  define: {
    global: 'globalThis',
  },
})
