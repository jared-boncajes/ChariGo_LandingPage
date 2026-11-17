// Subscriber list, stored in Upstash Redis (connected through Vercel's Storage tab).
// All subscribers live in one hash: field = email address, value = date subscribed.
const KEY = 'charigo:subscribers';

function config() {
  const env = process.env;
  const url = env.SUBSCRIBERS_KV_REST_API_URL || env.KV_REST_API_URL || env.UPSTASH_REDIS_REST_URL;
  const token = env.SUBSCRIBERS_KV_REST_API_TOKEN || env.KV_REST_API_TOKEN || env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url, token } : null;
}

// Without a database (for example when running locally) nothing is remembered,
// so every subscription is treated as new.
function isConfigured() {
  return config() !== null;
}

async function command(...args) {
  const { url, token } = config();
  const response = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
    signal: AbortSignal.timeout(5000),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.error) throw new Error(data.error || `Subscriber store returned ${response.status}`);
  return data.result;
}

// Capital letters don't make a different mailbox, so Name@Example.com and
// name@example.com count as the same subscriber.
function normalize(email) {
  return email.trim().toLowerCase();
}

// Saves the address and returns true, or returns false if it was already on the list.
async function addSubscriber(email) {
  const added = await command('HSETNX', KEY, normalize(email), new Date().toISOString());
  return added === 1;
}

async function removeSubscriber(email) {
  await command('HDEL', KEY, normalize(email));
}

module.exports = { isConfigured, addSubscriber, removeSubscriber };
