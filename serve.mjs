// Static file server for the project root.
// Usage: node serve.mjs [port]   (default 3000)

import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize, resolve } from 'node:path'

const ROOT = resolve(import.meta.dirname)
const PORT = Number(process.argv[2]) || 3000

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.pdf': 'application/pdf',
  '.txt': 'text/plain; charset=utf-8',
}

async function resolveFile(urlPath) {
  // Strip query/hash, decode, and block traversal outside ROOT.
  const clean = decodeURIComponent(urlPath.split('?')[0].split('#')[0])
  const target = join(ROOT, normalize(clean).replace(/^(\.\.[/\\])+/, ''))
  if (!target.startsWith(ROOT)) return null

  try {
    const info = await stat(target)
    if (info.isDirectory()) {
      const index = join(target, 'index.html')
      await stat(index)
      return index
    }
    return target
  } catch {
    return null
  }
}

const server = createServer(async (req, res) => {
  const file = await resolveFile(req.url || '/')

  if (!file) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
    res.end('404 Not Found')
    return
  }

  try {
    const body = await readFile(file)
    res.writeHead(200, {
      'content-type': MIME[extname(file).toLowerCase()] || 'application/octet-stream',
      // No caching — screenshots must always reflect the latest edit.
      'cache-control': 'no-store, must-revalidate',
    })
    res.end(body)
  } catch {
    res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' })
    res.end('500 Internal Server Error')
  }
})

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use — a server is likely already running.`)
    process.exit(1)
  }
  throw err
})

server.listen(PORT, () => {
  console.log(`Serving ${ROOT} at http://localhost:${PORT}`)
})
