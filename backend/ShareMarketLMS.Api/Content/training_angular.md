## Angular Fundamentals

### What is Angular?
Angular is a TypeScript-based, open-source web application framework maintained by Google. It is a complete platform for building scalable single-page applications (SPAs) with a strong opinionated structure.

**Angular vs React vs Vue:**
| Feature | Angular | React | Vue |
|---------|---------|-------|-----|
| Type | Framework | Library | Framework |
| Language | TypeScript | JavaScript/TS | JavaScript/TS |
| Data binding | Two-way | One-way | Two-way |
| Size | Large | Medium | Small |
| Learning curve | Steep | Moderate | Easy |

**Key Angular concepts:**
- **Components** — building blocks (HTML + TS + CSS)
- **Modules** — organizers of components and services
- **Services** — shared business logic (DI)
- **Directives** — DOM manipulation instructions
- **Pipes** — template data transformation
- **RxJS Observables** — async data streams

### Setting Up an Angular Project
```bash
# Install Angular CLI
npm install -g @angular/cli

# Create project
ng new nexora-app --routing --style=scss

# Serve with hot reload
ng serve

# Generate component, service, module
ng generate component components/header
ng generate service services/auth
ng generate module features/training --routing

# Build for production
ng build --configuration production
```

### Components
The fundamental building block of Angular UIs:
```typescript
// product-card.component.ts
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Product } from '../../models/product.model';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss']
})
export class ProductCardComponent implements OnInit {
  @Input() product!: Product;         // receive data from parent
  @Input() showActions = true;
  @Output() addToCart = new EventEmitter<Product>(); // send event to parent
  @Output() productSelected = new EventEmitter<number>();

  discountedPrice = 0;

  ngOnInit(): void {
    this.discountedPrice = this.product.price * 0.9;
  }

  onAddToCart(): void {
    this.addToCart.emit(this.product);
  }

  onSelect(): void {
    this.productSelected.emit(this.product.id);
  }
}
```

```html
<!-- product-card.component.html -->
<div class="product-card">
  <img [src]="product.imageUrl" [alt]="product.name">
  <h3>{{ product.name }}</h3>
  <p class="price">{{ discountedPrice | currency:'INR' }}</p>
  <p class="original">was {{ product.price | currency:'INR' }}</p>

  <div *ngIf="showActions" class="actions">
    <button (click)="onAddToCart()">Add to Cart</button>
    <button (click)="onSelect()">View Details</button>
  </div>
</div>
```

```html
<!-- parent using the component -->
<app-product-card
  *ngFor="let product of products"
  [product]="product"
  [showActions]="true"
  (addToCart)="handleAddToCart($event)"
  (productSelected)="navigateToProduct($event)">
</app-product-card>
```

### Lifecycle Hooks
```typescript
import {
  Component, OnInit, OnDestroy, OnChanges,
  Input, SimpleChanges, AfterViewInit, ViewChild, ElementRef
} from '@angular/core';

@Component({ selector: 'app-demo', template: '<div #container></div>' })
export class DemoComponent implements OnInit, OnChanges, AfterViewInit, OnDestroy {
  @Input() data: string = '';
  @ViewChild('container') container!: ElementRef;

  private subscription: Subscription | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    // Called when @Input() values change
    if (changes['data']) {
      console.log('data changed from',
        changes['data'].previousValue, 'to',
        changes['data'].currentValue);
    }
  }

  ngOnInit(): void {
    // Called once after first ngOnChanges — init logic here
    this.subscription = someService.data$.subscribe(/* ... */);
  }

  ngAfterViewInit(): void {
    // Called after view and child views are initialized
    console.log('Container:', this.container.nativeElement);
  }

  ngOnDestroy(): void {
    // Called just before component is destroyed — clean up
    this.subscription?.unsubscribe();
  }
}
```

