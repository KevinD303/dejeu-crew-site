import { defineConfig } from 'vite'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { appendFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'

const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * Local inquiry + deposit-intent logger for `vite` / `vite preview`.
 * Appends JSON lines to data/inquiries.jsonl — no secrets, no Stripe, no email.
 * Replace with Formspree / Resend / Stripe Checkout in production.
 */
function bookingApiPlugin() {
  async function handleBooking(req, res, next) {
    const isInquiry = req.url === '/api/inquiry' && req.method === 'POST'
    const isDeposit = req.url === '/api/deposit-intent' && req.method === 'POST'
    if (!isInquiry && !isDeposit) {
      return next()
    }

    const chunks = []
    for await (const chunk of req) chunks.push(chunk)
    const raw = Buffer.concat(chunks).toString('utf8')

    let body
    try {
      body = JSON.parse(raw || '{}')
    } catch {
      res.statusCode = 400
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ ok: false, error: 'Invalid JSON' }))
      return
    }

    const entry = {
      ...body,
      type: body.type || (isDeposit ? 'deposit_intent' : 'inquiry'),
      receivedAt: new Date().toISOString(),
      userAgent: req.headers['user-agent'] || '',
    }

    try {
      const dir = resolve(__dirname, 'data')
      if (!existsSync(dir)) await mkdir(dir, { recursive: true })
      await appendFile(
        resolve(dir, 'inquiries.jsonl'),
        JSON.stringify(entry) + '\n',
        'utf8'
      )
    } catch (err) {
      console.error('[booking] write failed', err)
      res.statusCode = 500
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ ok: false, error: 'Could not save booking request' }))
      return
    }

    const label = entry.type === 'deposit_intent' ? 'deposit-intent' : 'inquiry'
    console.log(`[${label}] saved`, entry.email || '(no email)', entry.package || '')
    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ ok: true, type: entry.type }))
  }

  return {
    name: 'dejeu-booking-api',
    configureServer(server) {
      server.middlewares.use(handleBooking)
    },
    configurePreviewServer(server) {
      server.middlewares.use(handleBooking)
    },
  }
}

export default defineConfig({
  root: '.',
  publicDir: 'public',
  plugins: [bookingApiPlugin()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        book: resolve(__dirname, 'book.html'),
      },
    },
  },
})
