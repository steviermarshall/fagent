/**
 * email-automation-8k.js
 * Unified M–F email automation from the 8k contact list.
 *
 * Runs daily (M–F) via cron at 6:30 AM.
 * Each run:
 *   1. Sends Day 7 close-out to batches whose Day-1 was 7+ days ago
 *   2. Sends Day 3 follow-up to batches whose Day-1 was 3+ days ago
 *   3. Sends Day 1 intro to the next 100 fresh contacts
 *
 * 300 contacts per sequence type (3 x 100 batches per type within 300).
 * Pixel + click tracking via email-utils.
 * Metrics pushed to Supabase via trackSent / increment_email_sent RPC.
 */

require('dotenv').config({ path: __dirname + '/.env' });

const { google }            = require('googleapis');
const fs                    = require('fs');
const path                  = require('path');
const { buildTrackedMessage, trackSent } = require('./email-utils');

// ── Auth ────────────────────────────────────────────────────────────────────
const TOKEN_PATH       = path.join(process.env.HOME, '.openclaw/workspace/.config/token.json');
const CREDENTIALS_PATH = path.join(process.env.HOME, '.openclaw/workspace/.config/oauth-credentials.json');

const credentials  = JSON.parse(fs.readFileSync(CREDENTIALS_PATH, 'utf8'));
const { client_id, client_secret, redirect_uris } = credentials.installed;
const token        = JSON.parse(fs.readFileSync(TOKEN_PATH, 'utf8'));

const oauth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);
oauth2Client.setCredentials(token);

const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
const gmail  = google.gmail({ version: 'v1', auth: oauth2Client });

// ── Config ──────────────────────────────────────────────────────────────────
const SHEET_ID    = '16JlHXKbqllHDqiO33xFW-MWKOyKlecn1wPKjpe8-dSY';
const SHEET_GID   = 1715646922;
const BATCH_SIZE  = 100; // 100 Day1 + 100 Day3 + 100 Day7 = 300/day total
const STATE_PATH  = path.join(process.env.HOME, '.openclaw/workspace/.config/email-8k-state.json');
const LOG_DIR     = path.join(process.env.HOME, '.openclaw/workspace/logs');
const LOG_FILE    = path.join(LOG_DIR, 'email-8k.log');

// ── Revenue Tier Detection ────────────────────────────────────────────────────
function getRevenueTier(revenueStr) {
  if (!revenueStr) return 'mid';
  const n = parseFloat(String(revenueStr).replace(/[$,\s]/g, ''));
  if (isNaN(n)) return 'mid';
  if (n < 500000)  return 'small';
  if (n < 5000000) return 'mid';
  return 'large';
}

// ── Subject / Body Rotation ─────────────────────────────────────────────────
//
// Each variant is now tier-aware.
// Tiers: small (<$500K/yr) | mid ($500K-$5M) | large ($5M+)
// Subject lines rotate from 5 proven patterns per sequence day.
//
// ── Apply link (tracked via email-utils click wrapping) ───────────────────────
const APPLY_LINK = 'https://tiptop.adminbe.com/fast-application/wp_index.php?group=marshall';

