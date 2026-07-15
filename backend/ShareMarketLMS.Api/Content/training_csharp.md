## Fundamentals

### Introduction to C#
C# (pronounced "C-Sharp") is a modern, object-oriented, type-safe programming language developed by Microsoft as part of the .NET platform. It combines the power of C++ with the simplicity of Visual Basic.

**Why C#?**
- Strongly typed — catches errors at compile time
- Object-oriented — everything is an object
- Cross-platform via .NET 6+ (Windows, Linux, macOS)
- Used for web APIs, desktop apps, games (Unity), mobile (MAUI)

```csharp
using System;

class Program
{
    static void Main(string[] args)
    {
        Console.WriteLine("Hello, Nexora!");
    }
}
```

**Key facts:**
- File extension: `.cs`
- Compiled to IL (Intermediate Language) then JIT-compiled at runtime
- Managed memory — CLR handles garbage collection

### Variables and Data Types
C# is strongly typed. Every variable must have a declared type.

**Value Types** (stored on the stack):
```csharp
int age = 25;                  // 32-bit integer
long population = 8_000_000_000L; // 64-bit integer
double price = 99.99;          // 64-bit floating point
float temperature = 36.6f;     // 32-bit float (suffix f)
decimal salary = 75000.50m;    // 128-bit, for money (suffix m)
bool isActive = true;          // true / false
char grade = 'A';              // single Unicode character
```

**Reference Types** (stored on the heap):
```csharp
string name = "Nexora";        // immutable sequence of chars
object obj = 42;               // base type of everything
int[] scores = {90, 85, 78};  // array
```

**`var` keyword** — type inferred by compiler:
```csharp
var city = "Mumbai";    // compiler infers string
var count = 10;         // compiler infers int
```

**Nullable types** — allow value types to hold null:
```csharp
int? nullableAge = null;
double? score = null;
if (nullableAge.HasValue)
    Console.WriteLine(nullableAge.Value);
```

### Type Casting and Conversion
**Implicit casting** — safe, no data loss:
```csharp
int x = 100;
long y = x;     // int → long, implicit
double d = x;   // int → double, implicit
```

**Explicit casting** — may lose data:
```csharp
double pi = 3.14159;
int approx = (int)pi;   // 3 — decimal part lost

long big = 3_000_000_000;
int small = (int)big;   // data loss possible
```

**Convert class** — safe conversion with parsing:
```csharp
string s = "42";
int n = Convert.ToInt32(s);
int n2 = int.Parse(s);
int.TryParse(s, out int n3);  // safe — no exception
```

### Operators
```csharp
// Arithmetic
int a = 10, b = 3;
Console.WriteLine(a + b);   // 13
Console.WriteLine(a - b);   // 7
Console.WriteLine(a * b);   // 30
Console.WriteLine(a / b);   // 3  (integer division)
Console.WriteLine(a % b);   // 1  (remainder)

// Comparison
bool eq  = a == b;   // false
bool neq = a != b;   // true
bool gt  = a > b;    // true
bool lte = a <= b;   // false

// Logical
bool and = true && false;   // false
bool or  = true || false;   // true
bool not = !true;           // false

// Null-coalescing
string? input = null;
string result = input ?? "default";   // "default"

// Null-conditional
string? str = null;
int? len = str?.Length;   // null (no NullReferenceException)

// Ternary
int max = a > b ? a : b;   // 10
```

### Strings — Deep Dive
Strings in C# are **immutable reference types**.

```csharp
string s = "Hello, C#";

// Common properties and methods
Console.WriteLine(s.Length);           // 9
Console.WriteLine(s.ToUpper());        // HELLO, C#
Console.WriteLine(s.ToLower());        // hello, c#
Console.WriteLine(s.Trim());           // removes whitespace
Console.WriteLine(s.Contains("C#"));  // true
Console.WriteLine(s.Replace("C#","World")); // Hello, World
Console.WriteLine(s.Substring(7, 2)); // C#
Console.WriteLine(s.IndexOf("C"));    // 7
Console.WriteLine(s.Split(',')[0]);    // Hello

// String interpolation (preferred)
string name = "Udit";
int year = 2025;
string msg = $"Welcome {name}, year {year}!";

// Verbatim string (raw, no escape needed)
string path = @"C:\Users\admin\file.txt";

// StringBuilder — for frequent concatenation
var sb = new System.Text.StringBuilder();
sb.Append("Hello");
sb.AppendLine(" World");
sb.Insert(0, ">> ");
Console.WriteLine(sb.ToString());
```

