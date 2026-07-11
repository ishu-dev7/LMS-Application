# React — Complete Course with Interview Prep

React is a library for building user interfaces out of **components** — functions that take data and return UI. Its core bet: describe *what* the UI should look like for a given state, and let React figure out *how* to update the DOM. This course goes from that mental model to hooks, data flow, performance, and the interview questions that decide React roles.

## 1. Fundamentals — Thinking in React

### 1.1 Components, JSX and rendering

A component is a function returning **JSX** — XML-like syntax that compiles to `React.createElement` calls producing a lightweight object tree (the "virtual DOM"):

```jsx
function PriceTag({ symbol, price }) {
  return <span className="price">{symbol}: ₹{price.toFixed(2)}</span>
}
```

- JSX is JavaScript: `{expression}` embeds any expression; attributes are camelCase (`className`, `onClick`).
- When state changes, React **re-renders** the component (calls the function again), diffs the new element tree against the previous one (**reconciliation**), and applies only the minimal DOM mutations. You never imperatively "update the page" — you update state, the UI follows.
- Components must be **pure during render**: same props/state → same JSX, no side effects while rendering. Side effects belong in event handlers or effects.

### 1.2 Props and state — the two kinds of data

- **Props** flow parent → child, read-only. A child never mutates its props.
- **State** is a component's own memory, declared with `useState`:

```jsx
const [qty, setQty] = useState(1)
```

- State updates are **asynchronous and batched**; updating state based on previous state must use the functional form: `setQty(q => q + 1)`. Two consecutive `setQty(qty + 1)` calls in one handler increment once — the single most common beginner interview trap.
- **Data flows down; events flow up.** A child asks the parent to change data by calling a callback passed as a prop. When two siblings need the same state, **lift it up** to their common parent.

### 1.3 Lists, keys and conditional rendering

- Render lists with `.map()`; every item needs a **stable `key`** so reconciliation can match items across renders. Using the array index as key breaks when items reorder/insert — state sticks to the wrong rows (classic bug + classic question: *why not index keys?*).
- Conditional rendering is plain JS: `{isOpen && <Panel />}`, ternaries, or early returns.

## 2. Hooks — State, Effects and the Rules

### 2.1 useEffect — synchronizing with the outside world

Effects run *after* render, for anything beyond computing JSX — fetching, subscriptions, timers, DOM APIs:

```jsx
useEffect(() => {
  const id = setInterval(tick, 1000)
  return () => clearInterval(id)   // cleanup: on unmount AND before re-run
}, [])                              // dependency array controls when it re-runs
```

- `[]` → run once after mount. `[a, b]` → re-run when a or b changes. No array → after every render (rarely right).
- The **cleanup function** prevents leaks (unsubscribe, abort fetches, clear timers) — it runs before each re-execution and at unmount.
- The dependency array must include everything the effect reads from component scope — lying to it causes stale-closure bugs, the source of most "React is behaving weirdly" questions.
- Mental model interviewers reward: useEffect is not a lifecycle hook; it *synchronizes* the component with an external system for as long as dependencies hold.

### 2.2 The rules of hooks and why they exist

Hooks must be called **unconditionally, at the top level, in the same order every render** — React identifies each hook by call order. An `if` around a hook shifts the order and corrupts all subsequent hooks' state. That's the entire reason for the rule.

### 2.3 useContext, useRef, useMemo, useCallback

- **useContext** reads a value provided anywhere above in the tree — the built-in answer to prop drilling (theme, auth user, locale). Every consumer re-renders when the context value changes, so keep context values stable and split contexts by change frequency.
- **useRef** — a mutable box (`ref.current`) surviving renders *without* causing re-renders: DOM handles, timer ids, previous values.
- **useMemo** caches a computed value; **useCallback** caches a function identity — both exist for referential equality (stable deps, stable props for memoized children), not as magic go-fast dust. Premature memoization is itself an anti-pattern; measure first.

### 2.4 Custom hooks — the reuse unit

Any function starting with `use` that calls hooks is a custom hook — the idiomatic way to share stateful logic (not UI): `useFetch(url)`, `useLocalStorage(key)`, `useDebounce(value, ms)`. Each caller gets isolated state; custom hooks are the answer to "how do you reuse logic between components" (the old HOC/render-props patterns predate them).

## 3. Data, Routing & Application Patterns

### 3.1 Data fetching realities

Naive fetch-in-effect must handle: loading state, error state, **race conditions** (slow response A overwriting fresh response B — fix with an `AbortController` or an "ignore stale" flag in cleanup), and caching. Production apps reach for **TanStack Query / SWR** which handle caching, deduplication, revalidation and retries — in interviews, name the problems the library solves rather than pretending `useEffect` fetching is fine at scale.

### 3.2 Client-side routing

React Router: `<Routes><Route path="/orders/:id" element={<Order/>}/></Routes>`, `useParams()`, `useNavigate()`, nested routes with `<Outlet/>`, and route guards implemented as wrapper components checking auth before rendering (`<Navigate to="/login"/>` otherwise). The URL is state — deep-linkable screens beat hidden in-memory navigation state.

