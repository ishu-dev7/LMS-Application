## SQL Fundamentals

### Introduction to SQL and Databases
SQL (Structured Query Language) is the standard language for managing relational databases. It lets you create, read, update, and delete data (CRUD) in a structured, tabular format.

**Key concepts:**
- **Table**: stores data in rows and columns (like a spreadsheet)
- **Row**: a single record
- **Column**: an attribute (has a fixed data type)
- **Primary Key**: uniquely identifies each row
- **Foreign Key**: references a primary key in another table
- **Schema**: the structure/design of the database

**Popular SQL databases:**
- PostgreSQL — open-source, feature-rich, ACID-compliant
- MySQL / MariaDB — widely used for web apps
- SQL Server (MSSQL) — Microsoft's enterprise database
- SQLite — embedded, file-based, no server needed
- Oracle Database — enterprise, widely used in banking/ERP

### Creating Tables (DDL)
```sql
-- Create a database
CREATE DATABASE nexora_db;

-- Create tables
CREATE TABLE categories (
    id          SERIAL PRIMARY KEY,          -- auto-increment in PostgreSQL
    name        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE products (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(200) NOT NULL,
    price       DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    stock       INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    category_id INT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    is_active   BOOLEAN DEFAULT TRUE,
    created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE customers (
    id           SERIAL PRIMARY KEY,
    email        VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    city         VARCHAR(100),
    created_at   TIMESTAMP DEFAULT NOW()
);

CREATE TABLE orders (
    id          SERIAL PRIMARY KEY,
    customer_id INT NOT NULL REFERENCES customers(id),
    total       DECIMAL(12, 2) NOT NULL,
    status      VARCHAR(20) DEFAULT 'pending',
    created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE order_items (
    id         SERIAL PRIMARY KEY,
    order_id   INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id),
    quantity   INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10, 2) NOT NULL
);

-- Modify table
ALTER TABLE products ADD COLUMN weight_kg DECIMAL(8,3);
ALTER TABLE products ALTER COLUMN name TYPE VARCHAR(500);
ALTER TABLE products DROP COLUMN weight_kg;

-- Drop table
DROP TABLE IF EXISTS order_items;
```

### Inserting Data (DML)
```sql
-- Single row insert
INSERT INTO categories (name, description)
VALUES ('Electronics', 'Electronic devices and accessories');

-- Multiple rows
INSERT INTO categories (name) VALUES
    ('Clothing'),
    ('Books'),
    ('Sports');

-- Insert from SELECT
INSERT INTO archive_orders (customer_id, total, created_at)
SELECT customer_id, total, created_at
FROM orders
WHERE status = 'completed' AND created_at < '2024-01-01';

-- Insert with RETURNING (PostgreSQL)
INSERT INTO customers (email, display_name, city)
VALUES ('udit@example.com', 'Udit Sharma', 'Mumbai')
RETURNING id, email;
```

### SELECT — Querying Data
```sql
-- Basic SELECT
SELECT * FROM products;
SELECT name, price, stock FROM products;

-- Column aliases
SELECT name AS product_name,
       price AS unit_price,
       price * 0.18 AS gst
FROM products;

-- Filtering with WHERE
SELECT * FROM products WHERE price > 500;
SELECT * FROM products WHERE stock = 0;
SELECT * FROM products WHERE name LIKE 'iPhone%';   -- starts with iPhone
SELECT * FROM products WHERE name ILIKE '%phone%';  -- case-insensitive (PG)
SELECT * FROM products WHERE price BETWEEN 100 AND 1000;
SELECT * FROM products WHERE category_id IN (1, 2, 3);
SELECT * FROM products WHERE description IS NOT NULL;
SELECT * FROM products WHERE stock = 0 OR is_active = FALSE;

-- Sorting
SELECT name, price FROM products ORDER BY price DESC;
SELECT name, price FROM products ORDER BY price DESC, name ASC;

-- Limiting results
SELECT * FROM products ORDER BY created_at DESC LIMIT 10 OFFSET 20;
```

### UPDATE and DELETE
```sql
-- Update
UPDATE products
SET price = price * 1.10,
    is_active = TRUE
WHERE category_id = 1;

UPDATE products
SET stock = 0
WHERE id = 42;

-- Delete
DELETE FROM products WHERE stock = 0 AND is_active = FALSE;

-- Truncate — delete all rows (faster than DELETE)
TRUNCATE TABLE order_items;
```

## Joins — Combining Tables

