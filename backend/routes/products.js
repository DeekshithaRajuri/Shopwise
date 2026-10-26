const router = require('express').Router();
const pool = require('../db');

// GET /api/products -> list
router.get('/', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM products ORDER BY id');
  res.json(rows.map((p) => ({ ...p, price: Number(p.price) })));
});

// GET /api/products/:id -> details
router.get('/:id', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM products WHERE id = $1', [req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Product not found' });
  res.json({ ...rows[0], price: Number(rows[0].price) });
});

// POST /api/products/import -> pulls products from a public MOCK API (dummyjson.com) into our DB
router.post('/import', async (req, res) => {
  const resp = await fetch('https://dummyjson.com/products?limit=100&select=title,description,price,thumbnail,category');
  const data = await resp.json();
  for (const p of data.products) {
    const priceInr = Math.round(p.price * 80); // dummyjson prices are USD -> approx INR
    await pool.query(
      `INSERT INTO products (external_id, name, description, category, price, image)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (external_id) DO UPDATE
         SET name=$2, description=$3, category=$4, price=$5, image=$6`,
      [p.id, p.title, p.description, p.category, priceInr, p.thumbnail]
    );
  }
  res.json({ imported: data.products.length });
});

module.exports = router;
