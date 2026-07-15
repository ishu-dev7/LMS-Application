## Java Fundamentals

### Introduction to Java
Java is a class-based, object-oriented, platform-independent programming language. Write Once, Run Anywhere (WORA) — Java code compiles to bytecode that runs on the Java Virtual Machine (JVM).

**Java Editions:**
- **Java SE** (Standard Edition) — core language and APIs
- **Java EE / Jakarta EE** — enterprise features (Servlets, JPA, CDI)
- **Java ME** — mobile/embedded
- **Spring Boot** — most popular framework for microservices

**Hello World:**
```java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, Nexora!");
    }
}
```

**Compile and run:**
```bash
javac HelloWorld.java    # compile → HelloWorld.class
java HelloWorld          # run
```

### Variables and Data Types
Java is **strongly statically typed** — every variable must have a declared type.

**Primitive types:**
```java
byte   b = 127;                // 8-bit integer
short  s = 32767;              // 16-bit integer
int    i = 2_147_483_647;      // 32-bit integer (underscores for readability)
long   l = 9_223_372_036L;     // 64-bit integer (suffix L)
float  f = 3.14f;              // 32-bit float (suffix f)
double d = 3.14159265358979;   // 64-bit double
char   c = 'A';                // 16-bit Unicode character
boolean flag = true;           // true or false
```

**Reference types:**
```java
String name = "Nexora";        // String (immutable)
int[] arr = {1, 2, 3};        // array
Object obj = new Object();     // base class
```

**Autoboxing/Unboxing** — automatic conversion between primitives and wrapper types:
```java
Integer x = 42;     // autoboxing: int → Integer
int y = x;          // unboxing:  Integer → int
List<Integer> list = new ArrayList<>();
list.add(10);        // autoboxing implicit
```

### Operators and String Operations
```java
// Arithmetic
int a = 10, b = 3;
System.out.println(a + b);   // 13
System.out.println(a / b);   // 3 (integer division)
System.out.println(a % b);   // 1

// String concatenation
String s = "Hello" + " " + "World";   // "Hello World"

// String comparison — ALWAYS use .equals(), not ==
String s1 = "hello";
String s2 = new String("hello");
System.out.println(s1.equals(s2));        // true
System.out.println(s1.equalsIgnoreCase("HELLO"));  // true

// String methods
String str = "  Java Programming  ";
str.trim()                  // "Java Programming"
str.toLowerCase()           // "  java programming  "
str.toUpperCase()
str.contains("Java")        // true
str.startsWith("  ")        // true
str.replace("Java", "C#")   // "  C# Programming  "
str.split(" ")              // array of parts
str.charAt(2)               // 'J'
str.length()                // 20
str.indexOf("Java")         // 2
str.substring(2, 6)         // "Java"

// String.format
String msg = String.format("Name: %s, Age: %d", "Udit", 28);

// StringBuilder — for mutable strings
StringBuilder sb = new StringBuilder();
sb.append("Hello");
sb.append(" ").append("World");
sb.insert(0, ">> ");
System.out.println(sb.toString());
```

### Control Flow
```java
// if / else if / else
int score = 85;
if (score >= 90) {
    System.out.println("A");
} else if (score >= 80) {
    System.out.println("B");
} else {
    System.out.println("Fail");
}

// switch (traditional)
int day = 3;
switch (day) {
    case 1: System.out.println("Monday"); break;
    case 2: System.out.println("Tuesday"); break;
    default: System.out.println("Other");
}

// switch expression (Java 14+)
String label = switch (score) {
    case 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100 -> "A";
    default -> score >= 80 ? "B" : "F";
};

// Loops
for (int i = 0; i < 5; i++) System.out.print(i + " ");
while (score > 0) { score -= 10; }
do { score++; } while (score < 10);

// Enhanced for (foreach)
int[] nums = {1, 2, 3, 4, 5};
for (int n : nums) System.out.print(n + " ");
```

## Object-Oriented Programming

### Classes, Objects, Constructors
```java
public class BankAccount {
    // Fields (instance variables)
    private String owner;
    private double balance;
    private static int totalAccounts = 0;  // class variable

    // Constructor
    public BankAccount(String owner, double initialBalance) {
        this.owner = owner;
        this.balance = initialBalance;
        totalAccounts++;
    }

    // Getter / Setter (encapsulation)
    public String getOwner() { return owner; }
    public double getBalance() { return balance; }

    public void deposit(double amount) {
        if (amount <= 0) throw new IllegalArgumentException("Amount must be positive");
        balance += amount;
    }

    public boolean withdraw(double amount) {
        if (amount > balance) return false;
        balance -= amount;
        return true;
    }

    // Static method
    public static int getTotalAccounts() { return totalAccounts; }

    @Override
    public String toString() {
        return String.format("Account[%s] Balance: %.2f", owner, balance);
    }
}

// Usage
BankAccount acc = new BankAccount("Udit", 10000);
acc.deposit(5000);
System.out.println(acc);
```

