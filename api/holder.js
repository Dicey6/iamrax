// POST { address, ts, signature(base64) } -> { eligible, usd, balance, min }. The wallet only signs text.
const { verify, holding } = require('./_lib');
module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
    const { address, ts, signature } = req.body || {};
    if (!address || !signature || Math.abs(Date.now() - Number(ts)) > 5 * 60 * 1000) return res.status(400).json({ error: 'bad or expired request' });
    if (!verify(address, `rax holder check\nwallet: ${address}\nts: ${ts}`, signature)) return res.status(401).json({ error: 'signature invalid' });
    res.json(await holding(address));
  } catch (e) { res.status(500).json({ error: 'check failed' }); }
};