### INNER JOIN
Returns only rows with matching data in both tables:
```sql
-- Products with their category names
SELECT p.id, p.name, p.price, c.name AS category
FROM products p
INNER JOIN categories c ON p.category_id = c.id;

-- Orders with customer info
SELECT o.id, o.total, o.status,
       c.display_name, c.email
FROM orders o
INNER JOIN customers c ON o.customer_id = c.id;

-- Multi-table join: order details
SELECT o.id AS order_id,
       c.display_name AS customer,
       p.name AS product,
       oi.quantity,
       oi.unit_price,
       oi.quantity * oi.unit_price AS line_total
FROM orders o
JOIN customers c ON o.customer_id = c.id
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON oi.product_id = p.id
ORDER BY o.id, p.name;
```

### LEFT JOIN, RIGHT JOIN, FULL OUTER JOIN
```sql
-- LEFT JOIN — all customers, even those with no orders
SELECT c.display_name, COUNT(o.id) AS order_count
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
GROUP BY c.id, c.display_name
ORDER BY order_count DESC;

-- Find customers with NO orders
SELECT c.display_name, c.email
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
WHERE o.id IS NULL;

-- FULL OUTER JOIN — all rows from both sides (nulls where no match)
SELECT c.name AS category, COUNT(p.id) AS product_count
FROM categories c
FULL OUTER JOIN products p ON p.category_id = c.id
GROUP BY c.id, c.name;
```

### Self Join and Cross Join
```sql
-- SELF JOIN — employee hierarchy (manager references employee table)
SELECT e.display_name AS employee,
       m.display_name AS manager
FROM employees e
LEFT JOIN employees m ON e.manager_id = m.id;

-- CROSS JOIN — every combination (cartesian product)
SELECT s.size, c.color
FROM sizes s
CROSS JOIN colors c;
```

## Aggregate Functions and GROUP BY

### Aggregates
```sql
-- COUNT, SUM, AVG, MIN, MAX
SELECT COUNT(*)                    AS total_products,
       COUNT(DISTINCT category_id) AS categories_used,
       AVG(price)                  AS avg_price,
       MIN(price)                  AS cheapest,
       MAX(price)                  AS most_expensive,
       SUM(price * stock)          AS total_inventory_value
FROM products
WHERE is_active = TRUE;

-- GROUP BY — aggregates per group
SELECT c.name AS category,
       COUNT(p.id)     AS product_count,
       AVG(p.price)    AS avg_price,
       SUM(p.stock)    AS total_stock
FROM products p
JOIN categories c ON p.category_id = c.id
GROUP BY c.id, c.name
ORDER BY product_count DESC;

-- HAVING — filter on aggregate result
SELECT c.name, COUNT(p.id) AS product_count
FROM products p
JOIN categories c ON p.category_id = c.id
GROUP BY c.id, c.name
HAVING COUNT(p.id) > 5
ORDER BY product_count DESC;

-- Monthly revenue
SELECT DATE_TRUNC('month', created_at) AS month,
       COUNT(*)         AS order_count,
       SUM(total)       AS revenue,
       AVG(total)       AS avg_order_value
FROM orders
WHERE status = 'completed'
GROUP BY DATE_TRUNC('month', created_at)
ORDER BY month DESC;
```

## Subqueries and CTEs

### Subqueries
```sql
-- Scalar subquery
SELECT name, price,
       (SELECT AVG(price) FROM products) AS avg_price,
       price - (SELECT AVG(price) FROM products) AS diff_from_avg
FROM products;

-- Subquery in WHERE
SELECT name, price FROM products
WHERE price > (SELECT AVG(price) FROM products);

-- IN with subquery — customers who ordered a specific product
SELECT DISTINCT c.display_name, c.email
FROM customers c
WHERE c.id IN (
    SELECT o.customer_id
    FROM orders o
    JOIN order_items oi ON oi.order_id = o.id
    WHERE oi.product_id = 42
);

-- EXISTS — often faster than IN
SELECT c.display_name
FROM customers c
WHERE EXISTS (
    SELECT 1 FROM orders o
    WHERE o.customer_id = c.id AND o.total > 10000
);

-- Correlated subquery — references outer query
SELECT p.name, p.price,
       (SELECT COUNT(*) FROM order_items oi WHERE oi.product_id = p.id) AS times_ordered
FROM products p
ORDER BY times_ordered DESC
LIMIT 10;
```

