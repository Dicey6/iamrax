// POST { email } -> sends rax's hello via Resend. Env: RESEND_API_KEY, RESEND_FROM ("rax <rax@yourdomain.com>"), optional RESEND_AUDIENCE_ID
module.exports = async (req, res) => {
  try {
    const email = String((req.body || {}).email || '').trim().slice(0, 120);
    if (req.method !== 'POST' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ error: 'bad email' });
    const h = { Authorization: 'Bearer ' + process.env.RESEND_API_KEY, 'Content-Type': 'application/json' };
    const r = await fetch('https://api.resend.com/emails', { method: 'POST', headers: h, body: JSON.stringify({ from: process.env.RESEND_FROM, to: [email], subject: 'rax here.', text: "you dropped your email. i noticed.\n\nthe model list is unlocked on the site. pick what you want, then connect your wallet to claim your free ai access. i'll write here about your usage.\n\nif you do not see this in your inbox, check your spam or promotions folder.\n\n— rax" }) });
    if (process.env.RESEND_AUDIENCE_ID) fetch(`https://api.resend.com/audiences/${process.env.RESEND_AUDIENCE_ID}/contacts`, { method: 'POST', headers: h, body: JSON.stringify({ email }) }).catch(() => {});
    res.status(r.ok ? 200 : 502).json({ ok: r.ok });
  } catch (e) { res.status(500).json({ ok: false }); }
};
