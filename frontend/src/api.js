// All backend calls live here. "credentials: include" sends the session cookie.
async function call(path, { method = 'GET', body } = {}) {
  const res = await fetch('/api' + path, {
    method,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

export const api = {
  getProducts: () => call('/products'),
  importProducts: () => call('/products/import', { method: 'POST' }),
  getCart: () => call('/cart'),
  addItem: (productId) => call('/cart/items', { method: 'POST', body: { productId, quantity: 1 } }),
  setQty: (productId, quantity) => call(`/cart/items/${productId}`, { method: 'PATCH', body: { quantity } }),
  removeItem: (productId) => call(`/cart/items/${productId}`, { method: 'DELETE' }),
  applyCoupon: (code) => call('/cart/coupon', { method: 'POST', body: { code } }),
  removeCoupon: () => call('/cart/coupon', { method: 'DELETE' }),
  createOrder: (customer) => call('/checkout/create-order', { method: 'POST', body: customer }),
  verifyPayment: (payload) => call('/checkout/verify', { method: 'POST', body: payload }),
  getOrder: (orderNumber) => call(`/orders/${orderNumber}`),
};
