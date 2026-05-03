import { defineConfig } from 'vite'
import react from '@vitejs/react-swc' // O el plugin que estés usando

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: [
      'devserver-main--control-de-sacos-modificados.netlify.app',
      'localhost'
    ]
  }
})