### Control Flow — Conditionals
```csharp
int score = 85;

// if / else if / else
if (score >= 90)
    Console.WriteLine("A Grade");
else if (score >= 80)
    Console.WriteLine("B Grade");
else if (score >= 70)
    Console.WriteLine("C Grade");
else
    Console.WriteLine("Fail");

// switch statement
string day = "Monday";
switch (day)
{
    case "Saturday":
    case "Sunday":
        Console.WriteLine("Weekend");
        break;
    default:
        Console.WriteLine("Weekday");
        break;
}

// switch expression (C# 8+)
string label = score switch
{
    >= 90 => "A",
    >= 80 => "B",
    >= 70 => "C",
    _     => "F"
};
```

### Loops
```csharp
// for loop
for (int i = 0; i < 5; i++)
    Console.Write($"{i} ");   // 0 1 2 3 4

// while loop
int count = 0;
while (count < 3)
{
    Console.WriteLine($"Count: {count}");
    count++;
}

// do-while — always executes at least once
int n = 5;
do
{
    Console.WriteLine(n--);
} while (n > 0);

// foreach — iterating collections
int[] numbers = {1, 2, 3, 4, 5};
foreach (int num in numbers)
    Console.Write($"{num} ");

// break and continue
for (int i = 0; i < 10; i++)
{
    if (i == 5) break;     // exit loop
    if (i % 2 == 0) continue; // skip even
    Console.Write($"{i} "); // 1 3
}
```

### Arrays
```csharp
// Declaration and initialization
int[] arr1 = new int[5];              // all zeros
int[] arr2 = {10, 20, 30, 40, 50};   // initializer
int[] arr3 = new int[] {1, 2, 3};

// Access
Console.WriteLine(arr2[0]);    // 10
Console.WriteLine(arr2.Length); // 5
arr2[2] = 99;

// Multidimensional
int[,] matrix = new int[3, 3];
matrix[0, 0] = 1;
int[,] grid = {{1,2,3},{4,5,6},{7,8,9}};
Console.WriteLine(grid[1, 2]);  // 6

// Jagged array (array of arrays)
int[][] jagged = new int[3][];
jagged[0] = new int[] {1, 2};
jagged[1] = new int[] {3, 4, 5};

// Array methods
Array.Sort(arr2);
Array.Reverse(arr2);
Console.WriteLine(Array.IndexOf(arr2, 30));
```

## Object-Oriented Programming

### Classes and Objects
```csharp
// Class definition
public class BankAccount
{
    // Fields (private by convention)
    private string _owner;
    private decimal _balance;

    // Constructor
    public BankAccount(string owner, decimal initialBalance)
    {
        _owner = owner;
        _balance = initialBalance;
    }

    // Properties (encapsulation)
    public string Owner => _owner;
    public decimal Balance => _balance;

    // Methods
    public void Deposit(decimal amount)
    {
        if (amount <= 0)
            throw new ArgumentException("Amount must be positive");
        _balance += amount;
    }

    public bool Withdraw(decimal amount)
    {
        if (amount > _balance) return false;
        _balance -= amount;
        return true;
    }

    // Override ToString
    public override string ToString() =>
        $"Account[{_owner}] Balance: ₹{_balance:N2}";
}

// Usage
var account = new BankAccount("Udit", 10000m);
account.Deposit(5000m);
account.Withdraw(2000m);
Console.WriteLine(account);   // Account[Udit] Balance: ₹13,000.00
```

### Properties and Access Modifiers
```csharp
public class Employee
{
    // Auto-implemented property
    public string Name { get; set; }

    // Read-only property
    public int Id { get; }

    // Computed property
    public string FullTitle => $"{Name} (ID: {Id})";

    // Property with validation
    private int _age;
    public int Age
    {
        get => _age;
        set
        {
            if (value < 18 || value > 65)
                throw new ArgumentOutOfRangeException("Age must be 18-65");
            _age = value;
        }
    }

    // init-only property (C# 9+)
    public string Department { get; init; }

    public Employee(int id, string name)
    {
        Id = id;
        Name = name;
    }
}

var emp = new Employee(1, "Priya") { Department = "Engineering" };
```

