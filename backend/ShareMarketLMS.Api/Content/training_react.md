## React Fundamentals

### What is React?
React is a JavaScript library for building user interfaces. Created by Meta (Facebook), it focuses on one thing: rendering UIs efficiently using a component-based model and a virtual DOM.

**Key concepts:**
- **Component**: reusable UI piece (function or class)
- **JSX**: JavaScript + XML syntax — compiles to `React.createElement()`
- **Props**: immutable data passed from parent to child
- **State**: mutable data managed inside a component
- **Virtual DOM**: React's in-memory representation, diffed against real DOM for efficient updates

**Why React?**
- Declarative: describe WHAT the UI should look like
- Component-based: composable, reusable pieces
- Huge ecosystem: Next.js, React Native, React Query, Zustand
- Flexible: pair with any backend

### JSX and Components
```jsx
// Function component (preferred since React 16.8+)
function Greeting({ name, role = 'Learner' }) {
  return (
    <div className="greeting">
      <h1>Hello, {name}!</h1>
      <p>Role: {role}</p>
      {role === 'Admin' && <span className="badge">Admin</span>}
    </div>
  );
}

// Arrow function component
const UserCard = ({ user }) => (
  <div className="card">
    <img src={user.avatar} alt={user.name} />
    <h3>{user.name}</h3>
    <p>{user.email}</p>
  </div>
);

// JSX rules:
// - Return one root element (or <>...</> fragment)
// - Use className (not class), htmlFor (not for)
// - Self-close empty tags: <br />, <img />
// - Expressions in {curly braces}
// - Use null/false/undefined to render nothing

// Lists — always provide a key
const ProductList = ({ products }) => (
  <ul>
    {products.map(product => (
      <li key={product.id}>  {/* key must be stable and unique */}
        {product.name} — ₹{product.price}
      </li>
    ))}
  </ul>
);
```

### Props — Passing Data Down
```jsx
// Parent
function App() {
  return (
    <ProductCard
      id={1}
      name="Laptop"
      price={75000}
      inStock={true}
      tags={['electronics', 'featured']}
      onBuy={(id) => console.log('Buying', id)}
    />
  );
}

// Child — destructured props
function ProductCard({ id, name, price, inStock, tags = [], onBuy }) {
  return (
    <div className={`card ${inStock ? 'available' : 'out-of-stock'}`}>
      <h2>{name}</h2>
      <p>₹{price.toLocaleString()}</p>
      <div>
        {tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
      </div>
      <button onClick={() => onBuy(id)} disabled={!inStock}>
        {inStock ? 'Buy Now' : 'Out of Stock'}
      </button>
    </div>
  );
}

// Spreading props
function Button({ children, variant = 'primary', ...rest }) {
  return (
    <button className={`btn btn-${variant}`} {...rest}>
      {children}
    </button>
  );
}

// children prop
function Modal({ title, children, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3>{title}</h3>
        {children}
      </div>
    </div>
  );
}
```

## React Hooks

### useState — Local State
```jsx
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>+</button>
      <button onClick={() => setCount(c => c - 1)}>-</button>
      <button onClick={() => setCount(0)}>Reset</button>
    </div>
  );
}

// State with objects — always spread to preserve other fields
function ProfileForm() {
  const [form, setForm] = useState({ name: '', email: '', bio: '' });

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <form>
      <input name="name" value={form.name} onChange={handleChange} />
      <input name="email" value={form.email} onChange={handleChange} />
      <textarea name="bio" value={form.bio} onChange={handleChange} />
    </form>
  );
}

// State with arrays
function TagList() {
  const [tags, setTags] = useState(['react', 'javascript']);

  const addTag = (tag) => setTags(prev => [...prev, tag]);
  const removeTag = (tag) => setTags(prev => prev.filter(t => t !== tag));
  const updateTag = (idx, newTag) =>
    setTags(prev => prev.map((t, i) => i === idx ? newTag : t));

  return (/* render tags */);
}
```

### useEffect — Side Effects
```jsx
import { useState, useEffect } from 'react';

function UserProfile({ userId }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Runs after render when userId changes
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(`/api/users/${userId}`)
      .then(r => r.json())
      .then(data => { if (!cancelled) { setUser(data); setLoading(false); } })
      .catch(err => { if (!cancelled) { setError(err.message); setLoading(false); } });

    // Cleanup function — runs before next effect or on unmount
    return () => { cancelled = true; };
  }, [userId]); // dependency array — re-run when userId changes

  // [] = run once on mount (like componentDidMount)
  // [dep1, dep2] = run when deps change
  // no array = run after every render (usually wrong!)

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!user) return null;

  return <div>{user.name}</div>;
}

// Other useEffect patterns
useEffect(() => {
  // Event listener — cleanup on unmount
  const handleResize = () => setWidth(window.innerWidth);
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);

useEffect(() => {
  // Timer
  const id = setInterval(() => setTick(t => t + 1), 1000);
  return () => clearInterval(id);
}, []);
```