### Inheritance and Polymorphism
```java
// Base class
public class Animal {
    protected String name;

    public Animal(String name) { this.name = name; }

    public String speak() { return name + " makes a sound"; }

    @Override
    public String toString() { return "Animal: " + name; }
}

// Derived class
public class Dog extends Animal {
    private String breed;

    public Dog(String name, String breed) {
        super(name);   // call parent constructor
        this.breed = breed;
    }

    @Override
    public String speak() { return name + " says: Woof!"; }

    public void fetch() { System.out.println(name + " fetches!"); }
}

// Polymorphism
Animal[] animals = { new Dog("Rex", "Lab"), new Cat("Whiskers") };
for (Animal a : animals) {
    System.out.println(a.speak());  // calls the right speak()
}

// instanceof
if (animals[0] instanceof Dog d) {   // Java 16+ pattern matching
    d.fetch();
}
```

### Interfaces and Abstract Classes
```java
// Interface — contract
public interface Payable {
    double calculatePay();  // implicitly public abstract
    default void printPayStub() {
        System.out.printf("Pay: %.2f%n", calculatePay());
    }
}

public interface Serializable { /* marker */ }

// Abstract class — partial implementation
public abstract class Shape {
    protected String color;

    public Shape(String color) { this.color = color; }

    public abstract double area();       // subclass must implement
    public abstract double perimeter();

    public void display() {  // shared implementation
        System.out.printf("%s: area=%.2f%n", getClass().getSimpleName(), area());
    }
}

public class Circle extends Shape implements Serializable {
    private double radius;

    public Circle(double radius) {
        super("Red");
        this.radius = radius;
    }

    @Override public double area() { return Math.PI * radius * radius; }
    @Override public double perimeter() { return 2 * Math.PI * radius; }
}
```

### Collections Framework
```java
import java.util.*;
import java.util.stream.*;

// ArrayList — dynamic array
List<String> fruits = new ArrayList<>(Arrays.asList("Apple","Banana","Mango"));
fruits.add("Orange");
fruits.remove("Banana");
fruits.size();           // 3
fruits.get(0);           // Apple
fruits.contains("Mango"); // true
Collections.sort(fruits);

// LinkedList — doubly linked list
LinkedList<Integer> queue = new LinkedList<>();
queue.offer(1); queue.offer(2); queue.offer(3);
queue.poll();    // remove and return head = 1

// HashMap — key-value pairs (unordered)
Map<String, Integer> scores = new HashMap<>();
scores.put("Alice", 95);
scores.put("Bob", 87);
scores.getOrDefault("Charlie", 0);  // 0 (safe get)
scores.computeIfAbsent("Dave", k -> 70);

// LinkedHashMap — maintains insertion order
// TreeMap — sorted by key

// HashSet — unique elements
Set<String> tags = new HashSet<>(Arrays.asList("java","spring","jpa"));
tags.add("java");  // duplicate ignored

// PriorityQueue — min-heap by default
PriorityQueue<Integer> pq = new PriorityQueue<>();
pq.offer(5); pq.offer(1); pq.offer(3);
pq.poll();   // 1 (smallest)
```

### Generics
```java
// Generic class
public class Pair<T, U> {
    private T first;
    private U second;

    public Pair(T first, U second) {
        this.first = first;
        this.second = second;
    }

    public T getFirst() { return first; }
    public U getSecond() { return second; }

    @Override
    public String toString() { return "(" + first + ", " + second + ")"; }
}

// Usage
Pair<String, Integer> p = new Pair<>("Score", 95);
System.out.println(p.getFirst());  // Score

// Generic method
public static <T extends Comparable<T>> T max(T a, T b) {
    return a.compareTo(b) >= 0 ? a : b;
}

// Bounded wildcards
public static double sumList(List<? extends Number> list) {
    return list.stream().mapToDouble(Number::doubleValue).sum();
}
```

## Java Streams

