import preact from '@preact/preset-vite'
import { resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import { icsFiles } from './src/lib/calendar'

/** Emit the downloadable calendar files (.ics) for Apple Calendar / Outlook. */
function calendarFiles(): Plugin {
  return {
    name: 'calendar-ics',
    apply: 'build',
    generateBundle() {
      for (const [fileName, source] of Object.entries(icsFiles())) this.emitFile({ type: "asset", fileName, source: source as string })
    },
  }
}

/** Preload the two fonts used above the fold so names render crisply without a flash. */
function preloadFonts(): Plugin {
  return {
    name: 'preload-critical-fonts',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        if (!ctx.bundle || !ctx.filename.endsWith('index.html')) return html
        const files = Object.keys(ctx.bundle).filter((f) =>
          /(cormorant-garamond-latin-500-normal|cormorant-garamond-latin-400-italic|manrope-latin-400-normal|manrope-latin-600-normal)-[\w-]+\.woff2$/.test(f),
        )
        return {
          html,
          tags: files.map((f) => ({
            tag: 'link',
            attrs: { rel: 'preload', href: `${PREVIEW ? './' : '/'}${f}`, as: 'font', type: 'font/woff2', crossorigin: '' },
            injectTo: 'head' as const,
          })),
        }
      },
    },
  }
}

const PREVIEW = process.env.VITE_PREVIEW === '1'

export default defineConfig({
  // preview builds (static hosted demo) use relative paths and skip the admin page
  base: PREVIEW ? './' : '/',
  // Preact (React-compatible, ~40 KB lighter) keeps the invitation fast on mobile data
  plugins: [preact(), preloadFonts(), calendarFiles()],
  build: {
    target: 'es2020',
    cssCodeSplit: true,
    rollupOptions: {
      input: PREVIEW
        ? { main: resolve(__dirname, 'index.html') }
        : {
            main: resolve(__dirname, 'index.html'),
            admin: resolve(__dirname, 'admin.html'),
          },
    },
  },
  server: {
    // during `npm run dev`, forward API calls to `wrangler pages dev` (port 8788)
    proxy: { '/api': 'http://127.0.0.1:8788' },
  },
})
