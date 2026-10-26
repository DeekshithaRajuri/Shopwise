const pool = require('./db');

const round2 = (n) => Math.round(n * 100) / 100;

// Builds the full cart for the current session, with totals.
// Totals are ALWAYS calculated on the server so the browser can't cheat.
async function buildCart(req) {
  const { rows } = await pool.query(
    `SELECT p.id, p.name, p.price, p.image, ci.quantity
       FROM cart_items ci JOIN products p ON p.id = ci.product_id
      WHERE ci.session_id = $1
      ORDER BY ci.added_at`,
    [req.sessionID]
  );
  const items = rows.map((r) => ({ ...r, price: Number(r.price), lineTotal: round2(Number(r.price) * r.quantity) }));
  const subtotal = round2(items.reduce((sum, i) => sum + i.lineTotal, 0));

  let discount = 0;
  let coupon = null;
  let couponNote = null;

  const code = req.session.coupon;
  if (code) {
    const { rows: found } = await pool.query('SELECT * FROM coupons WHERE code = $1 AND active', [code]);
    const c = found[0];
    if (!c) {
      delete req.session.coupon;
    } else if (subtotal < Number(c.min_order)) {
      couponNote = `${c.code} needs a cart of at least ₹${Number(c.min_order)}`;
    } else {
      discount = c.type === 'PERCENT' ? (subtotal * Number(c.value)) / 100 : Number(c.value);
      discount = round2(Math.min(discount, subtotal)); // never more than the subtotal
      coupon = { code: c.code, description: c.description };
    }
  }

  return { items, subtotal, discount, total: round2(subtotal - discount), coupon, couponNote };
}

module.exports = { buildCart };
