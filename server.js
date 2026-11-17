// Serves the landing page and the subscribe endpoint:  npm start
// Use this locally or on any Node host (Render, Railway, a VPS...).
// On Vercel this file is not needed: public/ and api/ are picked up automatically.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

if (fs.existsSync(path.join(__dirname, '.env'))) process.loadEnvFile(path.join(__dirname, '.env'));

const subscribe = require('./api/subscribe');

const PUBLIC_DIR = path.join(__dirname, 'public');
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  const { pathname } = new URL(req.url, 'http://localhost');

  if (pathname === '/api/subscribe') {
    return subscribe(req, res).catch((err) => {
      console.error(err);
      res.statusCode = 500;
      res.end(JSON.stringify({ ok: false, message: 'Something went wrong. Please try again.' }));
    });
  }

  let relative;
  try {
    relative = decodeURIComponent(pathname);
  } catch {
    res.statusCode = 400;
    return res.end('Bad request');
  }
  if (relative.endsWith('/')) relative += 'index.html';
  const file = path.join(PUBLIC_DIR, relative);
  if (!file.startsWith(PUBLIC_DIR + path.sep)) {
    res.statusCode = 403;
    return res.end('Forbidden');
  }

  fs.readFile(file, (err, data) => {
    if (err) {
      res.statusCode = 404;
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.end('Not found');
    }
    res.setHeader('Content-Type', TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream');
    res.end(req.method === 'HEAD' ? undefined : data);
  });
});

const port = Number(process.env.PORT) || 3000;
server.listen(port, () => console.log(`ChariGo landing page running at http://localhost:${port}`));