### Template Syntax
```html
<!-- Interpolation -->
<h1>{{ title }}</h1>
<p>{{ user.name.toUpperCase() }}</p>
<span>{{ 1 + 2 }}</span>

<!-- Property binding — JS expression → DOM property -->
<img [src]="imageUrl" [alt]="product.name">
<button [disabled]="!isValid">Submit</button>
<div [ngClass]="{ 'active': isActive, 'error': hasError }">...</div>
<div [ngStyle]="{ 'color': themeColor, 'font-size': fontSize + 'px' }">...</div>

<!-- Event binding -->
<button (click)="submit()">Submit</button>
<input (keyup)="onKey($event)" (blur)="onBlur()">
<form (ngSubmit)="onSubmit()">...</form>

<!-- Two-way binding -->
<input [(ngModel)]="searchTerm">
<!-- Equivalent to: -->
<input [value]="searchTerm" (input)="searchTerm = $event.target.value">

<!-- *ngIf — conditional rendering -->
<div *ngIf="isLoggedIn; else loginBlock">
  Welcome, {{ user.name }}!
</div>
<ng-template #loginBlock>
  <a routerLink="/login">Please log in</a>
</ng-template>

<!-- *ngFor — list rendering -->
<ul>
  <li *ngFor="let item of items; let i = index; trackBy: trackById">
    {{ i + 1 }}. {{ item.name }}
  </li>
</ul>

<!-- *ngSwitch -->
<div [ngSwitch]="status">
  <span *ngSwitchCase="'active'">Active</span>
  <span *ngSwitchCase="'inactive'">Inactive</span>
  <span *ngSwitchDefault>Unknown</span>
</div>

<!-- ng-content — content projection (slot) -->
<app-card>
  <h3 slot="header">Card Title</h3>
  <p>Card body content</p>
</app-card>
```

## Services and Dependency Injection

### Creating and Using Services
```typescript
// product.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map, retry } from 'rxjs/operators';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'  // singleton, available app-wide
})
export class ProductService {
  private apiUrl = '/api/products';

  constructor(private http: HttpClient) {}

  getAll(params?: { category?: string; minPrice?: number }): Observable<Product[]> {
    let httpParams = new HttpParams();
    if (params?.category) httpParams = httpParams.set('category', params.category);
    if (params?.minPrice) httpParams = httpParams.set('minPrice', params.minPrice.toString());

    return this.http.get<Product[]>(this.apiUrl, { params: httpParams }).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  getById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  create(product: Partial<Product>): Observable<Product> {
    return this.http.post<Product>(this.apiUrl, product);
  }

  update(id: number, product: Partial<Product>): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/${id}`, product);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  private handleError(error: any): Observable<never> {
    console.error('API error:', error);
    return throwError(() => new Error(error.message || 'Server error'));
  }
}
```

```typescript
// Using in a component
@Component({ selector: 'app-product-list' /* ... */ })
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  loading = false;
  error = '';

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loading = true;
    this.productService.getAll({ category: 'electronics' }).subscribe({
      next: data => { this.products = data; this.loading = false; },
      error: err => { this.error = err.message; this.loading = false; }
    });
  }
}
```

### HTTP Interceptors
```typescript
// auth.interceptor.ts
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('token');

    const authReq = token
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

    return next.handle(authReq).pipe(
      catchError(error => {
        if (error.status === 401) {
          localStorage.removeItem('token');
          this.router.navigate(['/login']);
        }
        return throwError(() => error);
      })
    );
  }
}

// Register in AppModule providers:
// { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
```

## RxJS — Reactive Programming

### Observables and Operators
```typescript
import { Observable, Subject, BehaviorSubject, combineLatest, of, from } from 'rxjs';
import {
  map, filter, switchMap, debounceTime, distinctUntilChanged,
  catchError, takeUntil, mergeMap, concatMap, forkJoin, tap
} from 'rxjs/operators';

// Creating observables
const numbers$ = of(1, 2, 3, 4, 5);
const array$ = from([10, 20, 30]);
const interval$ = interval(1000); // emits 0,1,2,... every second