const DAY1_VARIANTS = [
  {
    subject: (firstName, company) => `Quick question about ${company}'s capital`,
    body: (firstName, company, tier) => {
      const tierLine = {
        small: `We work with smaller businesses that banks routinely overlook. If ${company} is doing consistent monthly revenue, that's all we need.`,
        mid:   `We work with operators at your volume who need capital fast and can't afford a 90-day bank process. If ${company} is doing solid monthly revenue, we can move in 24-48 hours.`,
        large: `At ${company}'s revenue level, most businesses use us to free up working capital fast instead of tying up cash in slow bank processes. Decisions in 24-48 hours, no collateral.`,
      }[tier];
      return `Hey ${firstName},

${tierLine}

No banks, no collateral, no months-long wait. Worth a few minutes to see what's available?

Marshall | Director
Alternative Lending
Tiptopcap (646) 904-3737

PS — If you want to see what ${company} qualifies for right now, you can apply in 2 minutes here: ${APPLY_LINK}`;
    },
  },
  {
    subject: (firstName, company) => `${company} + Tip Top Capital?`,
    body: (firstName, company, tier) => {
      const tierLine = {
        small: `We specialize in working with smaller operations that have strong cash flow but get turned away by traditional banks. If ${company} qualifies, decisions happen in 24-48 hours.`,
        mid:   `We work with business owners at your volume who need a capital partner they can call when it matters. Fast decisions, flexible terms, no hoops.`,
        large: `Businesses at ${company}'s scale use us when they need capital moving in days, not months. No collateral, no long approval chains.`,
      }[tier];
      return `Hey ${firstName},

${tierLine}

If that's worth a conversation, I'd be happy to put together a quick look for ${company}. No commitment.

Marshall | Director
Alternative Lending
Tiptopcap (646) 904-3737

PS — Ready to see what you qualify for? Takes 2 minutes: ${APPLY_LINK}`;
    },
  },
  {
    subject: (firstName, company) => `Who handles financing for ${company}?`,
    body: (firstName, company, tier) => {
      const tierLine = {
        small: `Smaller businesses like ${company} often don't have a dedicated capital partner and end up scrambling when they need it. We change that.`,
        mid:   `A lot of owners at your volume don't realize how different the alternative side moves compared to banks. We're talking 24-48 hours from application to funded.`,
        large: `Companies at ${company}'s size often keep us on speed dial because of how fast we move. Banks can't compete on turnaround.`,
      }[tier];
      return `Hey ${firstName},

${tierLine}

No banks, no collateral. Just capital that works around your cash flow.

Worth a quick call?

Marshall | Director
Alternative Lending
Tiptopcap (646) 904-3737

PS — If you want to check what's available for ${company} without talking to anyone first: ${APPLY_LINK}`;
    },
  },
  {
    subject: (firstName, company) => `${firstName}, does ${company} have a capital plan?`,
    body: (firstName, company, tier) => {
      const tierLine = {
        small: `A lot of smaller business owners don't have a capital partner lined up until they actually need it, and that's when it gets expensive. We're easy to work with and we move fast.`,
        mid:   `Most operators doing your volume have a capital plan but it usually involves banks, which are slow. We give you a faster option with flexible terms.`,
        large: `Businesses at ${company}'s scale typically have banking relationships, but we fill the gap when you need capital in 24-48 hours instead of 90 days.`,
      }[tier];
      return `Hey ${firstName},

${tierLine}

If you don't have someone you can call when you need to move fast, I'd like to be that call for ${company}.

Marshall | Director
Alternative Lending
Tiptopcap (646) 904-3737

PS — You can see what ${company} qualifies for in about 2 minutes: ${APPLY_LINK}`;
    },
  },
  {
    subject: (firstName, company) => `Saw ${company}'s recent filing, had a thought`,
    body: (firstName, company, tier) => {
      const tierLine = {
        small: `We work with businesses like ${company} all the time. Owners who need capital but don't want the bank runaround. Decisions in 24-48 hours, no collateral.`,
        mid:   `That typically means you're either growing fast or managing cash flow. Either way, we can help ${company} move faster than a bank ever would. Decisions in 24-48 hours.`,
        large: `Businesses at your revenue level usually come to us when they want to move faster than their banking relationship allows. 24-48 hours to funded, no collateral required.`,
      }[tier];
      return `Hey ${firstName},

${tierLine}

Happy to put together a quick look for ${company} with no commitment.

Marshall | Director
Alternative Lending
Tiptopcap (646) 904-3737

PS — If you'd rather just check what's available on your own first: ${APPLY_LINK}`;
    },
  },
];

const DAY3_VARIANTS = [
  {
    subject: (firstName) => `Still thinking about it, ${firstName}?`,
    body: (firstName, company, tier) => {
      const tierLine = {
        small: `A lot of smaller business owners weren't looking for capital until they realized how fast the process actually is. 24-48 hours, no bank visit, no collateral.`,
        mid:   `Following up on the note about ${company}. If timing wasn't right before, no worries. Just want to make sure you have someone to call when you need to move fast.`,
        large: `Just circling back. If ${company} ever needs capital on a short timeline, we're built for that. Decisions in 24-48 hours, no collateral, no bank wait.`,
      }[tier];
      return `Hey ${firstName},

${tierLine}

Worth a call this week?

Marshall | Director
Alternative Lending
Tiptopcap (646) 904-3737

PS — If you want to see what ${company} qualifies for without the back and forth, apply here: ${APPLY_LINK}`;
    },
  },
  {
    subject: (firstName) => `Quick follow up, ${firstName}`,
    body: (firstName, company, tier) => {
      const tierLine = {
        small: `We work with a lot of businesses like ${company} that need capital but keep getting passed over by banks. If you've got consistent revenue, we can work with you.`,
        mid:   `Wanted to follow up on my last message. If ${company} has any growth plans, equipment needs, or cash flow gaps coming up, we can move fast on a solution.`,
        large: `Following up briefly. If ${company} ever needs a capital partner that can move in 24-48 hours instead of 90 days, that's exactly what we do.`,
      }[tier];
      return `Hey ${firstName},

${tierLine}

Happy to walk you through what's available. No obligation.

Marshall | Director
Alternative Lending
Tiptopcap (646) 904-3737

PS — You can check what you qualify for on your own time here: ${APPLY_LINK}`;
    },
  },
  {
    subject: (firstName) => `${firstName}, still here if you need it`,
    body: (firstName, company, tier) => {
      const tierLine = {
        small: `Still happy to take a look at what's available for ${company}. Smaller operations are exactly who we work with, and we move fast.`,
        mid:   `Still happy to take a look at options for ${company}. Capital in 24-48 hours, flexible terms, nothing like the bank process.`,
        large: `Still happy to explore what works for ${company}. At your revenue level there are good options that move a lot faster than traditional financing.`,
      }[tier];
      return `Hey ${firstName},

${tierLine}

If timing wasn't right before, feel free to reach out whenever it is.

Marshall | Director
Alternative Lending
Tiptopcap (646) 904-3737

PS — When you're ready, you can get started here: ${APPLY_LINK}`;
    },
  },
];

