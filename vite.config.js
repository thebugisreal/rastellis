import shopify from 'vite-plugin-shopify'
import pageReload from 'vite-plugin-page-reload'
import cleanup from '@by-association-only/vite-plugin-shopify-clean'

export default {
  plugins: [
    cleanup({
      manifestFileName: 'manifest.json',
    }),
    shopify({
      additionalEntrypoints: ['frontend/styles/modules/*.*'],
    }),
    pageReload('/tmp/theme.update', {
      log: false,
      delay: 2000,
    }),
  ],
  build: {
    emptyOutDir: false,
    manifest: 'manifest.json',
  },
  css: {
    devSourceMap: true,
  },
  server: {
    cors: true,
  },
}