// Transformation operators
numbers$.pipe(
  filter(n => n % 2 === 0),     // 2, 4
  map(n => n * n),              // 4, 16
  take(2)                       // 4, 16 (then complete)
).subscribe(console.log);

// switchMap — cancel previous inner observable (search, navigation)
searchTerm$.pipe(
  debounceTime(300),             // wait 300ms after user stops typing
  distinctUntilChanged(),        // only emit if value changed
  switchMap(term =>              // cancel previous HTTP request
    this.productService.search(term).pipe(
      catchError(() => of([]))   // on error return empty array
    )
  )
).subscribe(results => this.results = results);

// forkJoin — parallel, wait for all (like Promise.all)
forkJoin({
  products: this.productService.getAll(),
  categories: this.categoryService.getAll(),
  user: this.authService.getCurrentUser()
}).subscribe(({ products, categories, user }) => {
  this.products = products;
  this.categories = categories;
  this.user = user;
});

// combineLatest — emit when ANY source emits
combineLatest([filter$, sort$, page$]).pipe(
  switchMap(([filter, sort, page]) => this.loadData(filter, sort, page))
).subscribe(data => this.data = data);
```

### Subject Types
```typescript
// Subject — plain multicast
const subject = new Subject<string>();
subject.subscribe(v => console.log('A:', v));
subject.subscribe(v => console.log('B:', v));
subject.next('hello');  // A: hello, B: hello

// BehaviorSubject — holds current value, replays to new subscribers
const currentUser$ = new BehaviorSubject<User | null>(null);
currentUser$.next(loggedInUser);
// New subscribers immediately get the current value

// ReplaySubject — replays N last values
const replay$ = new ReplaySubject<number>(3);
replay$.next(1); replay$.next(2); replay$.next(3); replay$.next(4);
replay$.subscribe(v => console.log(v));  // 2, 3, 4

// AsyncSubject — only emits when complete()
const async$ = new AsyncSubject<number>();
async$.next(1); async$.next(2); async$.next(3);
async$.complete();
async$.subscribe(v => console.log(v));  // 3 only
```

## Forms

### Template-Driven Forms
```html
<form #productForm="ngForm" (ngSubmit)="onSubmit(productForm)">
  <div>
    <label>Product Name</label>
    <input name="name"
           [(ngModel)]="product.name"
           required
           minlength="3"
           #name="ngModel">
    <div *ngIf="name.invalid && name.touched">
      <small *ngIf="name.errors?.['required']">Name is required</small>
      <small *ngIf="name.errors?.['minlength']">Minimum 3 characters</small>
    </div>
  </div>

  <div>
    <label>Price</label>
    <input name="price" type="number" [(ngModel)]="product.price"
           required min="0" #price="ngModel">
    <div *ngIf="price.invalid && price.touched">
      <small>Valid price required</small>
    </div>
  </div>

  <button type="submit" [disabled]="productForm.invalid">Save</button>
</form>
```

### Reactive Forms
```typescript
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';

@Component({ selector: 'app-register' /* ... */ })
export class RegisterComponent {
  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      profile: this.fb.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        age: [null, [Validators.min(18), Validators.max(120)]]
      })
    }, { validators: this.passwordMatch });
  }

  // Custom validator
  passwordMatch(control: AbstractControl) {
    const pwd = control.get('password')?.value;
    const cpwd = control.get('confirmPassword')?.value;
    return pwd === cpwd ? null : { passwordMismatch: true };
  }

  get email() { return this.form.get('email')!; }
  get password() { return this.form.get('password')!; }

  onSubmit(): void {
    if (this.form.invalid) return;
    const values = this.form.getRawValue();
    // submit values
  }
}
```

## Routing

### Angular Router
```typescript
// app-routing.module.ts
const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'products', component: ProductListComponent },
  { path: 'products/:id', component: ProductDetailComponent },

  // Lazy-loaded module
  {
    path: 'training',
    loadChildren: () => import('./features/training/training.module')
      .then(m => m.TrainingModule),
    canActivate: [AuthGuard]
  },

  // Nested routes
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard, AdminGuard],
    children: [
      { path: 'users', component: UserManagementComponent },
      { path: 'courses', component: CourseManagementComponent },
    ]
  },

  { path: '**', component: NotFoundComponent }
];