### Stream API — Functional Style
```java
import java.util.stream.*;

List<Employee> employees = List.of(
    new Employee("Alice", 30, "IT", 80000),
    new Employee("Bob",   25, "Finance", 60000),
    new Employee("Carol", 35, "IT", 95000),
    new Employee("Dave",  28, "HR", 55000)
);

// filter + map + collect
List<String> itNames = employees.stream()
    .filter(e -> e.getDepartment().equals("IT"))
    .map(Employee::getName)
    .sorted()
    .collect(Collectors.toList());
// [Alice, Carol]

// reduce — aggregate
double totalSalary = employees.stream()
    .mapToDouble(Employee::getSalary)
    .sum();  // or .average() .min() .max()

// groupingBy
Map<String, List<Employee>> byDept = employees.stream()
    .collect(Collectors.groupingBy(Employee::getDepartment));

// counting per group
Map<String, Long> countByDept = employees.stream()
    .collect(Collectors.groupingBy(Employee::getDepartment, Collectors.counting()));

// average salary per department
Map<String, Double> avgSalByDept = employees.stream()
    .collect(Collectors.groupingBy(
        Employee::getDepartment,
        Collectors.averagingDouble(Employee::getSalary)
    ));

// findFirst, anyMatch, allMatch
Optional<Employee> first = employees.stream()
    .filter(e -> e.getSalary() > 70000)
    .findFirst();

boolean anyIT = employees.stream().anyMatch(e -> e.getDepartment().equals("IT"));
boolean allPaid = employees.stream().allMatch(e -> e.getSalary() > 40000);

// flatMap — flatten nested lists
List<List<Integer>> nested = List.of(List.of(1,2), List.of(3,4), List.of(5));
List<Integer> flat = nested.stream()
    .flatMap(Collection::stream)
    .collect(Collectors.toList());
// [1, 2, 3, 4, 5]
```

### Lambda Expressions and Functional Interfaces
```java
// Functional interface — exactly one abstract method
@FunctionalInterface
interface Transformer<T, R> {
    R transform(T input);
}

// Lambda usage
Transformer<String, Integer> len = s -> s.length();
Transformer<Integer, Integer> square = n -> n * n;

// Built-in functional interfaces
Predicate<String> isLong = s -> s.length() > 5;
Function<String, Integer> toInt = Integer::parseInt;   // method reference
Consumer<String> print = System.out::println;
Supplier<List<String>> newList = ArrayList::new;
BiFunction<Integer, Integer, Integer> add = (a, b) -> a + b;

// Method references
List<String> names = List.of("Alice", "Bob", "Carol");
names.forEach(System.out::println);           // instance method ref
names.stream().map(String::toUpperCase)       // unbound instance method
              .forEach(System.out::println);
```

### Exception Handling
```java
// Checked vs Unchecked
// Checked: IOException, SQLException — must be declared or caught
// Unchecked: NullPointerException, ArrayIndexOutOfBoundsException

// try-catch-finally
try {
    int[] arr = new int[3];
    arr[5] = 10;  // ArrayIndexOutOfBoundsException
} catch (ArrayIndexOutOfBoundsException e) {
    System.err.println("Index error: " + e.getMessage());
} catch (Exception e) {
    System.err.println("General error: " + e.getMessage());
} finally {
    System.out.println("Always runs");
}

// try-with-resources — auto-close
try (BufferedReader br = new BufferedReader(new FileReader("file.txt"))) {
    String line;
    while ((line = br.readLine()) != null)
        System.out.println(line);
} catch (IOException e) {
    e.printStackTrace();
}

// Custom exception
public class InsufficientFundsException extends RuntimeException {
    private final double amount;

    public InsufficientFundsException(double amount) {
        super(String.format("Insufficient funds. Requested: %.2f", amount));
        this.amount = amount;
    }

    public double getAmount() { return amount; }
}

// Multi-catch
try { /* ... */ }
catch (IOException | SQLException e) { /* handle both */ }
```

### Optional — Avoiding Null
```java
Optional<String> opt = Optional.of("Hello");
Optional<String> empty = Optional.empty();
Optional<String> nullable = Optional.ofNullable(null);

// Check and get
opt.isPresent();        // true
opt.get();              // "Hello"
opt.orElse("default");  // "Hello"
empty.orElse("default"); // "default"

// Chaining
Optional<Integer> length = opt
    .filter(s -> s.length() > 3)
    .map(String::length);

// orElseGet — lazy supplier
String val = empty.orElseGet(() -> computeDefault());

// orElseThrow
String result = opt.orElseThrow(() -> new RuntimeException("Not found"));
```

## Spring Boot

### Spring Boot Basics
```java
// pom.xml dependency
// <dependency>
//   <groupId>org.springframework.boot</groupId>
//   <artifactId>spring-boot-starter-web</artifactId>
// </dependency>

@SpringBootApplication   // @Configuration + @EnableAutoConfiguration + @ComponentScan
public class NexoraApp {
    public static void main(String[] args) {
        SpringApplication.run(NexoraApp.class, args);
    }
}

// REST Controller
@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductService service;

    @GetMapping
    public List<Product> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getById(@PathVariable Long id) {
        return service.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Product create(@RequestBody @Valid ProductDto dto) {
        return service.create(dto);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Product> update(@PathVariable Long id,
                                          @RequestBody @Valid ProductDto dto) {
        return service.update(id, dto)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
```

