// Shared helpers (underscore = not exposed as a route on Vercel)
const crypto = require('node:crypto');
const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
const b58 = (s) => { let n = 0n; for (const c of s) { const i = B58.indexOf(c); if (i < 0) throw new Error('bad address'); n = n * 58n + BigInt(i); } let h = n.toString(16); if (h.length % 2) h = '0' + h; return Buffer.concat([Buffer.alloc(s.match(/^1*/)[0].length), Buffer.from(h, 'hex')]); };
const verify = (addr, msg, sig) => { try { const pub = b58(addr); if (pub.length !== 32) return false; const key = crypto.createPublicKey({ key: Buffer.concat([Buffer.from('302a300506032b6570032100', 'hex'), pub]), format: 'der', type: 'spki' }); return crypto.verify(null, Buffer.from(msg), key, Buffer.from(sig, 'base64')); } catch (e) { return false; } };
async function holding(address) {
  const CA = process.env.RAX_CA, min = Number(process.env.MIN_HOLD_USD || 50);
  if (!CA) return { error: 'rax has not launched yet' };
  const rpc = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
  const r = await (await fetch(rpc, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'getTokenAccountsByOwner', params: [address, { mint: CA }, { encoding: 'jsonParsed' }] }) })).json();
  const balance = (r.result?.value || []).reduce((s, a) => s + (a.account.data.parsed.info.tokenAmount.uiAmount || 0), 0);
  const pairs = await (await fetch(`https://api.dexscreener.com/tokens/v1/solana/${CA}`)).json();
  const best = (pairs || []).sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0], usd = balance * Number(best?.priceUsd || 0);
  return { eligible: usd >= min, usd: Math.round(usd * 100) / 100, balance, min };
}
module.exports = { verify, holding, b58 };
