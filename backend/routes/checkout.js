const router = require('express').Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const pool = require('../db');
const { buildCart } = require('../cartService');

// Razorpay is optional: without keys the app runs in "demo" mode (no payment popup).
const hasKeys = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET;
const razorpay = hasKeys
  ? new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET })
  : null;

// Marks the order as paid and empties the cart.
async function finalizeOrder(req, orderId, paymentId) {
  await pool.query(`UPDATE orders SET status='PAID', razorpay_payment_id=$2 WHERE id=$1`, [orderId, paymentId]);
  await pool.query('DELETE FROM cart_items WHERE session_id=$1', [req.sessionID]);
  delete req.session.coupon;
}

// Step 1: save the order (PENDING) and create a Razorpay order
router.post('/create-order', async (req, res) => {
  const { name, email, phone } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'Name and email are required' });

  const cart = await buildCart(req);
  if (!cart.items.length) return res.status(400).json({ error: 'Your cart is empty' });

  const orderNumber = 'ORD-' + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 90 + 10);

  const client = await pool.connect();
  let orderId;
  try {
    await client.query('BEGIN');
    const o = await client.query(
      `INSERT INTO orders (order_number, session_id, customer_name, customer_email, customer_phone,
                           subtotal, discount, total, coupon_code)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
      [orderNumber, req.sessionID, name, email, phone || null, cart.subtotal, cart.discount, cart.total, cart.coupon?.code || null]
    );
    orderId = o.rows[0].id;
    for (const i of cart.items) {
      await client.query(
        'INSERT INTO order_items (order_id, product_id, name, price, quantity) VALUES ($1,$2,$3,$4,$5)',
        [orderId, i.id, i.name, i.price, i.quantity]
      );
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }

  // demo mode: confirm immediately
  if (!razorpay) {
    await finalizeOrder(req, orderId, 'DEMO-' + orderNumber);
    return res.json({ mode: 'demo', orderNumber });
  }

  const rzpOrder = await razorpay.orders.create({
    amount: Math.round(cart.total * 100), // Razorpay works in paise
    currency: 'INR',
    receipt: orderNumber,
  });
  await pool.query('UPDATE orders SET razorpay_order_id=$2 WHERE id=$1', [orderId, rzpOrder.id]);

  res.json({
    mode: 'razorpay',
    keyId: process.env.RAZORPAY_KEY_ID,
    razorpayOrderId: rzpOrder.id,
    amount: rzpOrder.amount,
    orderNumber,
  });
});

// Step 2: after the popup succeeds, verify the signature, then confirm the order
router.post('/verify', async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');
  if (expected !== razorpay_signature) return res.status(400).json({ error: 'Payment verification failed' });

  const { rows } = await pool.query('SELECT id FROM orders WHERE razorpay_order_id=$1 AND session_id=$2', [
    razorpay_order_id, req.sessionID,
  ]);
  if (!rows[0]) return res.status(404).json({ error: 'Order not found' });

  await finalizeOrder(req, rows[0].id, razorpay_payment_id);
  res.json({ ok: true });
});

module.exports = router;
