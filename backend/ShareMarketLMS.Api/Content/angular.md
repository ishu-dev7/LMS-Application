# Angular — Complete Course with Interview Prep

Angular is the batteries-included framework: components, dependency injection, routing, forms, HTTP and testing conventions in one opinionated package, written in TypeScript. This course builds the mental model (components + DI + RxJS), covers the practical machinery (routing, forms, HTTP), and ends with the interview module.

## 1. Fundamentals — Components & Templates

### 1.1 The building blocks

An Angular app is a tree of **components**; each is a TypeScript class + an HTML template + styles, tied together by the `@Component` decorator:

```ts
@Component({
  selector: 'app-price-tag',
  standalone: true,
  template: `<span class="price">{{ symbol }}: ₹{{ price | number:'1.2-2' }}</span>`,
})
export class PriceTagComponent {
  @Input() symbol = ''
  @Input() price = 0
}
```

Modern Angular (v14+) favours **standalone components** (imports declared on the component) over NgModules; you'll still meet NgModules in older codebases — know both organizational styles.

### 1.2 Template syntax — the four bindings

- **Interpolation** `{{ expr }}` — text into the DOM.
- **Property binding** `[src]="imageUrl"` — component → DOM property.
- **Event binding** `(click)="buy()"` — DOM event → component method.
- **Two-way binding** `[(ngModel)]="qty"` — sugar for a property binding + event binding pair (`[ngModel]` + `(ngModelChange)`). "What does the banana-in-a-box actually expand to?" is a stock interview question.

