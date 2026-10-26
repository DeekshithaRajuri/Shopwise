import { useEffect, useState } from 'react';
import { api } from './api';
import './styles.css';

const money = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(n);

const EMPTY_CART = {
  items: [],
  subtotal: 0,
  discount: 0,
  total: 0,
  coupon: null,
  couponNote: null,
};

const API_URL = 'http://localhost:5000/api';

export default function App() {
  const [page, setPage] = useState({ name: 'login' });
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || null;
    } catch {
      return null;
    }
  });
  const [products, setProducts] = useState(null);
  const [cart, setCart] = useState(EMPTY_CART);
  const [toast, setToast] = useState('');
  const [authMessage, setAuthMessage] = useState('');

  const itemCount = cart.items.reduce(
    (n, item) => n + item.quantity,
    0
  );

  useEffect(() => {
    if (user) {
      api.getProducts().then(setProducts).catch((e) => flash(e.message));
      api.getCart().then(setCart).catch((e) => flash(e.message));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  function flash(message) {
    setToast(message);
    setTimeout(() => setToast(''), 3000);
  }

  async function updateCart(fn, message) {
    try {
      setCart(await fn());
      if (message) flash(message);
    } catch (e) {
      flash(e.message);
    }
  }

  const go = (name, extra = {}) => {
    setPage({ name, ...extra });
    window.scrollTo(0, 0);
  };

  async function logout() {
    try {
      await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (e) {
      console.error('Logout request failed:', e);
    }

    localStorage.removeItem('user');
    setUser(null);
    setCart(EMPTY_CART);
    setAuthMessage('You have been logged out.');
    go('login');
  }

  return (
    <>
      <style>{`
        .auth-shell {
          min-height: 80vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 32px 16px;
          background: linear-gradient(135deg, #eef2ff, #fdf2f8);
        }
        .auth-card {
          width: 100%;
          max-width: 430px;
          padding: 34px;
          border-radius: 18px;
          background: white;
          box-shadow: 0 12px 40px rgba(31,41,55,.12);
        }
        .auth-card h1 {
          margin: 0 0 8px;
          text-align: center;
          color: #1f2937;
        }
        .auth-subtitle {
          margin: 0 0 24px;
          text-align: center;
          color: #6b7280;
        }
        .auth-card label {
          display: block;
          margin: 15px 0 7px;
          font-weight: 600;
          font-size: 14px;
        }
        .auth-card input {
          width: 100%;
          padding: 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 15px;
          box-sizing: border-box;
        }
        .auth-card input:focus {
          outline: 2px solid #c7d2fe;
          border-color: #4f46e5;
        }
        .auth-submit {
          width: 100%;
          margin-top: 22px;
          padding: 13px;
          border: 0;
          border-radius: 8px;
          background: #4f46e5;
          color: white;
          font-weight: 700;
          cursor: pointer;
        }
        .auth-submit:disabled {
          opacity: .65;
          cursor: wait;
        }
        .auth-foot {
          margin: 20px 0 0;
          text-align: center;
          color: #6b7280;
          font-size: 14px;
        }
        .auth-switch {
          border: 0;
          background: none;
          color: #4f46e5;
          font-weight: 700;
          cursor: pointer;
        }
        .auth-error {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
          border-radius: 8px;
          padding: 10px;
          margin: 12px 0;
          font-size: 14px;
        }
        .auth-success {
          color: #166534;
          background: #f0fdf4;
          padding: 10px;
          border-radius: 8px;
          margin: 12px 0;
          font-size: 14px;
        }
        .bar-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .account-label {
          color: inherit;
          font-size: 14px;
        }
        .upi-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 8px 28px rgba(31,41,55,.07);
        }
        .upi-option {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px;
          margin: 12px 0;
          border: 1px solid #c7d2fe;
          background: #eef2ff;
          border-radius: 10px;
        }
        .upi-icon {
          width: 44px;
          height: 44px;
          display: grid;
          place-items: center;
          background: white;
          border-radius: 10px;
          font-size: 24px;
        }
        .checkout-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.3fr) minmax(280px, .7fr);
          gap: 24px;
          align-items: start;
        }
        .demo-note {
          background: #fffbeb;
          border: 1px solid #fde68a;
          color: #92400e;
          padding: 12px;
          border-radius: 9px;
          font-size: 13px;
          line-height: 1.5;
          margin-top: 16px;
        }
        .upi-safe {
          color: #166534;
          font-size: 13px;
          margin-top: 14px;
        }
        .payment-error {
          background: #fef2f2;
          color: #b91c1c;
          border-radius: 8px;
          padding: 12px;
          margin: 14px 0;
          font-size: 14px;
        }
        @media (max-width: 700px) {
          .checkout-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 480px) {
          .auth-card { padding: 25px 20px; }
          .bar-actions { gap: 5px; }
          .upi-card { padding: 18px; }
        }
      `}</style>

      <header className="bar">
        <button
          className="brand"
          onClick={() => go(user ? 'catalog' : 'login')}
        >
          Shopwise
        </button>

        <div className="bar-actions">
          {user ? (
            <>
              <span className="account-label">Hi, {user.name}</span>
              <button className="cart-link" onClick={() => go('cart')}>
                Cart <span className="badge">{itemCount}</span>
              </button>
              <button className="cart-link" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                className="cart-link"
                onClick={() => {
                  setAuthMessage('');
                  go('login');
                }}
              >
                Login
              </button>
              <button
                className="cart-link"
                onClick={() => {
                  setAuthMessage('');
                  go('signup');
                }}
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </header>

      <main>
        {!user && (
          <AuthPage
            mode={page.name === 'signup' ? 'signup' : 'login'}
            message={authMessage}
            onSwitch={(mode) => {
              setAuthMessage('');
              go(mode);
            }}
            onAuthenticated={(loggedInUser) => {
              localStorage.setItem('user', JSON.stringify(loggedInUser));
              setUser(loggedInUser);
              setAuthMessage('');
              go('catalog');
            }}
            onMessage={setAuthMessage}
          />
        )}

        {user && page.name === 'catalog' && (
          <Catalog
            products={products}
            onOpen={(id) => go('product', { id })}
            onAdd={(id) =>
              updateCart(() => api.addItem(id), 'Added to cart')
            }
            onImport={async () => {
              try {
                await api.importProducts();
                setProducts(await api.getProducts());
                flash('Products loaded successfully');
              } catch (e) {
                flash(e.message);
              }
            }}
          />
        )}

        {user && page.name === 'product' && (
          <ProductDetail
            id={page.id}
            onBack={() => go('catalog')}
            onAdd={(id) =>
              updateCart(() => api.addItem(id), 'Added to cart')
            }
          />
        )}

        {user && page.name === 'cart' && (
          <Cart
            cart={cart}
            updateCart={updateCart}
            onShop={() => go('catalog')}
            onCheckout={() => go('checkout')}
          />
        )}

        {user && page.name === 'checkout' && (
          <Checkout
            cart={cart}
            onBack={() => go('cart')}
            onPaid={(orderNumber) => {
              api.getCart().then(setCart).catch(() => {});
              go('confirmation', { orderNumber });
            }}
          />
        )}

        {user && page.name === 'confirmation' && (
          <Confirmation
            orderNumber={page.orderNumber}
            onShop={() => go('catalog')}
          />
        )}
      </main>

      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </>
  );
}

/* ---------- Login and Sign Up ---------- */

function AuthPage({
  mode,
  message,
  onSwitch,
  onAuthenticated,
  onMessage,
}) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const isSignup = mode === 'signup';

  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function submit(e) {
    e.preventDefault();
    setError('');
    onMessage('');

    if (isSignup && form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (isSignup && form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setBusy(true);

    try {
      const response = await fetch(
        `${API_URL}/auth/${isSignup ? 'signup' : 'login'}`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...(isSignup ? { name: form.name.trim() } : {}),
            email: form.email.trim(),
            password: form.password,
          }),
        }
      );

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed.');
      }

      if (isSignup) {
        setForm({
          name: '',
          email: form.email,
          password: '',
          confirmPassword: '',
        });
        onSwitch('login');
        onMessage('Account created successfully. Please log in.');
      } else {
        if (!data.user) {
          throw new Error('Login response did not include user details.');
        }
        onAuthenticated(data.user);
      }
    } catch (err) {
      setError(err.message || 'Unable to connect to the backend.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-shell">
      <form className="auth-card" onSubmit={submit}>
        <div style={{ textAlign: 'center', fontSize: 38, marginBottom: 10 }}>
          🛍️
        </div>
        <h1>{isSignup ? 'Create Account' : 'Welcome Back'}</h1>
        <p className="auth-subtitle">
          {isSignup
            ? 'Sign up to start shopping with Shopwise'
            : 'Login to your Shopwise account'}
        </p>

        {message && <div className="auth-success">{message}</div>}
        {error && <div className="auth-error" role="alert">{error}</div>}

        {isSignup && (
          <>
            <label htmlFor="auth-name">Full name</label>
            <input
              id="auth-name"
              name="name"
              value={form.name}
              onChange={change}
              placeholder="Enter your full name"
              autoComplete="name"
              maxLength={100}
              required
            />
          </>
        )}

        <label htmlFor="auth-email">Email address</label>
        <input
          id="auth-email"
          name="email"
          type="email"
          value={form.email}
          onChange={change}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />

        <label htmlFor="auth-password">Password</label>
        <input
          id="auth-password"
          name="password"
          type="password"
          value={form.password}
          onChange={change}
          placeholder={isSignup ? 'At least 8 characters' : 'Enter your password'}
          autoComplete={isSignup ? 'new-password' : 'current-password'}
          minLength={isSignup ? 8 : undefined}
          required
        />

        {isSignup && (
          <>
            <label htmlFor="auth-confirm-password">Confirm password</label>
            <input
              id="auth-confirm-password"
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={change}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              required
            />
          </>
        )}

        <button className="auth-submit" type="submit" disabled={busy}>
          {busy ? 'Please wait...' : isSignup ? 'Create Account' : 'Login'}
        </button>

        <p className="auth-foot">
          {isSignup ? 'Already have an account? ' : "Don't have an account? "}
          <button
            className="auth-switch"
            type="button"
            onClick={() => onSwitch(isSignup ? 'login' : 'signup')}
          >
            {isSignup ? 'Login' : 'Sign Up'}
          </button>
        </p>
      </form>
    </section>
  );
}

/* ---------- Product image ---------- */

function Thumb({ product, big }) {
  return product.image ? (
    <img
      className={big ? 'thumb big' : 'thumb'}
      src={product.image}
      alt={product.name}
    />
  ) : (
    <div className={big ? 'thumb big ph' : 'thumb ph'}>
      {product.name?.[0] || '?'}
    </div>
  );
}

/* ---------- Product catalog ---------- */

function Catalog({ products, onOpen, onAdd, onImport }) {
  if (!products) return <p className="muted">Loading products…</p>;

  return (
    <>
      <div className="row between">
        <h1>Products</h1>
        <button className="ghost" onClick={onImport}>
          Load more from mock API
        </button>
      </div>

      <div className="grid">
        {products.map((p) => (
          <article className="card" key={p.id}>
            <button className="plain" onClick={() => onOpen(p.id)}>
              <Thumb product={p} />
              <h3>{p.name}</h3>
            </button>
            <p className="muted small">{p.category}</p>
            <div className="row between">
              <strong>{money(p.price)}</strong>
              <button className="primary sm" onClick={() => onAdd(p.id)}>
                Add to cart
              </button>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

/* ---------- Product details ---------- */

function ProductDetail({ id, onBack, onAdd }) {
  const [product, setProduct] = useState(null);

  useEffect(() => {
    api.getProducts().then((all) => {
      setProduct(all.find((p) => p.id === id));
    });
  }, [id]);

  if (!product) return <p className="muted">Loading…</p>;

  return (
    <>
      <button className="link" onClick={onBack}>Back to products</button>
      <div className="detail">
        <Thumb product={product} big />
        <div>
          <p className="muted small">{product.category}</p>
          <h1>{product.name}</h1>
          <p>{product.description}</p>
          <p className="price">{money(product.price)}</p>
          <button className="primary" onClick={() => onAdd(product.id)}>
            Add to cart
          </button>
        </div>
      </div>
    </>
  );
}

/* ---------- Shopping cart ---------- */

function Cart({ cart, updateCart, onShop, onCheckout }) {
  const [code, setCode] = useState('');

  if (!cart.items.length) {
    return (
      <div className="empty">
        <h1>Your cart is empty</h1>
        <button className="primary" onClick={onShop}>Browse products</button>
      </div>
    );
  }

  return (
    <>
      <h1>Your cart</h1>
      <div className="cols">
        <section>
          {cart.items.map((item) => (
            <div className="line" key={item.id}>
              <Thumb product={item} />
              <div className="grow">
                <strong>{item.name}</strong>
                <div className="muted small">{money(item.price)} each</div>
                <button className="link" onClick={() =>
                  updateCart(() => api.removeItem(item.id))
                }>
                  Remove
                </button>
              </div>
              <div className="qty">
                <button
                  onClick={() => updateCart(() =>
                    api.setQty(item.id, item.quantity - 1)
                  )}
                  aria-label="Decrease quantity"
                >−</button>
                <span>{item.quantity}</span>
                <button
                  onClick={() => updateCart(() =>
                    api.setQty(item.id, item.quantity + 1)
                  )}
                  aria-label="Increase quantity"
                >+</button>
              </div>
              <strong className="line-total">{money(item.lineTotal)}</strong>
            </div>
          ))}
        </section>

        <aside className="summary">
          <h2>Order summary</h2>

          {cart.coupon ? (
            <div className="coupon applied">
              <span><strong>{cart.coupon.code}</strong> applied</span>
              <button className="link" onClick={() =>
                updateCart(() => api.removeCoupon())
              }>Remove</button>
            </div>
          ) : (
            <form className="coupon" onSubmit={(e) => {
              e.preventDefault();
              updateCart(() => api.applyCoupon(code), 'Coupon applied');
              setCode('');
            }}>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Coupon code"
                aria-label="Coupon code"
              />
              <button className="ghost" disabled={!code.trim()}>Apply</button>
            </form>
          )}

          {cart.couponNote && <p className="warn small">{cart.couponNote}</p>}
          <p className="muted small">Try SAVE10 or FLAT200</p>
          <Totals cart={cart} />
          <button className="primary wide" onClick={onCheckout}>
            Go to checkout
          </button>
        </aside>
      </div>
    </>
  );
}

function Totals({ cart }) {
  return (
    <dl className="totals">
      <div><dt>Subtotal</dt><dd>{money(cart.subtotal)}</dd></div>
      <div className="save"><dt>Discount</dt><dd>− {money(cart.discount)}</dd></div>
      <div className="final"><dt>Payable</dt><dd>{money(cart.total)}</dd></div>
    </dl>
  );
}

/* ---------- Razorpay loader ---------- */

function loadRazorpay() {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error('Could not load Razorpay. Check your internet connection.'));
    document.body.appendChild(script);
  });
}

/* ---------- UPI Checkout ---------- */

function Checkout({ cart, onBack, onPaid }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const set = (key) => (e) =>
    setForm({ ...form, [key]: e.target.value });

  async function pay(e) {
    e.preventDefault();
    if (busy) return;

    setBusy(true);
    setError('');

    try {
      // Create an order on your backend using the current cart.
      const order = await api.createOrder(form);

      // Do not treat demo mode as a real payment.
      if (order.mode === 'demo') {
        throw new Error(
          'Razorpay test mode is not configured on the backend. Check your backend .env and restart the server.'
        );
      }

      if (!order.keyId || !order.razorpayOrderId || !order.amount) {
        throw new Error('Invalid Razorpay order response. Check the backend.');
      }

      await loadRazorpay();

      const checkout = new window.Razorpay({
        key: order.keyId,
        amount: order.amount,
        currency: 'INR',
        name: 'Shopwise',
        description: 'Shopwise order payment',
        order_id: order.razorpayOrderId,

        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone,
        },

        // Show UPI as the payment method in Razorpay Checkout.
        method: {
          upi: true,
          card: false,
          netbanking: false,
          wallet: false,
          emi: false,
          paylater: false,
        },

        theme: { color: '#4f46e5' },

        handler: async (response) => {
          try {
            // The backend verifies the payment signature before confirming.
            await api.verifyPayment(response);
            onPaid(order.orderNumber);
          } catch (err) {
            setError(err.message || 'Payment verification failed.');
            setBusy(false);
          }
        },

        modal: {
          ondismiss: () => setBusy(false),
          escape: true,
          confirm_close: true,
        },
      });

      checkout.on('payment.failed', (response) => {
        setError(
          response.error?.description || 'Payment failed. Please try again.'
        );
        setBusy(false);
      });

      checkout.open();
    } catch (err) {
      setError(err.message || 'Unable to start payment.');
      setBusy(false);
    }
  }

  if (!cart.items.length) {
    return (
      <p className="muted">
        Your cart is empty. <button onClick={onBack}>Back to cart</button>
      </p>
    );
  }

  return (
    <>
      <button className="link" onClick={onBack} disabled={busy}>
        ← Back to cart
      </button>

      <h1>Secure Checkout</h1>
      <p className="muted">Review your details and continue to UPI payment.</p>

      <div className="checkout-grid">
        <form onSubmit={pay} className="upi-card" id="checkout-form">
          <h2>Contact details</h2>

          <label>
            Full name
            <input
              required
              maxLength={100}
              value={form.name}
              onChange={set('name')}
              autoComplete="name"
              placeholder="Enter your full name"
            />
          </label>

          <label>
            Email
            <input
              required
              type="email"
              value={form.email}
              onChange={set('email')}
              autoComplete="email"
              placeholder="you@example.com"
            />
          </label>

          <label>
            Phone
            <input
              type="tel"
              value={form.phone}
              onChange={set('phone')}
              autoComplete="tel"
              maxLength={15}
              placeholder="Optional phone number"
            />
          </label>

          <h2 style={{ marginTop: 26 }}>Payment method</h2>

          <div className="upi-option">
            <div className="upi-icon">📱</div>
            <div>
              <strong>UPI payment</strong>
              <div className="muted small">
                Pay using the UPI options shown in Razorpay Checkout.
              </div>
            </div>
          </div>

          {error && (
            <div className="payment-error" role="alert">{error}</div>
          )}

          <p className="upi-safe">
            🔒 Your payment is handled by Razorpay Checkout.
          </p>

          <div className="demo-note">
            <strong>Test mode:</strong> Use Razorpay's test UPI ID inside
            the payment popup. No real money should be transferred when
            using test credentials.
          </div>

          <button
            className="primary wide"
            type="submit"
            disabled={busy}
            style={{ marginTop: 20 }}
          >
            {busy ? 'Opening secure checkout…' : `Continue to pay ${money(cart.total)}`}
          </button>
        </form>

        <aside className="summary">
          <h2>Order summary</h2>

          {cart.items.map((item) => (
            <div className="row between small" key={item.id}>
              <span>{item.name} × {item.quantity}</span>
              <span>{money(item.lineTotal)}</span>
            </div>
          ))}

          <Totals cart={cart} />

          <p className="muted small">
            You will be redirected to Razorpay Checkout to complete the
            test payment.
          </p>
        </aside>
      </div>
    </>
  );
}

/* ---------- Order confirmation ---------- */

function Confirmation({ orderNumber, onShop }) {
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getOrder(orderNumber)
      .then(setOrder)
      .catch((e) => setError(e.message));
  }, [orderNumber]);

  if (error) return <p className="warn">{error}</p>;
  if (!order) return <p className="muted">Loading your order…</p>;

  return (
    <div className="confirm">
      <h1>Order confirmed</h1>
      <p>Thanks, {order.customer_name}. Your order id is</p>
      <p className="order-id">{order.order_number}</p>

      {order.items.map((item, index) => (
        <div className="row between small" key={index}>
          <span>{item.name} × {item.quantity}</span>
          <span>{money(item.price * item.quantity)}</span>
        </div>
      ))}

      <Totals cart={order} />

      <p className="muted small">
        Status: {order.status}
        {order.coupon_code ? ` · Coupon ${order.coupon_code}` : ''}
      </p>

      <button className="primary" onClick={onShop}>
        Continue shopping
      </button>
    </div>
  );
}
