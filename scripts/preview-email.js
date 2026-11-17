// Writes email-preview.html so the subscription email can be checked in a browser:
//   npm run preview:email
const fs = require('node:fs');
const path = require('node:path');
const assets = require('../lib/email-assets');
const { buildSubscriptionEmail } = require('../lib/email-template');

const out = path.resolve(process.argv[2] || 'email-preview.html');
let { html } = buildSubscriptionEmail({ email: 'juan.delacruz@example.com' });
for (const a of Object.values(assets)) {
  html = html.replaceAll(`cid:${a.cid}`, `data:${a.contentType};base64,${a.base64}`);
}
fs.writeFileSync(out, html);
console.log(`Wrote ${out}`);
