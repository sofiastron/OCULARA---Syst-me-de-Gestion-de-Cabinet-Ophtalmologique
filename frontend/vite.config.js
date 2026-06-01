import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})

// import basicSsl from '@vitejs/plugin-basic-ssl'

// export default {
//   plugins: [react(), basicSsl()],
//   server: { https: true, host: true }
// }