/**
 * Rate limiting for the lead actions.
 *
 * WHY IT EXISTS. Every accepted submission spends two Resend sends. The account
 * is on the free tier — 100 emails a day, 3,000 a month — so about fifty POSTs
 * exhausts a day's allowance. After that every genuine enquiry fails and the
 * customer is shown "That did not send, ring us", while the decorator never
 * learns the lead existed. A few seconds of a for-loop costs the business a
 * day of leads, and there was nothing in front of it: the honeypot and the
 * four-second dwell test are both driven by values the caller supplies, and a
 * Server Action is an ordinary POST endpoint that curl can call directly.
 *
 * BE HONEST ABOUT WHAT THIS IS. The counters live in the module scope of one
 * serverless instance. That is genuinely useful — it bounds a naive flood from
 * a single source, which is the attack that actually happens to a decorator's
 * website — but it is NOT a distributed rate limiter:
 *
 *   - Vercel may run several instances, so a determined attacker gets the limit
 *     multiplied by however many are warm.
 *   - An idle instance is recycled and its counters go with it.
 *
 * The honest fix for a site under real attack is a Vercel Firewall rate-limit
 * rule on POST to /quote and /contact (no code, no dependency), or Upstash
 * Redis behind @upstash/ratelimit. Both need an account and a dashboard, so
 * neither can be committed here. This is the part that CAN be committed, it
 * closes the trivial version of the attack, and it costs nothing.
 *
 * THE GLOBAL CAP IS THE ONE THAT PROTECTS THE BUSINESS. Per-IP limits are
 * bypassed by rotating IPs; the daily ceiling is not, because it counts sends
 * rather than callers. It is set below the Resend allowance on purpose: if
 * something does get through, the site stops sending BEFORE the provider cuts
 * it off, so the failure is one we control and can see in the logs rather than
 * a silent bounce at the provider.
 */

type Bucket = { count: number; resetAt: number };

const perIp = new Map<string, Bucket>();
const perEmail = new Map<string, Bucket>();
let globalDay: Bucket = { count: 0, resetAt: 0 };

/** Sends per address per day. A person asking twice is fine; forty is not. */
const EMAIL_PER_DAY = 3;
/** Submissions per IP per hour. A household behind one NAT can still enquire. */
const IP_PER_HOUR = 5;
/**
 * Site-wide submissions per day. Two sends each, so 40 is 80 emails against a
 * 100/day allowance — the remaining headroom is deliberate.
 */
const GLOBAL_PER_DAY = 40;

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

/** Hard ceiling on tracked keys, per map. */
const MAX_KEYS = 5000;

/**
 * Bounds the map, expired buckets first.
 *
 * EXPIRY ALONE IS NOT A BOUND, which is what this used to be and what its
 * comment still claimed. Under the only condition that actually grows these
 * maps — a flood of distinct keys inside one window — every bucket is still
 * live, so an expiry-only sweep frees nothing while rescanning the whole map on
 * every single call: measured at 6ms per 5,000 calls rising to over a second as
 * the map grew, which is quadratic work on the request path, and the map grew
 * anyway.
 *
 * So expired buckets go first, and if that was not enough, the oldest live ones
 * go too. Evicting a live bucket forgives whatever that key had spent, which is
 * the right way to be wrong: the global daily cap below is the backstop that
 * actually protects the email allowance, and it cannot be evicted.
 *
 * Map iteration is insertion-ordered, so "oldest first" is just the front of
 * the map.
 */
function sweep(map: Map<string, Bucket>, now: number) {
  if (map.size < MAX_KEYS) return;
  for (const [key, bucket] of map) if (bucket.resetAt <= now) map.delete(key);
  if (map.size < MAX_KEYS) return;
  const excess = map.size - MAX_KEYS + 1;
  let dropped = 0;
  for (const key of map.keys()) {
    if (dropped >= excess) break;
    map.delete(key);
    dropped += 1;
  }
}

function take(map: Map<string, Bucket>, key: string, limit: number, window: number, now: number) {
  sweep(map, now);
  const bucket = map.get(key);
  if (!bucket || bucket.resetAt <= now) {
    map.set(key, { count: 1, resetAt: now + window });
    return true;
  }
  if (bucket.count >= limit) return false;
  bucket.count += 1;
  return true;
}

export type RateVerdict = { ok: true } | { ok: false; reason: "ip" | "email" | "global" };

/**
 * Consumes one unit of allowance. Call once per accepted submission, AFTER
 * validation and the bot checks — a request that was never going to send an
 * email should not use up a real customer's budget.
 */
export function consumeLeadAllowance(ip: string, email: string, now = Date.now()): RateVerdict {
  if (globalDay.resetAt <= now) globalDay = { count: 0, resetAt: now + DAY };
  if (globalDay.count >= GLOBAL_PER_DAY) return { ok: false, reason: "global" };

  /* The email cap is checked BEFORE the IP bucket is created. take() inserts on
     first sight of a key, so doing the IP first meant every rejected submission
     still minted a bucket — a flood on one email address filled the IP map with
     entries for requests that were never allowed through. Reading the email
     bucket without consuming it keeps the two independent: nothing is spent
     unless both caps allow the send. */
  const emailKey = email.toLowerCase();
  const emailBucket = perEmail.get(emailKey);
  if (emailBucket && emailBucket.resetAt > now && emailBucket.count >= EMAIL_PER_DAY) {
    return { ok: false, reason: "email" };
  }

  if (!take(perIp, ip, IP_PER_HOUR, HOUR, now)) return { ok: false, reason: "ip" };
  if (!take(perEmail, emailKey, EMAIL_PER_DAY, DAY, now)) {
    return { ok: false, reason: "email" };
  }

  globalDay.count += 1;
  return { ok: true };
}

/** Test seam — the buckets are module state and would otherwise leak between runs. */
export function resetLeadAllowance() {
  perIp.clear();
  perEmail.clear();
  globalDay = { count: 0, resetAt: 0 };
}
