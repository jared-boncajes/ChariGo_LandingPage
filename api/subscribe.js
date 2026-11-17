// POST /api/subscribe  { "email": "name@example.com" }
// Validates the address and sends the ChariGo subscription email.
// Works as a Vercel serverless function and is also used by server.js.
const nodemailer = require('nodemailer');
const { isValidEmailFormat, domainAcceptsMail } = require('../lib/validate-email');
const { buildSubscriptionEmail } = require('../lib/email-template');

const RATE_LIMIT = 5; // requests per window, per visitor
const RATE_WINDOW_MS = 10 * 60 * 1000;
const hits = new Map();

function isRateLimited(key) {
  const now = Date.now();
  const recent = (hits.get(key) || []).filter((t) => now - t < RATE_WINDOW_MS);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > RATE_LIMIT;
}

function send(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(body));
}

function readBody(req) {
  if (req.body !== undefined) {
    if (typeof req.body === 'string') {
      try {
        return Promise.resolve(JSON.parse(req.body));
      } catch {
        return Promise.resolve({});
      }
    }
    return Promise.resolve(req.body || {});
  }
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 10000) req.destroy();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

let transporter;
function getTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;
  if (!transporter) {
    const port = Number(SMTP_PORT) || 465;
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: process.env.SMTP_SECURE ? process.env.SMTP_SECURE === 'true' : port === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });
  }
  return transporter;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return send(res, 405, { ok: false, message: 'Method not allowed.' });
  }

  const body = await readBody(req);
  const email = typeof body.email === 'string' ? body.email.trim() : '';

  // Hidden field that real visitors never fill in; bots do.
  if (body.website) return send(res, 200, { ok: true });

  if (!isValidEmailFormat(email)) {
    return send(res, 400, { ok: false, message: 'Please enter a valid email address.' });
  }

  const visitor =
    String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() ||
    (req.socket && req.socket.remoteAddress) ||
    'unknown';
  if (isRateLimited(visitor)) {
    return send(res, 429, { ok: false, message: 'Too many attempts. Please try again in a few minutes.' });
  }

  if (!(await domainAcceptsMail(email))) {
    return send(res, 400, {
      ok: false,
      message: "That email's domain can't receive mail. Please check for typos.",
    });
  }

  const mailer = getTransporter();
  if (!mailer) {
    console.error('Subscribe failed: SMTP_HOST, SMTP_USER and SMTP_PASS are not set.');
    return send(res, 503, { ok: false, message: 'Subscriptions are not available right now. Please try again later.' });
  }

  const from = process.env.MAIL_FROM || `ChariGo <${process.env.SMTP_USER}>`;
  try {
    const message = buildSubscriptionEmail({ email, siteUrl: process.env.SITE_URL });
    await mailer.sendMail({ from, to: email, ...message });
  } catch (err) {
    console.error('Subscribe failed:', err.message);
    return send(res, 502, { ok: false, message: "We couldn't send your confirmation email. Please try again." });
  }

  // Optional: tell the site owner about each new subscriber.
  if (process.env.NOTIFY_EMAIL) {
    try {
      await mailer.sendMail({
        from,
        to: process.env.NOTIFY_EMAIL,
        subject: `New ChariGo subscriber: ${email}`,
        text: `${email} subscribed to ChariGo updates on ${new Date().toISOString()}.`,
      });
    } catch (err) {
      console.error('Owner notification failed:', err.message);
    }
  }

  return send(res, 200, { ok: true, message: `You're subscribed! We sent a confirmation to ${email}.` });
};
