const router = require('express').Router();
const pool = require('../db');
const { buildCart } = require('../cartService');

const MAX_QTY = 10;

// every route responds with the fresh cart + totals
router.get('/', async (req, res) => res.json(await buildCart(req)));

// add item
router.post('/items', async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const found = await pool.query('SELECT id FROM products WHERE id = $1', [productId]);
  if (!found.rows[0]) return res.status(404).json({ error: 'Product not found' });
  await pool.query(
    `INSERT INTO cart_items (session_id, product_id, quantity) VALUES ($1,$2,$3)
     ON CONFLICT (session_id, product_id)
     DO UPDATE SET quantity = LEAST(cart_items.quantity + $3, ${MAX_QTY})`,
    [req.sessionID, productId, quantity]
  );
  res.json(await buildCart(req));
});

// update quantity (0 removes)
router.patch('/items/:productId', async (req, res) => {
  const qty = Math.min(parseInt(req.body.quantity, 10) || 0, MAX_QTY);
  if (qty < 1) {
    await pool.query('DELETE FROM cart_items WHERE session_id=$1 AND product_id=$2', [req.sessionID, req.params.productId]);
  } else {
    await pool.query('UPDATE cart_items SET quantity=$3 WHERE session_id=$1 AND product_id=$2', [
      req.sessionID, req.params.productId, qty,
    ]);
  }
  res.json(await buildCart(req));
});

// remove item
router.delete('/items/:productId', async (req, res) => {
  await pool.query('DELETE FROM cart_items WHERE session_id=$1 AND product_id=$2', [req.sessionID, req.params.productId]);
  res.json(await buildCart(req));
});

// apply coupon
router.post('/coupon', async (req, res) => {
  const code = String(req.body.code || '').trim().toUpperCase();
  const { rows } = await pool.query('SELECT * FROM coupons WHERE code=$1 AND active', [code]);
  if (!rows[0]) return res.status(400).json({ error: 'Invalid coupon code' });

  const cart = await buildCart(req);
  if (cart.subtotal < Number(rows[0].min_order)) {
    return res.status(400).json({ error: `Add items worth ₹${Number(rows[0].min_order)} or more to use ${code}` });
  }
  req.session.coupon = code; // remembered in the session
  res.json(await buildCart(req));
});

// remove coupon
router.delete('/coupon', async (req, res) => {
  delete req.session.coupon;
  res.json(await buildCart(req));
});

module.exports = router;
