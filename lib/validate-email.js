const dns = require('node:dns').promises;

// Same rule as public/landing.js: one "@", a sensible local part, and a domain
// with at least one dot and an alphabetic top-level domain.
const EMAIL_PATTERN =
  /^[A-Za-z0-9_%+-]+(?:\.[A-Za-z0-9_%+-]+)*@(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+[A-Za-z]{2,24}$/;

function isValidEmailFormat(value) {
  if (typeof value !== 'string') return false;
  const email = value.trim();
  if (email.length === 0 || email.length > 254) return false;
  if (email.split('@')[0].length > 64) return false;
  return EMAIL_PATTERN.test(email);
}

// True when the domain can receive mail. Only a definite "this domain does not
// exist / has no mail server" answer rejects the address; a DNS outage does not.
async function domainAcceptsMail(email, timeoutMs = 4000) {
  const domain = email.slice(email.lastIndexOf('@') + 1);
  const lookup = (async () => {
    try {
      const records = await dns.resolveMx(domain);
      if (records.some((r) => r.exchange && r.exchange !== '.')) return true;
      return false;
    } catch (err) {
      if (err.code === 'ENODATA') {
        // No MX record: mail falls back to the domain's address record.
        try {
          return (await dns.resolve4(domain)).length > 0;
        } catch (fallbackErr) {
          return !['ENODATA', 'ENOTFOUND'].includes(fallbackErr.code);
        }
      }
      return err.code !== 'ENOTFOUND';
    }
  })();
  const timeout = new Promise((resolve) => setTimeout(() => resolve(true), timeoutMs));
  return Promise.race([lookup, timeout]);
}

module.exports = { isValidEmailFormat, domainAcceptsMail };
