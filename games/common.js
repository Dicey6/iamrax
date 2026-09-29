// Shared helpers for the Rax games.
const G = {
  best(id) { try { return +localStorage.getItem('raxgames:best:' + id) || 0; } catch (e) { return 0; } },
  save(id, s) { try { if (s > G.best(id)) localStorage.setItem('raxgames:best:' + id, s); } catch (e) {} },
  img(src) { const i = new Image(); i.src = src; return i; },
  ok(i) { return i && i.complete && i.naturalWidth > 0; },
  cl: (x, a, b) => Math.min(b, Math.max(a, x)),
  rnd: (a, b) => a + Math.random() * (b - a),
  setup(canvas, W, H, reserve = 0) {
    const dpr = Math.min(devicePixelRatio || 1, 2), ctx = canvas.getContext('2d');
    canvas.width = W * dpr; canvas.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const fit = () => { const k = Math.min(innerWidth / W, (innerHeight - reserve) / H); canvas.style.width = W * k + 'px'; canvas.style.height = H * k + 'px'; };
    addEventListener('resize', fit); fit(); return ctx;
  },
  pos(canvas, e, W, H) { const r = canvas.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H }; },
  bg(ctx, img, W, H, c1, c2) {
    if (G.ok(img)) { const k = Math.max(W / img.naturalWidth, H / img.naturalHeight); ctx.drawImage(img, (W - img.naturalWidth * k) / 2, (H - img.naturalHeight * k) / 2, img.naturalWidth * k, img.naturalHeight * k); return; }
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, c1 || '#0a1633'); g.addColorStop(1, c2 || '#050810'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  },
  text(ctx, t, x, y, size, color, align) { ctx.font = '900 ' + size + 'px ui-monospace,Menlo,monospace'; ctx.textAlign = align || 'center'; ctx.fillStyle = color || '#fff'; ctx.fillText(t, x, y); },
  rax(ctx, x, y, s, o = {}) {
    if (G.ok(G.sprite)) { ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0); ctx.drawImage(G.sprite, -s, -s * 1.7, s * 2, s * 3.4); ctx.restore(); return; }
    const eye = o.eye ?? 1, smile = o.smile ?? .4, open = o.open || 0, w = s, h = s * 1.7;
    ctx.save(); ctx.translate(x, y); ctx.rotate(o.rot || 0);
    const path = () => { ctx.beginPath(); ctx.arc(0, -h + w, w, Math.PI, 0); ctx.lineTo(w, h - w); ctx.arc(0, h - w, w, 0, Math.PI); ctx.closePath(); };
    ctx.save(); path(); ctx.clip(); ctx.fillStyle = '#F3F6FF'; ctx.fillRect(-w, -h, w * 2, h); ctx.fillStyle = '#3B63FF'; ctx.fillRect(-w, 0, w * 2, h); ctx.fillStyle = 'rgba(255,255,255,.3)'; ctx.fillRect(-w * .62, -h * .85, w * .22, h * 1.7); ctx.fillStyle = '#0A1633'; ctx.fillRect(-w, -s * .05, w * 2, s * .1); ctx.restore();
    path(); ctx.lineWidth = Math.max(2, s * .08); ctx.strokeStyle = '#0A1633'; ctx.stroke();
    const ey = -h * .38, ex = w * .42, ink = '#1a2a66';
    [-1, 1].forEach((sd) => { if (o.dizzy) { ctx.strokeStyle = ink; ctx.lineWidth = s * .08; const r = w * .14; ctx.beginPath(); ctx.moveTo(sd * ex - r, ey - r); ctx.lineTo(sd * ex + r, ey + r); ctx.moveTo(sd * ex + r, ey - r); ctx.lineTo(sd * ex - r, ey + r); ctx.stroke(); return; } ctx.fillStyle = ink; ctx.beginPath(); ctx.ellipse(sd * ex, ey, w * .2, w * .2 * Math.max(.06, eye), 0, 0, 6.283); ctx.fill(); if (eye > .4) { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(sd * ex + w * .06, ey - w * .06, w * .06, 0, 6.283); ctx.fill(); } if (smile > .5) { ctx.fillStyle = 'rgba(255,143,178,.55)'; ctx.beginPath(); ctx.arc(sd * w * .66, ey + w * .34, w * .13, 0, 6.283); ctx.fill(); } });
    const my = -h * .14; ctx.fillStyle = ink; ctx.strokeStyle = ink; ctx.lineWidth = s * .09; ctx.lineCap = 'round';
    if (open > .05) { ctx.beginPath(); ctx.ellipse(0, my + w * .06, w * .16, w * .26 * open, 0, 0, 6.283); ctx.fill(); } else { ctx.beginPath(); ctx.moveTo(-w * .26, my); ctx.quadraticCurveTo(0, my + smile * w * .5, w * .26, my); ctx.stroke(); }
    ctx.restore();
  },
  shadow(ctx, x, y, r, a) { ctx.fillStyle = 'rgba(111,227,255,' + a + ')'; ctx.beginPath(); ctx.ellipse(x, y, r, r * .28, 0, 0, 6.283); ctx.fill(); }
};
G.sprite = G.img('assets/rax.png');