### Inheritance
```csharp
// Base class
public class Animal
{
    public string Name { get; set; }

    public Animal(string name) => Name = name;

    public virtual string Speak() => $"{Name} makes a sound";

    public override string ToString() => $"Animal: {Name}";
}

// Derived class
public class Dog : Animal
{
    public string Breed { get; set; }

    public Dog(string name, string breed) : base(name)
    {
        Breed = breed;
    }

    // Override
    public override string Speak() => $"{Name} says: Woof!";

    // New method specific to Dog
    public void Fetch() => Console.WriteLine($"{Name} fetches the ball!");
}

public class Cat : Animal
{
    public Cat(string name) : base(name) { }
    public override string Speak() => $"{Name} says: Meow!";
}

// Usage
Animal[] animals = {
    new Dog("Rex", "Labrador"),
    new Cat("Whiskers")
};
foreach (var a in animals)
    Console.WriteLine(a.Speak());   // Polymorphism at work
```

### Interfaces
```csharp
// Interface — defines a contract
public interface IPayable
{
    decimal CalculatePay();
    void ProcessPayment();
}

public interface IReportable
{
    string GenerateReport();
}

// Multiple interface implementation
public class SalaryEmployee : IPayable, IReportable
{
    public string Name { get; set; }
    public decimal MonthlySalary { get; set; }

    public decimal CalculatePay() => MonthlySalary;

    public void ProcessPayment() =>
        Console.WriteLine($"Paying {Name}: ₹{MonthlySalary:N0}");

    public string GenerateReport() =>
        $"Employee: {Name}, Salary: ₹{MonthlySalary:N0}/month";
}
```

### Abstract Classes
```csharp
public abstract class Shape
{
    public string Color { get; set; } = "Black";

    // Abstract — must be overridden
    public abstract double Area();
    public abstract double Perimeter();

    // Concrete — shared implementation
    public void Display() =>
        Console.WriteLine($"{GetType().Name}: Area={Area():F2}, Perimeter={Perimeter():F2}");
}

public class Circle : Shape
{
    private double _radius;
    public Circle(double radius) => _radius = radius;

    public override double Area() => Math.PI * _radius * _radius;
    public override double Perimeter() => 2 * Math.PI * _radius;
}

public class Rectangle : Shape
{
    private double _width, _height;
    public Rectangle(double w, double h) { _width = w; _height = h; }

    public override double Area() => _width * _height;
    public override double Perimeter() => 2 * (_width + _height);
}

// Usage
Shape[] shapes = { new Circle(5), new Rectangle(4, 6) };
foreach (var s in shapes)
    s.Display();
```

## Advanced Topics

### Generics
```csharp
// Generic class
public class Stack<T>
{
    private List<T> _items = new();

    public void Push(T item) => _items.Add(item);

    public T Pop()
    {
        if (_items.Count == 0)
            throw new InvalidOperationException("Stack is empty");
        var item = _items[^1];   // index from end
        _items.RemoveAt(_items.Count - 1);
        return item;
    }

    public T Peek() => _items[^1];
    public int Count => _items.Count;
}

// Generic method
public static T Max<T>(T a, T b) where T : IComparable<T>
    => a.CompareTo(b) >= 0 ? a : b;

// Generic constraints
public class Repository<T> where T : class, new()
{
    private List<T> _store = new();
    public void Add(T item) => _store.Add(item);
    public List<T> GetAll() => _store.ToList();
}
```