### useRef — Mutable Refs and DOM Access
```jsx
import { useRef, useEffect } from 'react';

function VideoPlayer({ src }) {
  const videoRef = useRef(null);

  function play() { videoRef.current?.play(); }
  function pause() { videoRef.current?.pause(); }

  useEffect(() => {
    // Focus input on mount
    videoRef.current?.focus();
  }, []);

  return (
    <div>
      <video ref={videoRef} src={src} />
      <button onClick={play}>Play</button>
      <button onClick={pause}>Pause</button>
    </div>
  );
}

// useRef for mutable values (doesn't trigger re-render)
function StopWatch() {
  const [time, setTime] = useState(0);
  const intervalRef = useRef(null);

  const start = () => {
    intervalRef.current = setInterval(() => setTime(t => t + 10), 10);
  };

  const stop = () => clearInterval(intervalRef.current);

  return (/* render */);
}
```

### useReducer — Complex State Logic
```jsx
import { useReducer } from 'react';

const initialState = {
  products: [],
  loading: false,
  error: null,
  filter: 'all',
  page: 1
};

function reducer(state, action) {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return { ...state, loading: false, products: action.payload };
    case 'FETCH_ERROR':
      return { ...state, loading: false, error: action.payload };
    case 'SET_FILTER':
      return { ...state, filter: action.payload, page: 1 };
    case 'NEXT_PAGE':
      return { ...state, page: state.page + 1 };
    default:
      return state;
  }
}

function ProductPage() {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    dispatch({ type: 'FETCH_START' });
    fetchProducts(state.filter, state.page)
      .then(data => dispatch({ type: 'FETCH_SUCCESS', payload: data }))
      .catch(err => dispatch({ type: 'FETCH_ERROR', payload: err.message }));
  }, [state.filter, state.page]);

  return (/* render */);
}
```

### useContext — Sharing State
```jsx
import { createContext, useContext, useState, useMemo } from 'react';

// 1. Create context
const AuthContext = createContext(null);

// 2. Create provider
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    setUser(data.user);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('token', data.token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const value = useMemo(() => ({ user, login, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 3. Consume in any child component
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

// Usage
function Header() {
  const { user, logout } = useAuth();
  return (
    <header>
      {user ? (
        <>
          <span>Hello, {user.name}</span>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <a href="/login">Login</a>
      )}
    </header>
  );
}
```

### useMemo and useCallback — Performance
```jsx
import { useMemo, useCallback } from 'react';

function ExpensivePage({ products, searchTerm, onBuy }) {
  // useMemo — memoize expensive computation
  const filtered = useMemo(
    () => products
      .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => a.price - b.price),
    [products, searchTerm]  // recompute only when these change
  );

  // useCallback — stable function reference (for React.memo children)
  const handleBuy = useCallback(
    (productId) => {
      onBuy(productId);
      trackAnalytics('purchase', productId);
    },
    [onBuy]  // recreate only when onBuy changes
  );

  return (
    <div>
      {filtered.map(p => (
        <ProductCard key={p.id} product={p} onBuy={handleBuy} />
      ))}
    </div>
  );
}

// React.memo — skip re-render if props unchanged
const ProductCard = React.memo(function ProductCard({ product, onBuy }) {
  console.log('Rendering', product.name);
  return (
    <div>
      {product.name}
      <button onClick={() => onBuy(product.id)}>Buy</button>
    </div>
  );
});
```

## Custom Hooks

### Writing Reusable Hooks
```jsx
// useFetch — data fetching hook
function useFetch(url) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    setLoading(true);

    fetch(url)
      .then(r => { if (!r.ok) throw new Error(r.statusText); return r.json(); })
      .then(d => { if (!cancelled) { setData(d); setLoading(false); } })
      .catch(e => { if (!cancelled) { setError(e.message); setLoading(false); } });

    return () => { cancelled = true; };
  }, [url]);

  return { data, loading, error };
}

// Usage
function ProductDetail({ id }) {
  const { data: product, loading, error } = useFetch(`/api/products/${id}`);
  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;
  return <div>{product.name}</div>;
}

// useLocalStorage — persistent state
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch { return initialValue; }
  });

  const setStoredValue = useCallback((val) => {
    setValue(val);
    localStorage.setItem(key, JSON.stringify(val));
  }, [key]);

  return [value, setStoredValue];
}

// useDebounce
function useDebounce(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

// useClickOutside
function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (e) => {
      if (!ref.current || ref.current.contains(e.target)) return;
      handler(e);
    };
    document.addEventListener('mousedown', listener);
    return () => document.removeEventListener('mousedown', listener);
  }, [ref, handler]);
}
```

## State Management

### React Query — Server State
```jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Fetching data
function Products() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['products'],
    queryFn: () => fetch('/api/products').then(r => r.json()),
    staleTime: 5 * 60 * 1000,  // data is fresh for 5 min
    cacheTime: 10 * 60 * 1000, // cache for 10 min after unused
  });

  if (isLoading) return <Spinner />;
  if (error) return <p>Error: {error.message}</p>;
  return data.map(p => <ProductCard key={p.id} product={p} />);
}

// Mutation — create/update/delete
function AddProduct() {
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: (dto) => fetch('/api/products', {
      method: 'POST', body: JSON.stringify(dto),
      headers: { 'Content-Type': 'application/json' }
    }).then(r => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
    }
  });

  return (
    <button onClick={() => mutate({ name: 'New Product', price: 100 })}
            disabled={isPending}>
      {isPending ? 'Adding...' : 'Add Product'}
    </button>
  );
}
```