Control flow: the new built-in syntax `@if / @for / @switch` (v17+) or the classic structural directives `*ngIf`, `*ngFor` (`*ngFor="let item of items; trackBy: trackById"` — trackBy prevents full list re-rendering, Angular's equivalent of React keys).

### 1.3 Component communication

- Parent → child: `@Input()` properties.
- Child → parent: `@Output() saved = new EventEmitter<Order>()`, emitted with `this.saved.emit(order)`.
- Distant components: a shared **service** holding state (usually a Subject/signal) injected into both — the idiomatic Angular answer, not a global variable.
- Content projection `<ng-content>` = children/slots for wrapper components.

### 1.4 Lifecycle hooks

The ones that matter: `ngOnInit` (inputs are set — do initialization/fetches here, not in the constructor), `ngOnChanges` (react to input changes), `ngOnDestroy` (unsubscribe/clean up), `ngAfterViewInit` (ViewChild/DOM ready). Constructor = dependency injection only; interviewers listen for that separation.

## 2. Services, DI, Directives & Pipes

### 2.1 Dependency injection — Angular's spine

Services are classes marked `@Injectable({ providedIn: 'root' })` — one shared instance app-wide, constructor-injected wherever needed (or via the `inject()` function in modern code):

```ts
constructor(private orders: OrderService) {}
```

- **Hierarchical injector:** providing a service at a component level gives that subtree its *own instance* — scoping state per widget/route. Root-provided services are singletons and tree-shakable.
- DI is what makes Angular testable: swap real services for fakes via the testing module.

### 2.2 Directives

- **Components** are directives with templates.
- **Structural directives** (`*ngIf`, `*ngFor`) reshape the DOM — the `*` is sugar for an `<ng-template>` wrapper.
- **Attribute directives** change behavior/appearance of an element (`[ngClass]`, `[ngStyle]`, or custom ones — e.g., an autofocus or permission-check directive). Custom attribute directive = `@Directive` + `ElementRef`/`HostListener`.

### 2.3 Pipes

Pure template transformations: `{{ price | currency:'INR' }}`, `date`, `async`. **Pure pipes** re-run only when the input reference changes (fast); impure pipes run every change-detection cycle (rarely justified). The **async pipe** subscribes to an Observable/Promise, renders emissions, and — critically — **auto-unsubscribes**, making it the preferred way to consume streams in templates.

## 3. RxJS, HTTP & State

### 3.1 RxJS — the part people fail interviews on

An **Observable** is a lazy stream of values over time; a **Subscription** is the running execution; **operators** transform streams declaratively.

- `Subject` = observable you push into manually; `BehaviorSubject` replays the latest value to new subscribers (the classic "shared state in a service" primitive).
- Core operators: `map`, `filter`, `tap`, `debounceTime`, `distinctUntilChanged`, `catchError`, `takeUntil`.
- **The flattening four** — the highest-yield interview topic: when each source emission maps to an inner observable (e.g., keystroke → HTTP call):
  - `switchMap` — cancel the previous inner; only the latest matters (typeahead search).
  - `mergeMap` — run all concurrently (independent parallel writes).
  - `concatMap` — queue sequentially, order preserved (ordered saves).
  - `exhaustMap` — ignore new emissions while one runs (login button spam).
- **Unsubscribe or leak:** long-lived subscriptions in components must end at destroy — async pipe (best), `takeUntilDestroyed()` (v16+), or a `destroy$` Subject with `takeUntil`.

### 3.2 HttpClient and interceptors

`HttpClient` returns cold observables (nothing happens until subscribe; the async pipe usually does it). **Interceptors** are the middleware of Angular HTTP — one place for auth headers, error mapping, retries, loading indicators:

```ts
intercept(req: HttpRequest<any>, next: HttpHandler) {
  const authed = req.clone({ setHeaders: { Authorization: `Bearer ${this.token}` } })
  return next.handle(authed)
}
```

(Requests are immutable — you must `clone`. That detail is a favourite question.)

### 3.3 Signals and state (modern Angular)

**Signals** (v16+) are Angular's fine-grained reactivity: `count = signal(0)`, `double = computed(() => this.count() * 2)`, `effect(...)`. Templates reading signals update precisely without whole-tree change detection — the foundation of zoneless Angular. Practical state ladder: component fields → service with BehaviorSubject/signals → NgRx (Redux pattern: actions/reducers/selectors/effects) only when scale and team size demand its ceremony.

## 4. Routing, Forms & Change Detection

### 4.1 Router

Route config maps paths to components, with `router-outlet` as the placeholder; `routerLink` navigates declaratively, `Router.navigate` imperatively; `ActivatedRoute` exposes params (`paramMap` observable).

- **Lazy loading:** `loadComponent`/`loadChildren` with dynamic `import()` — each feature area downloads on first visit; the default architecture for non-trivial apps.
- **Guards:** `CanActivate` (auth), `CanDeactivate` (unsaved changes), resolvers for pre-fetched data — functional guards (`() => inject(Auth).isLoggedIn()`) in modern code.

### 4.2 Forms — template-driven vs reactive

- **Template-driven:** `[(ngModel)]` in the template, Angular builds the model — quick for simple forms.
- **Reactive:** `FormGroup`/`FormControl`/`FormBuilder` in the class — explicit, typed (v14+), synchronous access, composable **validators** (built-in + custom + async), dynamic `FormArray` rows. Enterprise Angular means reactive forms; be fluent in `valueChanges` (an observable — combine with RxJS for autosave/dependent fields) and custom validator functions returning `null | {errorKey: value}`.

### 4.3 Change detection — how Angular knows to update

Default: **zone.js** patches async APIs; any event/timer/HTTP completion triggers change detection from the root, comparing template bindings. `ChangeDetectionStrategy.OnPush` skips a component unless an `@Input` reference changed, an event fired inside it, or an async pipe emitted — pairing OnPush with immutable data is the standard performance architecture (and pushes you toward the same "new references, not mutation" discipline as React). Signals move Angular toward zoneless, precise updates.

## 5. Interview Preparation — Questions & Answers

### 5.1 Basic level Q&A

**Q1. What is Angular and how does it differ from React?**
Angular is a full framework (router, DI, forms, HTTP, testing included, TypeScript-first, opinionated structure); React is a UI library you assemble a stack around. Angular uses templates + change detection; React uses JSX + re-render-and-diff. Teams pick Angular for uniform large-team structure, React for flexibility/ecosystem.

**Q2. Component vs directive vs pipe?**
Component: class + template — a UI building block. Directive: behavior attached to existing elements (structural ones like *ngIf reshape DOM; attribute ones like ngClass modify elements). Pipe: pure template value transformation (`| date`). "A component is a directive with a template" is the canonical line.

**Q3. What do the four binding syntaxes do?**
`{{x}}` interpolates text; `[prop]="x"` binds data into a DOM/component property; `(event)="fn()"` handles events; `[(ngModel)]="x"` is two-way — sugar for `[ngModel]` + `(ngModelChange)`.

**Q4. Why do initialization work in ngOnInit and not the constructor?**
The constructor is for DI wiring; `@Input()` values aren't set yet and the component isn't fully constructed by Angular. `ngOnInit` runs after inputs are bound — fetches and setup that depend on inputs belong there. It also keeps classes testable (constructing shouldn't cause side effects).

**Q5. What is a service and why `providedIn: 'root'`?**
A class for shared logic/state, injected via DI. `providedIn: 'root'` registers it as an app-wide singleton and makes it tree-shakable (unused services drop from the bundle). Providing at component level instead creates one instance per component subtree — deliberate scoping.

**Q6. What does the async pipe do and why is it preferred?**
Subscribes to an Observable/Promise in the template, renders each emission, triggers change detection appropriately (works with OnPush), and unsubscribes automatically on destroy — eliminating the most common Angular memory leak (manual subscriptions never cleaned up).

**Q7. What is trackBy on *ngFor for?**
Without it, when the array reference changes Angular re-creates all DOM rows. `trackBy: (i, item) => item.id` lets Angular match items by identity and reuse DOM — same purpose as React keys. On large lists it's the difference between smooth and janky updates.

**Q8. Template-driven vs reactive forms — one-line decision rule?**
Simple form, minimal logic → template-driven. Anything with dynamic fields, cross-field validation, typed values, or testability needs → reactive forms (explicit model in the class, validators as composable functions).

### 5.2 Intermediate level Q&A

**Q9. switchMap vs mergeMap vs concatMap vs exhaustMap — give use cases.**
switchMap cancels the previous inner observable — typeahead search (only the latest query matters). mergeMap runs all inners concurrently — independent parallel operations. concatMap queues them in order — sequential ordered writes. exhaustMap ignores new triggers while one is in flight — login/submit button spam protection. Choosing wrongly causes real bugs: mergeMap on search = out-of-order results; switchMap on saves = cancelled writes.

**Q10. How do subscriptions leak and what are the fixes?**
A component subscribing to a long-lived observable (service Subject, router events, interval) keeps the subscription — and the component — alive after destroy unless unsubscribed. Fixes in preference order: async pipe (no manual subscription at all), `takeUntilDestroyed()` (v16+), `takeUntil(this.destroy$)` completed in ngOnDestroy. Naming all three, and *when there's nothing to unsubscribe* (HttpClient completes after one emission — though takeUntil is still good hygiene), is full marks.

**Q11. Explain change detection and OnPush.**
Zone.js patches async APIs so Angular knows "something happened", then checks bindings top-down. With `OnPush`, a component is skipped unless: an input *reference* changed, an event originated inside it, an async pipe it uses emitted, or it was explicitly marked (`markForCheck`). OnPush + immutable updates = large-app performance; mutating an object in place with OnPush is the classic "my UI doesn't update" bug.

**Q12. What are HTTP interceptors good for? What's the cloning rule?**
Cross-cutting HTTP concerns: attaching auth tokens, global error handling/mapping, retry with backoff, logging, loading counters. `HttpRequest` is immutable — you must `req.clone({...})` to modify. Multiple interceptors chain in provision order — order matters (e.g., auth before logging).

**Q13. What are route guards and where does each fit?**
`CanActivate` — may you enter (auth/roles)? `CanActivateChild` — child routes. `CanDeactivate` — may you leave (unsaved changes prompt)? `CanMatch` — should this route even be considered (feature flags, A/B). Resolvers prefetch data before activation. Modern style: functional guards using `inject()`.

**Q14. How does lazy loading work and what does it buy?**
Route-level `loadChildren`/`loadComponent` with dynamic import splits each feature into its own chunk, downloaded on first navigation. Initial bundle = shell only → faster first paint. Combine with `PreloadAllModules` or custom preloading to fetch likely-next features in idle time.

**Q15. What are signals and how do they change Angular?**
`signal()` holds a value; `computed()` derives; `effect()` reacts — reads are tracked, so updates re-render precisely the templates that read them, without zone-triggered whole-tree checks. They simplify state in services (replacing many BehaviorSubjects), interop with RxJS (`toSignal`/`toObservable`), and enable zoneless Angular. RxJS remains for *event streams over time*; signals for *current state*.

**Q16. Describe Angular's DI hierarchy.**
Injectors form a tree: platform → root → (lazy module injectors) → element injectors per component. Resolution walks upward from the requesting component; the nearest provider wins. Providing at component level scopes instances to subtrees (e.g., each wizard instance gets its own state service). Root-provided singletons are the default; `@Self`, `@Optional`, `@SkipSelf` fine-tune resolution.

### 5.3 Advanced & scenario Q&A

**Q17. Scenario: a dashboard with frequent websocket updates janks. Diagnose and fix.**
Likely whole-tree change detection on every message. Fixes: OnPush everywhere feasible with immutable updates; push socket data through a stream consumed by async pipe/signals so only affected components update; batch/throttle emissions (`bufferTime`, `auditTime`) to a sane frame rate; `trackBy` on lists; run the socket *outside* Angular's zone (`NgZone.runOutsideAngular`) and re-enter only to apply batched updates; virtualize big tables (CDK virtual scroll).

**Q18. How do you share state between unrelated components — walk the ladder.**
Shared service with a `BehaviorSubject`/signal exposing `readonly` state + mutation methods (the 80% answer); URL/router state for shareable view state; NgRx (or a lighter store) when many features mutate shared slices and you need devtools/effects discipline. The anti-answers to avoid: passing through ten @Input layers, or reaching for NgRx by default.

**Q19. Scenario: an interceptor must refresh an expired JWT once and retry the failed request — outline it.**
Catch 401s in the interceptor; if no refresh in flight, call the refresh endpoint (share the in-flight refresh via a `BehaviorSubject`/`shareReplay` so concurrent 401s wait on the same refresh — not N refreshes); on success, clone the original request with the new token and `next.handle` it; on refresh failure, log out. The concurrency handling is the actual test.

**Q20. How would you test a component with an HTTP-backed service?**
`TestBed` with the component + `provideHttpClientTesting()`; inject `HttpTestingController`; drive the component, `expectOne('/api/orders')`, `flush(fakeData)`, assert the rendered DOM (fixture.detectChanges + query). For unit-level speed, alternatively stub the service class with a fake exposing Subjects you control. Also `verify()` no unexpected requests. Knowing both levels (service fake vs HTTP layer fake) reads senior.

**Q21. NgModules vs standalone — what changed and why?**
NgModules bundled declarations/imports/providers per area — boilerplate and confusion (declarations vs imports vs exports) for beginners. Standalone components declare their own imports; routes lazy-load components directly; providers register in `bootstrapApplication`. Migration is incremental — standalone components can live inside NgModule apps. New code: standalone by default (Angular 17+ CLI does this).

**Q22. What is hydration/SSR in Angular?**
Angular Universal renders HTML server-side for fast first contentful paint and SEO; v16+ **non-destructive hydration** reuses that server DOM instead of re-rendering it, wiring events onto existing nodes. Costs: server infrastructure, care with browser-only APIs (guard with `isPlatformBrowser`/`afterNextRender`). Mention incremental hydration/deferrable views (`@defer`) as the current direction.