### Collections — List, Dictionary, HashSet
```csharp
// List<T>
var fruits = new List<string> { "Apple", "Banana", "Mango" };
fruits.Add("Orange");
fruits.Remove("Banana");
fruits.Insert(0, "Grapes");
Console.WriteLine(fruits.Count);          // 4
Console.WriteLine(fruits.Contains("Mango")); // true
fruits.Sort();

// Dictionary<TKey, TValue>
var scores = new Dictionary<string, int>
{
    ["Alice"] = 95,
    ["Bob"]   = 87,
    ["Carol"] = 92
};
scores["Dave"] = 78;
if (scores.TryGetValue("Alice", out int aliceScore))
    Console.WriteLine($"Alice: {aliceScore}");

foreach (var (name, score) in scores)
    Console.WriteLine($"{name}: {score}");

// HashSet<T> — unique elements
var tags = new HashSet<string> { "csharp", "dotnet", "azure" };
tags.Add("csharp");   // duplicate — ignored
Console.WriteLine(tags.Count);   // 3
```

### LINQ — Language Integrated Query
```csharp
var employees = new List<Employee>
{
    new() { Name="Alice", Age=30, Department="IT",      Salary=80000 },
    new() { Name="Bob",   Age=25, Department="Finance", Salary=60000 },
    new() { Name="Carol", Age=35, Department="IT",      Salary=95000 },
    new() { Name="Dave",  Age=28, Department="HR",      Salary=55000 },
};

// Where — filter
var itStaff = employees.Where(e => e.Department == "IT");

// Select — project/transform
var names = employees.Select(e => e.Name.ToUpper());

// OrderBy
var sorted = employees.OrderByDescending(e => e.Salary);

// GroupBy
var byDept = employees.GroupBy(e => e.Department);
foreach (var group in byDept)
{
    Console.WriteLine($"{group.Key}: {group.Count()} employees");
    Console.WriteLine($"  Avg salary: {group.Average(e => e.Salary):N0}");
}

// Aggregates
double avgSalary = employees.Average(e => e.Salary);
int maxSal = employees.Max(e => e.Salary);
int count = employees.Count(e => e.Age > 28);

// First, FirstOrDefault, Single
var alice = employees.FirstOrDefault(e => e.Name == "Alice");
var senior = employees.First(e => e.Age > 30);

// Any, All
bool anyIT = employees.Any(e => e.Department == "IT");
bool allPaid = employees.All(e => e.Salary > 40000);

// Query syntax (alternative)
var query = from e in employees
            where e.Department == "IT"
            orderby e.Salary descending
            select new { e.Name, e.Salary };
```

### Delegates, Func, Action
```csharp
// Delegate type
delegate int MathOperation(int a, int b);

// Named method
int Add(int a, int b) => a + b;

MathOperation op = Add;
Console.WriteLine(op(3, 4));   // 7

// Anonymous method
MathOperation mul = delegate(int a, int b) { return a * b; };

// Lambda expression
MathOperation sub = (a, b) => a - b;

// Func<TIn, TOut> — returns a value
Func<int, int, int> divide = (a, b) => a / b;

// Action<T> — void return
Action<string> log = msg => Console.WriteLine($"[LOG] {msg}");

// Predicate<T> — returns bool
Predicate<int> isEven = n => n % 2 == 0;
Console.WriteLine(isEven(4));   // true

// Multicast delegate
Action greet = () => Console.WriteLine("Hello");
greet += () => Console.WriteLine("World");
greet();   // Hello then World
```

### Async / Await
```csharp
using System.Net.Http;
using System.Text.Json;

// Async method — must return Task or Task<T>
public async Task<string> FetchDataAsync(string url)
{
    using var client = new HttpClient();
    string json = await client.GetStringAsync(url);
    return json;
}

// Calling async code
public async Task RunAsync()
{
    string data = await FetchDataAsync("https://api.example.com/data");
    Console.WriteLine(data);
}

// Task.WhenAll — parallel async
public async Task FetchMultipleAsync()
{
    var task1 = FetchDataAsync("url1");
    var task2 = FetchDataAsync("url2");
    string[] results = await Task.WhenAll(task1, task2);
}

// async Main (C# 7.1+)
static async Task Main(string[] args)
{
    await RunAsync();
}

// ConfigureAwait — library code
var result = await SomeAsync().ConfigureAwait(false);
```