### Zustand — Client State
```jsx
import { create } from 'zustand';

// Store
const useCartStore = create((set, get) => ({
  items: [],
  total: 0,

  addItem: (product) => set(state => {
    const existing = state.items.find(i => i.id === product.id);
    if (existing) {
      return {
        items: state.items.map(i =>
          i.id === product.id ? { ...i, qty: i.qty + 1 } : i
        ),
        total: state.total + product.price
      };
    }
    return {
      items: [...state.items, { ...product, qty: 1 }],
      total: state.total + product.price
    };
  }),

  removeItem: (id) => set(state => {
    const item = state.items.find(i => i.id === id);
    return {
      items: state.items.filter(i => i.id !== id),
      total: state.total - (item ? item.price * item.qty : 0)
    };
  }),

  clearCart: () => set({ items: [], total: 0 })
}));

// Usage — subscribe to only what you need
function CartIcon() {
  const itemCount = useCartStore(s => s.items.length);
  return <span>Cart ({itemCount})</span>;
}

function CartPage() {
  const { items, total, removeItem, clearCart } = useCartStore();
  return (/* render cart */);
}
```

## Interview Preparation

### React Interview Questions

**Q1. What is the difference between state and props?**
Props: immutable data passed from parent to child (like function parameters). State: mutable data managed inside the component that triggers re-render when changed.

**Q2. What is virtual DOM and how does React use it?**
An in-memory representation of the real DOM. React creates a virtual DOM tree → on state change, creates a new virtual tree → diffs with old tree (reconciliation) → applies minimal real DOM changes (commit phase).

**Q3. What are React hooks? Why were they introduced?**
Functions that let you use state and lifecycle features in function components. Introduced in React 16.8 to avoid class components and enable better code reuse via custom hooks.

**Q4. What is the difference between `useEffect` with `[]`, `[dep]`, and no array?**
- `[]`: runs once after first render (mount)
- `[dep]`: runs after mount and whenever `dep` changes
- No array: runs after every render (usually a mistake)

**Q5. What is reconciliation and the diffing algorithm?**
React compares new virtual DOM tree with previous. Keys on list items help identify which items moved, added, or removed. Without keys, React can make wrong assumptions and cause bugs or poor performance.

**Q6. What are controlled vs uncontrolled components?**
Controlled: input value driven by React state (`value={state}`, `onChange` updates state). Uncontrolled: value managed by DOM, accessed via `ref`. Controlled is preferred — predictable, testable.

**Q7. What is `useMemo` vs `useCallback`?**
`useMemo`: memoizes a computed value (result of function). `useCallback`: memoizes a function reference. Both skip recalculation when dependencies haven't changed.

**Q8. When should you use `useReducer` over `useState`?**
When state logic is complex (multiple sub-values, next state depends on previous), when multiple state updates happen together, or when you want predictable state transitions like a state machine.

**Q9. What is React Context and when should you NOT use it?**
Context passes data through the tree without prop drilling. Don't use it for frequently changing data — every consumer re-renders when context changes. Use Zustand/Jotai/Redux for dynamic shared state.

**Q10. What is React.memo and when does it help?**
HOC that memoizes a component — skips re-render if props are shallowly equal. Only helps when the parent re-renders often and the child is expensive to render. Requires stable prop references (useCallback for functions).

**Q11. What are React Server Components?**
Components that render on the server, never in the browser. No client-side JavaScript, can directly access databases/file system, cannot use hooks or browser APIs. Introduced in React 18, default in Next.js 13+.

**Q12. What is the difference between `useLayoutEffect` and `useEffect`?**
`useLayoutEffect` fires synchronously after DOM mutations but before the browser paints. Use it for DOM measurements. `useEffect` is asynchronous — fires after paint. Prefer `useEffect`; only use `useLayoutEffect` for layout measurements.

**Q13. How does React 18 concurrent mode work?**
Allows React to interrupt, pause, resume, or abandon renders. Renders work is split into units — high-priority updates (user input) can interrupt lower-priority ones (data fetches). Enables `startTransition`, `useDeferredValue`, Suspense for data.

**Q14. What is code splitting and lazy loading in React?**
`React.lazy()` + `Suspense`: load component bundle only when first rendered. Combined with React Router → route-based code splitting (each page is a separate JS chunk).
```jsx
const ProductPage = React.lazy(() => import('./ProductPage'));
<Suspense fallback={<Spinner />}><ProductPage /></Suspense>
```

**Q15. How do you optimize a slow React application?**
1. Profile with React DevTools Profiler (find expensive components)
2. `React.memo` for pure components
3. `useMemo`/`useCallback` to stabilize references
4. Virtualize long lists (`react-window`)
5. Code splitting with `React.lazy`
6. Move state down to avoid unnecessary re-renders
7. Use `useTransition` for non-urgent updates
8. Avoid inline object/function creation in JSX