// Route guard
@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): boolean {
    if (this.auth.isLoggedIn()) return true;
    this.router.navigate(['/login']);
    return false;
  }
}
```

```typescript
// Navigation in component
import { Router, ActivatedRoute } from '@angular/router';

@Component({ selector: 'app-product-detail' /* ... */ })
export class ProductDetailComponent implements OnInit {
  productId!: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Read route parameter
    this.productId = +this.route.snapshot.paramMap.get('id')!;

    // Or subscribe to changes (for reuse across navigations)
    this.route.paramMap.subscribe(params => {
      this.productId = +params.get('id')!;
      this.loadProduct();
    });

    // Read query params
    this.route.queryParamMap.subscribe(params => {
      const page = params.get('page') || '1';
    });
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }

  goToProduct(id: number): void {
    this.router.navigate(['/products', id], {
      queryParams: { ref: 'search' }
    });
  }
}
```

## Advanced Angular

### Change Detection Strategy
```typescript
// Default: ChangeDetectionStrategy.Default — checks entire tree
// OnPush: only checks when:
//   - @Input() reference changes
//   - event originates from this component
//   - async pipe receives new value
//   - manually triggered

@Component({
  selector: 'app-product-card',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductCardComponent {
  @Input() product!: Product;
}

// Manually trigger change detection
constructor(private cdr: ChangeDetectorRef) {}

updateData(): void {
  this.data = newData;
  this.cdr.markForCheck();   // schedule check
  // or
  this.cdr.detectChanges();  // immediate check
}
```

### State Management with NgRx
```typescript
// state/product.actions.ts
import { createAction, props } from '@ngrx/store';
import { Product } from '../models/product.model';

export const loadProducts = createAction('[Product] Load Products');
export const loadProductsSuccess = createAction(
  '[Product] Load Products Success',
  props<{ products: Product[] }>()
);
export const loadProductsFailure = createAction(
  '[Product] Load Products Failure',
  props<{ error: string }>()
);

// state/product.reducer.ts
export interface ProductState {
  products: Product[];
  loading: boolean;
  error: string | null;
}

const initialState: ProductState = { products: [], loading: false, error: null };

export const productReducer = createReducer(
  initialState,
  on(loadProducts, state => ({ ...state, loading: true, error: null })),
  on(loadProductsSuccess, (state, { products }) => ({
    ...state, products, loading: false
  })),
  on(loadProductsFailure, (state, { error }) => ({
    ...state, error, loading: false
  }))
);

// state/product.effects.ts
@Injectable()
export class ProductEffects {
  loadProducts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadProducts),
      switchMap(() =>
        this.productService.getAll().pipe(
          map(products => loadProductsSuccess({ products })),
          catchError(err => of(loadProductsFailure({ error: err.message })))
        )
      )
    )
  );

  constructor(
    private actions$: Actions,
    private productService: ProductService
  ) {}
}
```

### Custom Pipes
```typescript
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'truncate' })
export class TruncatePipe implements PipeTransform {
  transform(value: string, limit = 50, trail = '...'): string {
    return value.length > limit ? value.substring(0, limit) + trail : value;
  }
}

@Pipe({ name: 'timeAgo', pure: false }) // impure = recalculates often
export class TimeAgoPipe implements PipeTransform {
  transform(value: Date | string): string {
    const date = new Date(value);
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }
}