const DAY7_VARIANTS = [
  {
    subject: (firstName) => `Closing your file soon, ${firstName}`,
    body: (firstName, company, tier) => {
      const tierLine = {
        small: `Just want to make sure you know who to call if ${company} ever needs capital fast. We work with businesses your size that banks overlook. Decision in 24-48 hours.`,
        mid:   `Just want to make sure ${company} has a number to call if you ever need capital fast. We close in 24-48 hours, no bank waiting, no credit score gatekeeping.`,
        large: `Just want to make sure ${company} has a capital partner for when you need to move fast. We close in 24-48 hours. No collateral, no lengthy approval process.`,
      }[tier];
      return `Hey ${firstName},

Closing your file on ${company} soon.

${tierLine}

If you want to see what's available before I do: ${APPLY_LINK}

(646) 904-3737

Marshall | Director
Alternative Lending
Tiptopcap`;
    },
  },
  {
    subject: (firstName) => `Last message, ${firstName}`,
    body: (firstName, company, tier) => {
      return `Hey ${firstName},

This is my last note. I don't want to keep showing up in your inbox.

If ${company} ever needs capital and you want a partner who moves fast and treats you like a person, not a number, you know where to reach me.

Apply anytime: ${APPLY_LINK}

(646) 904-3737

Marshall | Director
Alternative Lending
Tiptopcap`;
    },
  },
  {
    subject: (firstName) => `One last thing, ${firstName}`,
    body: (firstName, company, tier) => {
      const tierLine = {
        small: `We've helped a lot of smaller businesses get capital quickly when they needed it, without the bank wait or rejection.`,
        mid:   `We've helped a lot of business owners get capital quickly when they needed it, without the bank wait.`,
        large: `We've helped a lot of businesses at your level access capital fast when their banking timeline couldn't keep up.`,
      }[tier];
      return `Hey ${firstName},

One last thing before I close your file.

${tierLine} If ${company} ever hits a point where fast funding matters, I'd want to be the first call.

You can see what you qualify for here: ${APPLY_LINK}

Or reach out anytime: (646) 904-3737.

Marshall | Director
Alternative Lending
Tiptopcap`;
    },
  },
];

// ── Logging ──────────────────────────────────────────────────────────────────
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

function log(msg) {
  const line = `${new Date().toISOString()}: ${msg}`;
  console.log(line);
  fs.appendFileSync(LOG_FILE, line + '\n');
}

// ── State ────────────────────────────────────────────────────────────────────
function loadState() {
  if (!fs.existsSync(STATE_PATH)) {
    return { nextRow: 1, sheetName: null, batches: [] }; // row 1 = first data row (header is row 0)
  }
  return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
}