### Exception Handling
```csharp
// try / catch / finally
try
{
    int[] arr = new int[3];
    arr[5] = 10;  // IndexOutOfRangeException
}
catch (IndexOutOfRangeException ex)
{
    Console.WriteLine($"Index error: {ex.Message}");
}
catch (Exception ex) when (ex.Message.Contains("critical"))
{
    // Exception filter
    Console.WriteLine("Critical error");
    throw;   // re-throw
}
finally
{
    Console.WriteLine("Always runs");
}

// Custom exception
public class InsufficientFundsException : Exception
{
    public decimal Amount { get; }

    public InsufficientFundsException(decimal amount)
        : base($"Insufficient funds. Requested: {amount:C}")
    {
        Amount = amount;
    }
}

// throw expression (C# 7+)
string name = input ?? throw new ArgumentNullException(nameof(input));
```

### Records and Tuples (C# 9+)
```csharp
// Record — immutable value object
public record Point(double X, double Y);

var p1 = new Point(1.0, 2.0);
var p2 = new Point(1.0, 2.0);
Console.WriteLine(p1 == p2);    // true — value equality
Console.WriteLine(p1);          // Point { X = 1, Y = 2 }

// with expression — non-destructive mutation
var p3 = p1 with { X = 5.0 };  // new Point(5.0, 2.0)

// Tuple
(string Name, int Age) person = ("Udit", 28);
Console.WriteLine(person.Name);
Console.WriteLine(person.Age);

var (n, a) = person;   // deconstruction

// ValueTuple in methods
(int Min, int Max) GetRange(int[] data) =>
    (data.Min(), data.Max());
```

### Pattern Matching (C# 8-12)
```csharp
object shape = new Circle(5);

// Type pattern
if (shape is Circle c)
    Console.WriteLine($"Circle with radius {c.Radius}");

// switch expression with patterns
string Describe(object obj) => obj switch
{
    int n when n > 0    => $"Positive int: {n}",
    int n when n < 0    => $"Negative int: {n}",
    string s            => $"String: {s}",
    null                => "null value",
    _                   => "Something else"
};

// Property pattern
string GetDiscount(Customer c) => c switch
{
    { Age: < 18 }              => "Student 20%",
    { IsPremium: true, Age: >= 60 } => "Senior Premium 35%",
    { IsPremium: true }        => "Premium 15%",
    _                          => "Standard 0%"
};

// List pattern (C# 11+)
int[] arr = {1, 2, 3, 4, 5};
if (arr is [1, 2, ..])
    Console.WriteLine("Starts with 1, 2");
```

## Interview Preparation

### C# Interview Questions — Top 50

**Fundamentals:**

**Q1. What is the difference between `==` and `.Equals()` for strings?**
`==` is overloaded for strings to compare value (content). `.Equals()` also compares value but can handle null safely and supports `StringComparison`. For reference types other than string, `==` compares references.

**Q2. What is boxing and unboxing?**
Boxing = converting a value type to `object` (stored on heap). Unboxing = extracting the value back. Both have performance overhead. LINQ and collections with `object` type can cause implicit boxing.
```csharp
int n = 42;
object boxed = n;         // boxing
int unboxed = (int)boxed; // unboxing
```

**Q3. Difference between `ref` and `out` parameters?**
- `ref`: caller must initialize before passing; method can read and write
- `out`: caller need not initialize; method MUST write before returning
```csharp
void Ref(ref int x)  { x += 10; }     // reads existing value
void Out(out int x)  { x = 100; }     // must assign
```

**Q4. What is `IDisposable` and `using`?**
`IDisposable` defines `Dispose()` to release unmanaged resources (files, connections). `using` statement guarantees `Dispose()` is called even if an exception occurs.
```csharp
using var conn = new SqlConnection(connStr);
conn.Open(); // Dispose called automatically at end of block
```

**Q5. What are extension methods?**
Static methods that appear as instance methods on existing types. Must be in a static class. First parameter preceded by `this`.
```csharp
public static class StringExtensions
{
    public static bool IsEmail(this string s) =>
        s.Contains('@') && s.Contains('.');
}
// Usage:
"user@example.com".IsEmail()  // true
```

**Q6. What is the difference between `IEnumerable<T>` and `IQueryable<T>`?**
- `IEnumerable<T>`: In-memory, LINQ executes locally (LINQ to Objects)
- `IQueryable<T>`: Deferred/translated query (e.g., LINQ to SQL — query runs on DB server)

