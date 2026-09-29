// Same-origin DexScreener proxy (used if the browser blocks direct calls). GET /api/dex?p=/token-boosts/top/v1
module.exports = async (req, res) => {
  const p = String(req.query.p || '');
  if (!/^\/(token-boosts\/(top|latest)\/v1|token-profiles\/latest\/v1|tokens\/v1\/solana\/[A-Za-z0-9,]{32,1400})$/.test(p)) return res.status(400).json({ error: 'path not allowed' });
  try { const r = await fetch('https://api.dexscreener.com' + p); res.setHeader('Cache-Control', 's-maxage=30'); res.status(r.status).json(await r.json()); } catch (e) { res.status(502).json({ error: 'upstream' }); }
};