### Spring Data JPA
```java
// Entity
@Entity
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String name;

    @Column(precision = 18, scale = 2)
    private BigDecimal price;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    // getters/setters or @Data (Lombok)
}

// Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    // Derived queries
    List<Product> findByCategory_Name(String categoryName);
    Optional<Product> findByNameIgnoreCase(String name);
    List<Product> findByPriceBetween(BigDecimal min, BigDecimal max);

    // JPQL
    @Query("SELECT p FROM Product p WHERE p.price > :minPrice ORDER BY p.name")
    List<Product> findExpensive(@Param("minPrice") BigDecimal minPrice);

    // Native SQL
    @Query(value = "SELECT * FROM products WHERE stock > 0 LIMIT :limit",
           nativeQuery = true)
    List<Product> findInStock(@Param("limit") int limit);
}

// Service
@Service
@Transactional
public class ProductService {
    private final ProductRepository repo;

    public ProductService(ProductRepository repo) { this.repo = repo; }

    public List<Product> findAll() { return repo.findAll(); }

    public Optional<Product> findById(Long id) { return repo.findById(id); }

    public Product create(ProductDto dto) {
        Product p = new Product();
        p.setName(dto.getName());
        p.setPrice(dto.getPrice());
        return repo.save(p);
    }
}
```

## Interview Preparation

### Java Interview Questions

**Q1. What is the difference between `==` and `.equals()` in Java?**
`==` compares references (memory addresses) for objects; compares values for primitives. `.equals()` compares content (overridden in String, Integer, etc.). Always use `.equals()` for String comparison.

**Q2. What is the difference between `ArrayList` and `LinkedList`?**
- `ArrayList`: backed by array; O(1) random access; O(n) insert/delete in middle
- `LinkedList`: doubly linked; O(n) random access; O(1) insert/delete with iterator

**Q3. What is `HashMap` internal working?**
Uses array of buckets. Key → `hashCode()` → bucket index. Collision → linked list (Java 8+: treeifies to red-black tree when bucket size > 8). Load factor = 0.75 triggers resize.

**Q4. What is the difference between `HashMap` and `ConcurrentHashMap`?**
`HashMap` is not thread-safe. `ConcurrentHashMap` uses segment-level locking (Java 7) / CAS operations (Java 8+) for thread-safe concurrent access without locking the entire map.

**Q5. Explain the Java Memory Model.**
Heap: shared by all threads (objects, class data). Stack: per-thread (local variables, method frames). Metaspace: class metadata. Young gen (Eden + Survivor) + Old gen for GC optimization.

**Q6. What is the difference between checked and unchecked exceptions?**
Checked (e.g. `IOException`): must be declared with `throws` or caught — compiler enforces. Unchecked (`RuntimeException` and subclasses): optional handling.

**Q7. What are design patterns commonly used in Java?**
- **Singleton**: one instance (`private static instance`, double-checked locking)
- **Factory/Factory Method**: creates objects
- **Builder**: fluent construction of complex objects (e.g. `StringBuilder`)
- **Observer**: event listeners
- **Strategy**: interchangeable algorithms
- **Decorator**: wraps to add behavior

**Q8. What is the difference between `interface` and `abstract class` in Java?**
Interface: multiple inheritance, no instance state (pre-Java 8), `default`/`static` methods (Java 8+). Abstract class: single inheritance, can have fields, constructors. Use interface for defining contracts; abstract class for sharing implementation.

**Q9. What is a lambda expression in Java?**
Anonymous function implementing a functional interface. Syntax: `(params) -> expression`. Enables functional-style programming and is used heavily with Stream API.

**Q10. What is the Stream API?**
Declarative, functional-style operations on collections: `filter`, `map`, `reduce`, `collect`, `sorted`. Lazy — intermediate operations only execute when terminal operation is called.

**Q11. What is `Optional` and why use it?**
Wrapper that explicitly represents a value that may be absent. Avoids `NullPointerException` by forcing explicit handling. Better than returning null.

**Q12. What is the difference between `final`, `finally`, `finalize`?**
- `final`: constant variable, no-override method, no-extend class
- `finally`: always-runs block in try-catch
- `finalize()`: deprecated GC hook — never use

**Q13. What is multithreading in Java?**
Multiple threads executing concurrently in the same JVM process. Key classes: `Thread`, `Runnable`, `ExecutorService`, `CompletableFuture`. Concurrency issues: race conditions, deadlock, starvation.

**Q14. What is `CompletableFuture`?**
Java 8+ class for async/non-blocking programming. Supports chaining (`.thenApply()`, `.thenCompose()`), combining (`.allOf()`, `.anyOf()`), and exception handling (`.exceptionally()`).

**Q15. Explain Java's garbage collection.**
GC automatically reclaims heap memory for objects with no references. Generational: most objects die young (Eden → Survivor → Old gen promotion). GC algorithms: Serial, Parallel, CMS (deprecated), G1 (default Java 9+), ZGC (low-pause).