### 3.3 State management — choosing the right tool

The honest hierarchy, which interviewers respect:
1. **Local state** (`useState`) — most state is local; keep it there.
2. **Lifted state** — shared by siblings? Move it to the parent.
3. **Context** — low-frequency global data (user, theme).
4. **useReducer** — complex transitions in one component/feature; testable pure reducer.
5. **External stores (Redux Toolkit, Zustand)** — many widely-shared, frequently-changing slices, devtools/time-travel needs, or large teams needing conventions.
6. **Server state belongs to a query library**, not Redux — caching server data in a client store re-invents staleness bugs.

### 3.4 Forms: controlled vs uncontrolled

Controlled inputs (`value` + `onChange` → state) give validation-as-you-type and single source of truth; uncontrolled (refs / FormData) are simpler and faster for big forms. Libraries (React Hook Form) minimize re-renders by leaning uncontrolled. Know the trade-off both ways.

## 4. Performance & Production Patterns

### 4.1 What actually causes re-renders

A component re-renders when its **state changes or its parent re-renders** — props changing is a *consequence*, not the trigger. Wasted renders of expensive children are cut with `React.memo(Child)` + stable props (useMemo/useCallback for objects/functions). But: re-renders are usually cheap; the expensive ones are large lists and heavy computation. Optimize with the React DevTools Profiler, not by wrapping everything in memo.

### 4.2 Lists, splitting and loading

- **Virtualize long lists** (react-window): render only visible rows — 10,000-row tables become smooth.
- **Code-split** routes with `React.lazy` + `<Suspense fallback>`: users download the screen they're on, not the whole app.
- Images/bundles: lazy loading, tree-shaking, analyzing bundle size — mention `import()` boundaries per route as the default split.

### 4.3 Error boundaries and resilience

Render errors unmount the whole tree unless caught by an **error boundary** (class component with `componentDidCatch` / libraries like react-error-boundary) — wrap routes/widgets so one broken widget shows a fallback instead of white-screening the app. Effects/async errors aren't caught by boundaries — handle them in the effect.

### 4.4 StrictMode and common gotchas

Development StrictMode double-invokes renders and effect setup/cleanup to surface impure renders and missing cleanups — "my effect runs twice" is a feature working as intended (and an interview staple). Other classics: mutating state objects instead of replacing them (React compares by reference — always create new objects/arrays), stale closures in intervals, keys by index.

## 5. Interview Preparation — Questions & Answers

### 5.1 Basic level Q&A

**Q1. What is the virtual DOM and why does React use it?**
A lightweight object description of the UI. On state change React builds a new tree, diffs it with the previous one (reconciliation), and applies only the minimal real-DOM operations. Real DOM mutation is the slow part; diffing objects is cheap — and the model lets you write declarative code ("this is what the UI should be") instead of imperative updates.

**Q2. Props vs state?**
Props: inputs from the parent, read-only, changing them is the parent's job. State: the component's own mutable memory via `useState`, changed with the setter, triggering re-render. Rule of thumb: if a component doesn't change it, it should probably be a prop; if only this component changes it, it's state.

**Q3. Why must list items have keys, and why is the array index a bad key?**
Keys let reconciliation match items between renders so React moves/updates instead of destroying and recreating. Index keys break on insert/remove/reorder: item identity shifts, so component state (input values, selection) sticks to positions, not items — visible as "typed text jumps to another row".

**Q4. Why does `setState` twice in one handler only increment once?**
State updates are batched, and `setQty(qty + 1)` closes over the same stale `qty` both times. The functional form `setQty(q => q + 1)` receives the latest value and composes correctly.

**Q5. What does useEffect's dependency array do?**
It declares what the effect reads; React re-runs the effect (after cleanup of the previous run) when any dependency changes. `[]` = once after mount; omitted = every render. Omitting a value you actually read creates stale-closure bugs — the lint rule exists precisely for that.

