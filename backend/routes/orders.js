const router = require('express').Router();
const pool = require('../db');

// GET /api/orders/:orderNumber -> confirmation details (same session only)
router.get('/:orderNumber', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM orders WHERE order_number=$1 AND session_id=$2', [
    req.params.orderNumber, req.sessionID,
  ]);
  const order = rows[0];
  if (!order) return res.status(404).json({ error: 'Order not found' });
  const items = await pool.query('SELECT name, price, quantity FROM order_items WHERE order_id=$1', [order.id]);
  res.json({
    ...order,
    subtotal: Number(order.subtotal),
    discount: Number(order.discount),
    total: Number(order.total),
    items: items.rows.map((i) => ({ ...i, price: Number(i.price) })),
  });
});

module.exports = router;