function saveState(state) {
  const dir = path.dirname(STATE_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

// ── Sheet name from GID ──────────────────────────────────────────────────────
async function resolveSheetName() {
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const sheet = meta.data.sheets.find(s => s.properties.sheetId === SHEET_GID);
  if (!sheet) throw new Error(`Sheet with gid ${SHEET_GID} not found`);
  return sheet.properties.title;
}

// ── Read contacts ─────────────────────────────────────────────────────────────
async function getContacts(sheetName, startRow, count) {
  // startRow is 1-based data row (header = row 1, first contact = row 2 = idx 0)
  // Reads A:H to capture Annual Revenue (col G) for tier-based personalization
  const rangeStart = startRow + 1; // +1 for header
  const rangeEnd   = rangeStart + count - 1;
  const range      = `'${sheetName}'!A${rangeStart}:H${rangeEnd}`;

  const res = await sheets.spreadsheets.values.get({ spreadsheetId: SHEET_ID, range });
  return res.data.values || [];
}

// ── Send a batch ──────────────────────────────────────────────────────────────
async function sendBatch(contacts, variantFn, variantArr, sequence, batchLabel) {
  const variantIdx = Math.floor(Math.random() * variantArr.length);
  const variant    = variantArr[variantIdx];

  let sent = 0, failed = 0, skipped = 0;
  const tierCounts = { small: 0, mid: 0, large: 0 };

  for (const row of contacts) {
    if (!row || row.length < 3) { skipped++; continue; }

    // Columns: A=firstName B=lastName C=email D=company E=mainPhone F=cellPhone G=annualRevenue H=requestedAmount
    const [firstName, lastName, email, company, , , annualRevenue] = row;

    if (!email || !email.includes('@')) {
      log(`⏭  Skipped (bad email): ${firstName} ${lastName}`);
      skipped++;
      continue;
    }

    const name = firstName || 'there';
    const biz  = company   || 'your business';
    const tier = getRevenueTier(annualRevenue);
    tierCounts[tier]++;

    const subj = variant.subject(name, biz, tier);
    const body = variant.body(name, biz, tier);

    const raw = buildTrackedMessage({ to: email, subject: subj, body, sequence, batch: batchLabel });

    try {
      await gmail.users.messages.send({ userId: 'me', requestBody: { raw } });
      process.stdout.write(`✅ ${name} (${biz}) [${tier}]\n`);
      sent++;
    } catch (err) {
      log(`❌ Failed: ${name} ${lastName} <${email}> — ${err.message}`);
      failed++;
    }

    await new Promise(r => setTimeout(r, 2000)); // 2s between sends
  }

  log(`   Tiers — small: ${tierCounts.small}, mid: ${tierCounts.mid}, large: ${tierCounts.large}`);
  return { sent, failed, skipped, subject: variant.subject('X', 'BIZ', 'mid') };
}

// ── Day helpers ───────────────────────────────────────────────────────────────
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(dateStrA, dateStrB) {
  const a = new Date(dateStrA);
  const b = new Date(dateStrB);
  return Math.floor((b - a) / 86400000);
}

function isWeekday() {
  const d = new Date().getDay(); // 0=Sun, 6=Sat
  return d >= 1 && d <= 5;
}

// ── Main ──────────────────────────────────────────────────────────────────────
(async () => {
  if (!isWeekday()) {
    log('📅 Weekend — skipping email run');
    process.exit(0);
  }

  log('─'.repeat(60));
  log('🚀 email-automation-8k.js starting');

  const state  = loadState();
  const today  = todayStr();

  // Resolve sheet name once and cache it
  if (!state.sheetName) {
    log('🔍 Resolving sheet tab name from GID...');
    state.sheetName = await resolveSheetName();
    log(`📋 Sheet tab: "${state.sheetName}"`);
  }

  let totalSent    = 0;
  let totalFailed  = 0;
  const runSummary = [];

  // ── 1. Day 7 close-outs ───────────────────────────────────────────────────
  const day7Due = state.batches.filter(b => !b.day7Sent && daysBetween(b.day1Date, today) >= 7);
  for (const batch of day7Due) {
    log(`📧 Day 7 close-out for batch ${batch.id} (Day 1 was ${batch.day1Date}, ${daysBetween(batch.day1Date, today)} days ago)`);

    const contacts = await getContacts(state.sheetName, batch.start, BATCH_SIZE);
    const res = await sendBatch(contacts, null, DAY7_VARIANTS, 'day7', batch.id);

    log(`✅ Day 7 batch ${batch.id}: ${res.sent} sent, ${res.failed} failed, ${res.skipped} skipped — "${res.subject}"`);
    batch.day7Sent    = true;
    batch.day7Date    = today;
    batch.day7Subject = res.subject;
    totalSent        += res.sent;
    totalFailed      += res.failed;
    runSummary.push(`Day7 batch ${batch.id}: ${res.sent} sent`);

    if (res.sent > 0) await trackSent('day7', res.sent, res.failed, undefined, res.subject);
  }

  // ── 2. Day 3 follow-ups ───────────────────────────────────────────────────
  const day3Due = state.batches.filter(b => !b.day3Sent && daysBetween(b.day1Date, today) >= 3);
  for (const batch of day3Due) {
    log(`📧 Day 3 follow-up for batch ${batch.id} (Day 1 was ${batch.day1Date}, ${daysBetween(batch.day1Date, today)} days ago)`);

    const contacts = await getContacts(state.sheetName, batch.start, BATCH_SIZE);
    const res = await sendBatch(contacts, null, DAY3_VARIANTS, 'day3', batch.id);

    log(`✅ Day 3 batch ${batch.id}: ${res.sent} sent, ${res.failed} failed, ${res.skipped} skipped — "${res.subject}"`);
    batch.day3Sent    = true;
    batch.day3Date    = today;
    batch.day3Subject = res.subject;
    totalSent        += res.sent;
    totalFailed      += res.failed;
    runSummary.push(`Day3 batch ${batch.id}: ${res.sent} sent`);

    if (res.sent > 0) await trackSent('day3', res.sent, res.failed, undefined, res.subject);
  }

  // ── 3. Day 1 — next 100 fresh contacts ───────────────────────────────────
  const d1Start = state.nextRow; // 1-based data index

  log(`📧 Day 1 — rows ${d1Start} to ${d1Start + BATCH_SIZE - 1}`);

  const freshContacts = await getContacts(state.sheetName, d1Start, BATCH_SIZE);

  if (freshContacts.length === 0) {
    log('⚠️  No more contacts in sheet — Day 1 skipped');
  } else {
    const batchId = `8k_${today}`;
    const res     = await sendBatch(freshContacts, null, DAY1_VARIANTS, 'day1', batchId);

    log(`✅ Day 1 ${batchId}: ${res.sent} sent, ${res.failed} failed, ${res.skipped} skipped — "${res.subject}"`);

    // Record this batch for future Day 3 / Day 7 follow-ups
    state.batches.push({
      id:          batchId,
      start:       d1Start,
      count:       BATCH_SIZE,
      day1Date:    today,
      day1Subject: res.subject,
      day3Sent:    false,
      day7Sent:    false,
    });

    state.nextRow = d1Start + freshContacts.length;
    totalSent    += res.sent;
    totalFailed  += res.failed;
    runSummary.push(`Day1 ${batchId}: ${res.sent} sent`);

    if (res.sent > 0) await trackSent('day1', res.sent, res.failed, undefined, res.subject);
  }

  // ── 4. Save state ─────────────────────────────────────────────────────────
  saveState(state);

  // ── 5. Write sheet status to Supabase ─────────────────────────────────────
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL || 'https://gdbprswowbqndmcunbyj.supabase.co';
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const https = require('https');
    const totalRows = 8400;
    const currentRow = state.nextRow;
    const pct = Math.round((currentRow / totalRows) * 100);
    const statusPayload = JSON.stringify({
      current_row:   currentRow,
      total_rows:    totalRows,
      status:        currentRow >= totalRows ? 'done' : 'active',
      last_run_at:   new Date().toISOString(),
      last_run_sent: totalSent,
      last_run_failed: totalFailed,
      sequences: {
        day1: { sent: totalSent, last_date: new Date().toISOString().slice(0,10) },
      },
      updated_at: new Date().toISOString(),
    });
    const req = https.request({
      hostname: 'gdbprswowbqndmcunbyj.supabase.co',
      path: '/rest/v1/sheet_status?id=eq.email_8k',
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Length': Buffer.byteLength(statusPayload),
      },
    });
    req.write(statusPayload);
    req.end();
    log(`📡 Sheet status updated — row ${currentRow}/${totalRows} (${pct}%)`);
  } catch(e) {
    log(`⚠️  Sheet status write failed: ${e.message}`);
  }

  // ── 6. Final summary ──────────────────────────────────────────────────────
  log('─'.repeat(60));
  log(`📊 Run complete — Total sent: ${totalSent}, Failed: ${totalFailed}`);
  runSummary.forEach(s => log(`   ${s}`));
  log(`📌 Next Day 1 starting row: ${state.nextRow}`);
  log('─'.repeat(60));
})().catch(err => {
  log(`❌ Fatal error: ${err.message}`);
  console.error(err);
  // Telegram alert on fatal failure
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat  = process.env.TELEGRAM_CHAT_ID;
  if (token && chat) {
    require('https').request({
      hostname: 'api.telegram.org', port: 443, method: 'POST',
      path: `/bot${token}/sendMessage`,
      headers: { 'Content-Type': 'application/json' },
    }, () => {}).end(JSON.stringify({
      chat_id: chat,
      text: `❌ <b>email-automation-8k FAILED</b>\n${err.message}`,
      parse_mode: 'HTML',
    }));
  }
  process.exit(1);
});