**Q6. Controlled vs uncontrolled components?**
Controlled: React state is the single source of truth (`value` + `onChange`) — enables instant validation, conditional UI, programmatic changes. Uncontrolled: the DOM holds the value, read via ref/FormData on submit — less code, fewer re-renders. Big forms often go uncontrolled (React Hook Form's approach).

**Q7. What are fragments?**
`<>...</>` groups children without an extra DOM node — components must return one root element, and wrapper divs pollute layout/CSS. Keyed fragments (`<Fragment key=...>`) matter when mapping multiple siblings per item.

**Q8. What is prop drilling and how do you avoid it?**
Passing props through layers that don't use them just to reach a deep child. Fixes: component composition (pass the child *as* a prop/children), Context for genuinely global low-churn data, or a store for widely-shared changing state.

### 5.2 Intermediate level Q&A

**Q9. Explain the rules of hooks and the reason behind them.**
Call hooks only at the top level of a React function (no conditions/loops/nesting) and only from components or custom hooks. React tracks hook state by call order per component instance; conditional calls shift the order and every subsequent hook reads the wrong slot. The ESLint plugin enforces it because violations produce corrupted-state bugs, not error messages.

**Q10. How do you fetch data safely in useEffect?**
Handle loading/error states; cancel or ignore stale responses in cleanup (AbortController, or a `cancelled` flag) to beat race conditions when deps change quickly; include deps honestly. Then the senior answer: for anything real, a server-state library (TanStack Query/SWR) — caching, dedupe, revalidation, retries are solved problems you shouldn't hand-roll per component.

**Q11. useMemo vs useCallback vs React.memo — untangle them.**
`React.memo(Component)` skips re-rendering when props are shallow-equal. That only helps if props keep stable identities — which is what `useMemo` (caches a value) and `useCallback` (caches a function) provide. So: memo on the expensive child; useMemo/useCallback in the parent for the object/function props it receives. None of them are free — apply after profiling, not by default.

**Q12. Why does my effect run twice in development?**
React 18 StrictMode intentionally mounts → unmounts → remounts components in dev to expose effects lacking proper cleanup and impure renders. Production runs once. The fix is never "remove StrictMode" — it's writing idempotent effects with correct cleanup.

**Q13. How does Context work and what's its performance caveat?**
A Provider supplies a value; any descendant consuming via useContext re-renders whenever that value changes (reference comparison). Caveats: a provider value created inline (`value={{user, setUser}}`) is a new object every render → all consumers re-render; memoize the value. Split fast-changing and slow-changing data into separate contexts.

**Q14. useReducer vs useState — when do you switch?**
When the next state depends on structured transitions (many related fields, multi-step logic, action-driven updates) or when update logic should be testable in isolation. `dispatch({type:'add_item', item})` centralizes transitions in a pure reducer. It's also the escape hatch for deep updates where multiple useStates would drift.

**Q15. How do error boundaries work and what do they NOT catch?**
Class components implementing `getDerivedStateFromError`/`componentDidCatch` render a fallback when a descendant throws during render/lifecycle. They don't catch: event handler errors (try/catch those), async/effect errors, SSR errors, or errors in the boundary itself. Production pattern: boundary per route/major widget + error reporting in `componentDidCatch`.

**Q16. What are keys' cousin problems — why "don't mutate state"?**
React decides re-renders by reference comparison (Object.is). Mutating an array/object in place keeps the same reference — React sees "no change", UI doesn't update (or memo children skip wrongly). Always produce new references: spread, `map`, `filter`, or Immer for deep updates.

### 5.3 Advanced & scenario Q&A

**Q17. Scenario: typing in a search box lags with a 5,000-row results table. Fix it.**
Profile first (React DevTools Profiler). Likely fixes in order: virtualize the table (react-window) so only ~20 rows render; debounce the query so filtering doesn't run per keystroke; `useDeferredValue`/`useTransition` (React 18) to keep the input responsive while results render at lower priority; memoize row components with stable props. The pattern the interviewer wants: *keep the urgent update (input) cheap; make the expensive update (table) interruptible and minimal*.

**Q18. Explain reconciliation's heuristics.**
Different element type at a position → tear down and rebuild that subtree. Same type → update props in place, recurse into children. Lists → match by key (not position). Consequences: switching a wrapper (`div`→`span`) resets all child state; stable keys preserve state across reorders; conditionally swapping component types intentionally resets state (a legitimate trick: `key={userId}` to reset a form per user).

**Q19. What are Server Components / SSR / hydration in one map?**
SSR renders HTML on the server for fast first paint + SEO; the client then **hydrates** — attaches event handlers to existing markup. React Server Components (Next.js App Router) go further: server-only components never ship their JS to the client; client components (`'use client'`) hydrate as islands. Trade-offs: less client JS and direct data access on the server vs. added infrastructure complexity and the server/client boundary discipline.

**Q20. How would you structure state for a large dashboard app?**
Server data → query library (TanStack Query) keyed by endpoint+params, with invalidation on mutations. Global client state (auth/user, theme, feature flags) → small store or context. Feature-local UI state → useState/useReducer within the feature. URL state (filters, tabs, pagination) → the router/search params so views are shareable. The anti-pattern to name: one giant global store holding copies of server data.

**Q21. Scenario: a component's interval always logs the initial count. Why?**
Stale closure: the interval callback captured the first render's `count`. Options: functional updates (`setCount(c => c + 1)`) so the callback doesn't need `count`; include it in deps and reset the interval each change; or keep the latest value in a ref read inside the callback. Explaining *why* (each render creates new closures over that render's values) is the actual pass mark.

**Q22. How do you code-split and what changes for the user?**
`const Reports = React.lazy(() => import('./Reports'))` behind `<Suspense fallback={<Spinner/>}>`, typically per route. The initial bundle shrinks to the shell + current screen; other screens load on navigation (show meaningful fallbacks; preload on hover for snappiness). Measure with bundle analysis; split where the byte savings are real (charts, editors, admin areas).