### Common Table Expressions (CTEs)
```sql
-- Basic CTE — cleaner than nested subquery
WITH high_value_orders AS (
    SELECT o.*, c.display_name AS customer_name
    FROM orders o
    JOIN customers c ON o.customer_id = c.id
    WHERE o.total > 5000
)
SELECT customer_name, COUNT(*) AS order_count, SUM(total) AS total_spent
FROM high_value_orders
GROUP BY customer_name
ORDER BY total_spent DESC;

-- Multiple CTEs
WITH
monthly_revenue AS (
    SELECT DATE_TRUNC('month', created_at) AS month,
           SUM(total) AS revenue
    FROM orders WHERE status = 'completed'
    GROUP BY 1
),
ranked AS (
    SELECT month, revenue,
           LAG(revenue) OVER (ORDER BY month) AS prev_month,
           revenue - LAG(revenue) OVER (ORDER BY month) AS growth
    FROM monthly_revenue
)
SELECT month, revenue, prev_month,
       ROUND((growth / NULLIF(prev_month, 0)) * 100, 2) AS growth_pct
FROM ranked
ORDER BY month DESC;

-- Recursive CTE — hierarchy traversal
WITH RECURSIVE category_tree AS (
    -- Base case
    SELECT id, name, parent_id, 0 AS depth, name AS path
    FROM categories WHERE parent_id IS NULL

    UNION ALL

    -- Recursive case
    SELECT c.id, c.name, c.parent_id,
           ct.depth + 1,
           ct.path || ' > ' || c.name
    FROM categories c
    JOIN category_tree ct ON c.parent_id = ct.id
)
SELECT depth, path FROM category_tree ORDER BY path;
```

## Window Functions

### RANK, ROW_NUMBER, DENSE_RANK
```sql
-- Rank products by price within each category
SELECT name, category_id, price,
       ROW_NUMBER()   OVER (PARTITION BY category_id ORDER BY price DESC) AS row_num,
       RANK()         OVER (PARTITION BY category_id ORDER BY price DESC) AS rank,
       DENSE_RANK()   OVER (PARTITION BY category_id ORDER BY price DESC) AS dense_rank
FROM products;

-- Top 3 products per category
WITH ranked AS (
    SELECT name, category_id, price,
           RANK() OVER (PARTITION BY category_id ORDER BY price DESC) AS rnk
    FROM products
)
SELECT * FROM ranked WHERE rnk <= 3;
```

### Running Totals and Moving Averages
```sql
-- Running total of revenue by month
SELECT month, revenue,
       SUM(revenue) OVER (ORDER BY month) AS running_total,
       AVG(revenue) OVER (ORDER BY month ROWS BETWEEN 2 PRECEDING AND CURRENT ROW) AS moving_avg_3m
FROM monthly_revenue;

-- LAG and LEAD — compare to adjacent rows
SELECT customer_id, total, created_at,
       LAG(total, 1, 0) OVER (PARTITION BY customer_id ORDER BY created_at) AS prev_order,
       LEAD(total)      OVER (PARTITION BY customer_id ORDER BY created_at) AS next_order
FROM orders;

-- NTILE — divide into N buckets
SELECT name, price,
       NTILE(4) OVER (ORDER BY price) AS price_quartile
FROM products;
```

## Indexes and Performance

### Index Types
```sql
-- B-tree index (default) — great for equality, range, ORDER BY
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_category ON products(category_id);

-- Composite index — for queries filtering on multiple columns
CREATE INDEX idx_orders_customer_status ON orders(customer_id, status);

-- Unique index
CREATE UNIQUE INDEX idx_customers_email ON customers(email);

-- Partial index — only index a subset of rows
CREATE INDEX idx_active_products ON products(name) WHERE is_active = TRUE;

-- Index on expression
CREATE INDEX idx_email_lower ON customers(LOWER(email));

-- Drop index
DROP INDEX IF EXISTS idx_products_price;

-- Find unused indexes (PostgreSQL)
SELECT indexname, idx_scan FROM pg_stat_user_indexes
WHERE idx_scan = 0 ORDER BY schemaname, tablename;
```

### EXPLAIN ANALYZE — Understanding Query Plans
```sql
EXPLAIN ANALYZE
SELECT p.name, c.name AS category
FROM products p
JOIN categories c ON p.category_id = c.id
WHERE p.price > 500
ORDER BY p.price DESC
LIMIT 20;

-- Look for:
-- Seq Scan (bad on large tables) vs Index Scan (good)
-- Nested Loop / Hash Join / Merge Join
-- cost=start..total (lower is better)
-- actual time=...
-- rows= (estimate vs actual — big difference means stale stats)
```

### Query Optimization Tips
```sql
-- Bad: function on indexed column prevents index use
SELECT * FROM customers WHERE LOWER(email) = 'user@example.com';
-- Better: use functional index or store email lowercase

-- Bad: SELECT * on large tables
SELECT * FROM orders;
-- Good: select only needed columns
SELECT id, customer_id, total FROM orders WHERE status = 'pending';

-- Bad: OR on different columns
SELECT * FROM products WHERE name = 'X' OR price = 100;
-- Good: UNION ALL (each branch can use its index)
SELECT * FROM products WHERE name = 'X'
UNION ALL
SELECT * FROM products WHERE price = 100;

-- Bad: Correlated subquery running for every row
SELECT p.name, (SELECT COUNT(*) FROM order_items WHERE product_id = p.id)
FROM products;
-- Good: LEFT JOIN with GROUP BY or window function
SELECT p.name, COUNT(oi.id) AS order_count
FROM products p
LEFT JOIN order_items oi ON oi.product_id = p.id
GROUP BY p.id, p.name;
```