// Usage in template
{{ product.description | truncate:100 }}
{{ entry.createdAt | timeAgo }}
{{ price | currency:'INR':'symbol':'1.2-2' }}
{{ items | slice:0:5 | async }}
```

## Interview Preparation

### Angular Interview Questions

**Q1. What is Angular and how is it different from AngularJS?**
Angular (2+) is a complete TypeScript framework. AngularJS (1.x) was JavaScript-based with `$scope`. Angular uses components, TypeScript, RxJS, and a component tree. AngularJS used controllers/scopes/two-way binding via digest cycle.

**Q2. What is a Component in Angular?**
The basic UI building block. Consists of: TypeScript class (logic), HTML template (view), CSS styles (scoped). Decorated with `@Component({ selector, templateUrl, styleUrls })`.

**Q3. What is the difference between `ngOnInit` and the constructor?**
Constructor: runs when class is instantiated — use for DI only. `ngOnInit`: runs after Angular initializes `@Input()` properties — use for init logic (API calls, subscriptions). `@Input()` values are NOT set in constructor.

**Q4. What is a directive? Types?**
Directives modify the DOM. Types:
- **Structural**: alter layout (`*ngIf`, `*ngFor`, `*ngSwitch`)
- **Attribute**: alter appearance/behavior (`[ngClass]`, `[ngStyle]`, custom)
- **Component**: directives with a template

**Q5. What is a pipe? Difference between pure and impure?**
Pipes transform template values. Pure: only recalculates when input reference changes (default, optimized). Impure (`pure: false`): recalculates on every change detection cycle (expensive, use sparingly).

**Q6. Difference between template-driven and reactive forms?**
Template-driven: logic in HTML, uses `ngModel`, `FormsModule`, simpler but less control. Reactive: logic in TypeScript, `FormBuilder`/`FormGroup`, `ReactiveFormsModule`, more powerful, easier to test and validate.

**Q7. What is lazy loading? Why use it?**
Loading feature modules only when the route is activated (not at startup). Reduces initial bundle size → faster first load. Configured with `loadChildren` in the router.

**Q8. What is a resolver?**
Route resolver pre-fetches data before a component activates. Prevents showing component before data is ready. Implement `Resolve<T>` interface, return an Observable.

**Q9. What is the difference between `switchMap`, `mergeMap`, `concatMap`?**
- `switchMap`: cancels previous inner observable — use for search, navigation
- `mergeMap`: keeps all inner observables concurrent — use for parallel requests
- `concatMap`: queues — runs sequentially, in order — use for ordered operations

**Q10. What is `ChangeDetectionStrategy.OnPush` and why use it?**
Default runs change detection on every event throughout the tree. OnPush only checks the component when: an `@Input()` reference changes, an event occurs in this component, or an async pipe receives new data. Dramatically improves performance for large component trees.

**Q11. What is an interceptor?**
A service implementing `HttpInterceptor` that can intercept all HTTP requests/responses. Use cases: adding auth headers, logging, error handling, loading indicators.

**Q12. What is the Angular DI system?**
Hierarchical DI. Providers registered at: Root (singleton app-wide), Module, Component (new instance per component). Angular resolves dependencies via constructor injection — walks the injector tree upward.

**Q13. What is NgRx?**
State management library based on Redux pattern. Unidirectional data flow: Component dispatches Action → Reducer updates State → Selector reads State → Component renders. Effects handle side effects (API calls).

**Q14. What is the `async` pipe?**
Angular pipe that subscribes to an Observable/Promise and returns its latest value. Automatically unsubscribes on component destroy — preventing memory leaks. Works with `*ngIf` and `*ngFor`:
```html
<div *ngIf="products$ | async as products">
  <app-product-card *ngFor="let p of products" [product]="p">
  </app-product-card>
</div>
```

**Q15. How do you prevent memory leaks in Angular?**
Unsubscribe from Observables in `ngOnDestroy`. Approaches: `takeUntil(destroy$)` pattern, `async` pipe, `SubSink`, `@UntilDestroy()` decorator, `take(1)` for one-time subscriptions.