**Q7. What are sealed classes?**
`sealed` prevents inheritance. `sealed override` prevents further overriding of a specific method.
```csharp
public sealed class Logger { }  // cannot be derived
```

**Q8. Explain the difference between `abstract` and `virtual`?**
- `virtual`: has a default implementation; can be overridden
- `abstract`: no implementation; MUST be overridden; only in abstract classes

**Q9. What is `static` in C#?**
`static` members belong to the type, not instances. `static class` = only static members, cannot be instantiated. `static constructor` = runs once before first use.

**Q10. What is `Nullable<T>` and the `?.` operator?**
`Nullable<T>` (or `T?`) allows value types to represent null. `?.` (null-conditional) short-circuits to null instead of throwing `NullReferenceException`.

**OOP:**

**Q11. What are the 4 pillars of OOP?**
1. **Encapsulation** — hiding implementation behind properties/methods
2. **Inheritance** — deriving classes from base classes
3. **Polymorphism** — same interface, different behavior (override)
4. **Abstraction** — exposing only essential details (abstract/interface)

**Q12. What is the difference between an interface and abstract class?**

| Feature | Interface | Abstract Class |
|---------|-----------|----------------|
| Multiple inheritance | Yes | No |
| Constructor | No | Yes |
| Fields | No | Yes |
| Default implementation | Yes (C# 8+) | Yes |
| Access modifiers | Public only (before C# 8) | Any |

**Q13. What is method hiding vs overriding?**
- **Overriding** (`virtual` + `override`): Runtime polymorphism — base reference calls derived method
- **Hiding** (`new` keyword): Compile-time — base reference calls base method

**Advanced:**

**Q14. What are delegates and events?**
Delegates are type-safe function pointers. Events are encapsulated delegates — subscribers add handlers with `+=`.
```csharp
public event EventHandler<OrderArgs> OrderPlaced;
```

**Q15. What is `async`/`await` and how does it work?**
`async`/`await` is syntactic sugar over Tasks and state machines. The compiler transforms an async method into a state machine. `await` suspends the method (without blocking the thread) until the awaited Task completes.

**Q16. What is the difference between `Task.Run` and `async/await`?**
- `Task.Run`: Offloads CPU-bound work to a thread pool thread
- `async/await`: For I/O-bound operations — no thread is blocked while waiting

**Q17. What is LINQ deferred execution?**
LINQ queries are not executed when defined — they execute when iterated (foreach, ToList(), Count(), etc.). This allows query composition.

**Q18. What are records in C# 9?**
Immutable reference types with value equality, `ToString()`, and deconstruction built-in. Created with positional parameters. Ideal for DTOs and data models.

**Q19. What is the `Span<T>` type?**
`Span<T>` is a ref struct that represents a contiguous region of memory without allocation. Used for high-performance scenarios (parsing, slicing arrays) — no heap allocation.

**Q20. What is the difference between deep copy and shallow copy?**
- **Shallow copy**: copies object references (both point to same nested objects)
- **Deep copy**: copies everything recursively — completely independent copy
Implement via `IClonable`, custom method, or serialization.

**Q21. What is dependency injection?**
A design pattern where dependencies are provided to a class rather than created inside it. Promotes loose coupling, testability. In .NET: `IServiceCollection` + `AddSingleton/Scoped/Transient`.

**Q22. What is the difference between Singleton, Scoped, and Transient lifetimes?**
- **Singleton**: One instance per application
- **Scoped**: One instance per HTTP request
- **Transient**: New instance every time requested

**Q23. What are design patterns commonly used in C#?**
- **Repository**: Abstracts data access
- **Factory**: Creates objects without specifying exact class
- **Observer**: Event-driven (publisher/subscriber)
- **Strategy**: Interchangeable algorithms
- **Decorator**: Adds behavior without modifying class

**Q24. What is ConcurrentDictionary vs Dictionary?**
`ConcurrentDictionary` is thread-safe for concurrent read/write without external locking. `Dictionary` is not thread-safe.

**Q25. What is `yield return`?**
Creates an iterator — lazily generates values one at a time without building a full collection:
```csharp
IEnumerable<int> GetEvens(int max)
{
    for (int i = 0; i <= max; i += 2)
        yield return i;
}
```
