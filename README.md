# ChariGo Landing Page

Landing page for ChariGo with a working email subscription form. When a visitor
subscribes, they receive a ChariGo-branded confirmation email.

## What's inside

| Path | Purpose |
| --- | --- |
| `public/` | The website: `index.html`, `landing.css`, `landing.js`, and `assets/` |
| `api/subscribe.js` | Endpoint the form posts to. Validates the email and sends the message |
| `lib/email-template.js` | The subscription email (edit the wording and design here) |
| `lib/validate-email.js` | Email validation used by the server |
| `lib/email-assets.js` | Logo and photos embedded in the email |
| `server.js` | Small Node server for local use or any Node host |

## Email validation

1. **In the browser** (`public/landing.js`): the address must look like
   `name@example.com`. Invalid addresses show a message under the field and are never sent.
2. **On the server** (`api/subscribe.js`): the same check runs again, and the domain
   must exist and be able to receive mail, so typos like `name@gmial.con` are rejected.

The endpoint also limits each visitor to 5 attempts per 10 minutes and has a hidden
field that filters out bots.

## Run it locally

Requires Node.js 20.12 or newer.

```bash
npm install
```

```bash
cp .env.example .env
```

Fill in `.env` with the mail account that will send the emails, then:

```bash
npm start
```

Open http://localhost:3000.

### Using Gmail to send

1. Turn on 2-Step Verification for the Google account.
2. Create an app password at https://myaccount.google.com/apppasswords.
3. Set `SMTP_HOST=smtp.gmail.com`, `SMTP_PORT=465`, `SMTP_USER` to the Gmail address,
   and `SMTP_PASS` to the app password.

Any other SMTP provider (Brevo, Mailgun, SendGrid, Zoho...) works the same way with
its own host, port, user and password.

## Settings

| Variable | Required | Description |
| --- | --- | --- |
| `SMTP_HOST` | yes | SMTP server, e.g. `smtp.gmail.com` |
| `SMTP_PORT` | no | Defaults to `465` |
| `SMTP_USER` | yes | SMTP username |
| `SMTP_PASS` | yes | SMTP password or app password |
| `MAIL_FROM` | no | "From" line, e.g. `ChariGo <hello@example.com>` |
| `SITE_URL` | no | Adds a "Visit ChariGo" button to the email |
| `NOTIFY_EMAIL` | no | Receives a note each time someone subscribes |

## Deploy

**Vercel** (no extra configuration): import this repository, add the variables above
under *Settings → Environment Variables*, and deploy. `public/` is served as the site
and `api/subscribe.js` becomes the `/api/subscribe` function.

**Any Node host** (Render, Railway, a VPS...): set the variables above and use
`npm install` as the build command and `npm start` as the start command.

A static-only host (such as GitHub Pages) can show the page but cannot send the email,
because sending needs the server-side endpoint.

## Preview the email

```bash
npm run preview:email
```

Then open `email-preview.html` in a browser.
