// Public values only. Set RAX_CA, RAX_TICKER, MIN_HOLD_USD in Vercel env.
module.exports = (req, res) => {
  res.setHeader('Cache-Control', 's-maxage=60');
  res.json({ ca: process.env.RAX_CA || '', ticker: process.env.RAX_TICKER || 'RAX', minUsd: Number(process.env.MIN_HOLD_USD || 50) });
};
