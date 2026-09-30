// POST { address, ts, signature, email, models[] } -> verifies the signed claim + holdings, then emails the user via Resend.
// issueKeys() is the hook for your env keys / database later. Keys are only ever emailed, never returned to the browser.
const { verify, holding } = require('./_lib');
async function issueKeys(address, models) { return []; } // TODO: read from env or DB, dedupe per wallet
module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
    const { address, ts, signature, email, models } = req.body || {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '') || !Array.isArray(models) || !models.length || models.length > 20 || !models.every((m) => /^[\w.\-]+\/[\w.\-:]+$/.test(m))) return res.status(400).json({ error: 'bad request' });
    if (!address || !signature || Math.abs(Date.now() - Number(ts)) > 5 * 60 * 1000) return res.status(400).json({ error: 'bad or expired request' });
    if (!verify(address, `rax claim\nwallet: ${address}\nemail: ${email}\nmodels: ${models.join(',')}\nts: ${ts}`, signature)) return res.status(401).json({ error: 'signature invalid' });
    const h = await holding(address); if (h.error) return res.json({ error: h.error }); if (!h.eligible) return res.json({ error: `hold $${h.min}+ to claim (you hold $${h.usd})` });
    const keys = await issueKeys(address, models);
    const text = `you're in. rax checked your wallet.\n\nmodels you picked:\n${models.map((m) => '- ' + m).join('\n')}\n\n` + (keys.length ? keys.map((k) => `${k.model}: ${k.key}`).join('\n') : 'your keys are being prepared. rax will write again when they are ready.') + `\n\nif you do not see this in your inbox, check your spam or promotions folder.\n\nrax will email you about usage here.\n\n— rax`;
    const r = await fetch('https://api.resend.com/emails', { method: 'POST', headers: { Authorization: 'Bearer ' + process.env.RESEND_API_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify({ from: process.env.RESEND_FROM, to: [email], subject: 'rax: your free ai access', text }) });
    res.status(r.ok ? 200 : 502).json({ ok: r.ok, error: r.ok ? undefined : 'email failed' });
  } catch (e) { res.status(500).json({ error: 'claim failed' }); }
};