## Transactions and ACID

### Transaction Control
```sql
-- Begin transaction
BEGIN;  -- or START TRANSACTION;

UPDATE accounts SET balance = balance - 1000 WHERE id = 1;
UPDATE accounts SET balance = balance + 1000 WHERE id = 2;

-- If something went wrong:
ROLLBACK;

-- If all good:
COMMIT;

-- Savepoints — partial rollback
BEGIN;
UPDATE products SET price = price * 1.1;
SAVEPOINT before_discount;
UPDATE products SET price = price * 0.9 WHERE category_id = 1;
-- Oops:
ROLLBACK TO SAVEPOINT before_discount;
COMMIT;

-- Isolation levels
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;  -- default
SET TRANSACTION ISOLATION LEVEL REPEATABLE READ;
SET TRANSACTION ISOLATION LEVEL SERIALIZABLE;   -- strongest, prevents phantom reads
```

## Interview Preparation

### SQL Interview Questions

**Q1. What is the difference between INNER JOIN and LEFT JOIN?**
INNER JOIN returns only rows with matching records in both tables. LEFT JOIN returns all rows from the left table, with NULLs for unmatched rows from the right table.

**Q2. What is the difference between WHERE and HAVING?**
`WHERE` filters rows before aggregation. `HAVING` filters groups after `GROUP BY`. `WHERE` cannot use aggregate functions; `HAVING` can.

**Q3. What is a subquery vs CTE?**
Both allow embedding queries. CTEs (WITH clause) are more readable, reusable within the query, and enable recursion. Subqueries can be inline (in FROM/WHERE). CTEs don't always materialize — it depends on the database.

**Q4. What is an index and when should you use it?**
An index is a separate data structure that speeds up lookups. Use on frequently queried columns (WHERE, JOIN, ORDER BY). Avoid on frequently updated columns (index needs updating on every write). Too many indexes slow down inserts/updates.

**Q5. What is the difference between RANK() and DENSE_RANK()?**
If two rows tie for rank 2: RANK gives 2, 2, 4 (skips 3). DENSE_RANK gives 2, 2, 3 (no gap). ROW_NUMBER always gives unique numbers regardless of ties.

**Q6. What is a primary key vs unique key?**
Primary key: NOT NULL + UNIQUE, only one per table, often used as the clustered index. Unique key: can have one NULL (in most databases), multiple per table.

**Q7. What is normalization? Explain 1NF, 2NF, 3NF.**
- **1NF**: Each column has atomic values, no repeating groups
- **2NF**: 1NF + no partial dependency (non-key columns depend on entire key)
- **3NF**: 2NF + no transitive dependency (non-key columns depend only on the key)

**Q8. What are ACID properties?**
- **Atomicity**: All or nothing (transaction fully succeeds or fully rolls back)
- **Consistency**: Data always in a valid state (constraints enforced)
- **Isolation**: Concurrent transactions don't see each other's intermediate state
- **Durability**: Committed data survives crashes (written to disk)

**Q9. What is the N+1 query problem?**
Fetching a list then running a separate query for each item (1 + N queries). Solved by JOINs, eager loading, or batch queries.

**Q10. How do you find duplicate rows?**
```sql
SELECT email, COUNT(*) AS cnt
FROM customers
GROUP BY email
HAVING COUNT(*) > 1;
```

**Q11. How do you find the second highest salary?**
```sql
SELECT MAX(salary) FROM employees WHERE salary < (SELECT MAX(salary) FROM employees);
-- Or with DENSE_RANK:
SELECT salary FROM (
    SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk FROM employees
) t WHERE rnk = 2;
```

**Q12. What is a VIEW?**
A named, stored SELECT query. Virtual table — no data is stored. Simplifies complex queries, provides row/column level security. Materialized views (PostgreSQL, Oracle) store the result physically for performance.

**Q13. What is the difference between TRUNCATE and DELETE?**
TRUNCATE removes all rows, resets auto-increment, cannot be rolled back (in most DBs), no WHERE clause. DELETE can be filtered, is logged row-by-row, can be rolled back.

**Q14. What is a stored procedure vs a function?**
Both are precompiled SQL blocks. Function: must return a value, can be used in SELECT. Procedure: can return multiple result sets, used with EXEC, can have output parameters.

**Q15. Explain deadlock and how to prevent it.**
Deadlock: two transactions each holding a lock the other needs, both wait forever. Prevention: always acquire locks in the same order, use timeouts, keep transactions short, use optimistic locking (versioning).
