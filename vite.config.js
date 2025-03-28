import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill'
import path from 'path'
import rollupNodePolyFill from 'rollup-plugin-node-polyfills'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      process: 'process/browser',
      stream: 'stream-browserify',
      zlib: 'browserify-zlib',
      util: 'util',
      buffer: 'buffer/',
      '@': path.resolve(__dirname, './src'),
      events: path.resolve(__dirname, 'node_modules/events/events.js'),
      'node-fetch': 'isomorphic-fetch'
    }
  },
  define: {
    'process.env': {},
    global: 'globalThis',
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
          process: true
        }),
        NodeModulesPolyfillPlugin()
      ]
    },
    include: [
      'buffer',
      'process',
      'events',
      'util',
      'stream-browserify',
      'browserify-zlib',
      'web3',
      'eth-rpc-errors',
      '@metamask/sdk'
    ]
  },
  build: {
    rollupOptions: {
      plugins: [rollupNodePolyFill()],
      output: {
        manualChunks: {
          vendor: [
            'vue',
            'vue-router',
            '@wagmi/core',
            'ethers',
            '@metamask/sdk',
          ]
        }
      }
    },
    commonjsOptions: {
      transformMixedEsModules: true
    }
  }
})