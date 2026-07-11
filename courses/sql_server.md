# SQL Server — Complete Course with Interview Prep

Microsoft SQL Server is the enterprise relational database you'll meet behind most .NET systems. This course goes from tables and joins to the topics that decide interviews — indexes, execution plans, transactions and isolation — and closes with a full T-SQL interview module.

## 1. Fundamentals — Tables, Types & Design

### 1.1 Relational basics done properly

- A **table** models one entity; each row is one instance; the **primary key (PK)** uniquely identifies a row.
- **Foreign keys (FK)** enforce relationships (an OrderLine's OrderId must exist in Orders) — referential integrity in the engine, not just in app code.
- **Constraints** are your first line of data quality: `NOT NULL`, `UNIQUE`, `CHECK (Price >= 0)`, `DEFAULT`. A database that relies on the app to keep data clean eventually has dirty data.

### 1.2 Data types that matter (and the classic mistakes)

- Strings: `VARCHAR(n)` (ASCII) vs `NVARCHAR(n)` (Unicode, 2 bytes/char — needed for Indian-language text). `NVARCHAR(MAX)` for long text — but not for everything; MAX columns hurt indexing and memory grants.
- Numbers: `INT`/`BIGINT`; `DECIMAL(p,s)` for money (never `FLOAT` — binary floating point can't represent 0.1 exactly; financial rounding bugs are an interview staple).
- Dates: `DATE`, `DATETIME2` (use it over legacy `DATETIME` — better precision/range), `DATETIMEOFFSET` when timezone matters.
- `UNIQUEIDENTIFIER` (GUID) keys: globally unique and merge-friendly, but random ones fragment clustered indexes — use `NEWSEQUENTIALID()` or sequential GUIDs if they must be clustered.

### 1.3 Normalization — and when to stop

- **1NF:** atomic columns, no repeating groups. **2NF:** non-key columns depend on the whole key. **3NF:** non-key columns depend on nothing but the key ("the key, the whole key, and nothing but the key").
- Normalization removes update anomalies and duplication. **Denormalization** is a deliberate, measured trade for read performance (reporting tables, cached aggregates) — the interview answer is "normalize by default, denormalize with evidence."

## 2. Querying — Joins to Window Functions

### 2.1 Joins — know them cold

- `INNER JOIN` — only matching rows.
- `LEFT JOIN` — all left rows, NULLs where no match (find-missing pattern: `LEFT JOIN ... WHERE right.Id IS NULL`).
- `RIGHT JOIN` (rare — rewrite as LEFT), `FULL OUTER JOIN` (both sides, matched where possible), `CROSS JOIN` (Cartesian product — deliberate only).
- The classic trap: putting a right-table filter in `WHERE` after a LEFT JOIN turns it into an INNER JOIN (`WHERE r.Status = 'X'` removes the NULL rows) — filter the right side in the `ON` clause instead.

### 2.2 Aggregation

`GROUP BY` collapses rows; aggregates (`SUM`, `COUNT`, `AVG`, `MIN/MAX`) summarize each group; `HAVING` filters *groups* (WHERE filters rows *before* grouping — the difference is a guaranteed interview question). `COUNT(*)` counts rows; `COUNT(col)` skips NULLs; `COUNT(DISTINCT col)` counts unique values.

### 2.3 Subqueries, CTEs and EXISTS

- **CTEs** (`WITH cte AS (...)`) name intermediate results — readable multi-step queries; **recursive CTEs** walk hierarchies (org charts, categories).
- `EXISTS (SELECT 1 ...)` tests for matches and can short-circuit — usually the right tool over `IN (subquery)`; and beware `NOT IN` with NULLs in the subquery: it returns *no rows at all* (three-valued logic) — use `NOT EXISTS`.
- NULL logic generally: `NULL = NULL` is not true; use `IS NULL`; `WHERE col <> 'x'` silently drops NULL rows.

### 2.4 Window functions — modern SQL fluency

Aggregates *without* collapsing rows — `OVER (PARTITION BY ... ORDER BY ...)`:

```sql
SELECT TraderId, TradeDate, PnL,
       SUM(PnL)     OVER (PARTITION BY TraderId ORDER BY TradeDate) AS RunningPnL,
       ROW_NUMBER() OVER (PARTITION BY TraderId ORDER BY PnL DESC)  AS RankInTrader
FROM Trades;
```

- `ROW_NUMBER` (unique sequence) vs `RANK` (ties share rank, gaps) vs `DENSE_RANK` (ties, no gaps) — the trio interviewers love.
- Top-N-per-group: ROW_NUMBER in a CTE, filter `rn = 1`. `LAG`/`LEAD` for previous/next row comparisons (day-over-day change).

## 3. Programmability — Procs, Transactions & Integrity

### 3.1 Stored procedures, functions, triggers

- **Stored procedures** encapsulate multi-statement logic server-side: parameterized (injection-safe by construction), one round trip, cached plans. Cons: business logic split across tiers, harder version control/testing — know both sides.
- **Functions:** scalar UDFs (historically slow — row-by-row; SQL 2019 inlines some) and **inline table-valued functions** (fast — expanded into the query like a parameterized view). Prefer iTVFs.
- **Triggers** run automatically on DML — auditing, denormalized maintenance. Dangerous when they hide logic or cascade; use sparingly and mention `inserted`/`deleted` pseudo-tables.
- **Views** = named queries (simplification, security surface); **indexed views** materialize results for heavy aggregation reads.

### 3.2 Transactions and ACID

`BEGIN TRAN ... COMMIT/ROLLBACK` makes multiple statements atomic. ACID: **Atomicity** (all or nothing), **Consistency** (constraints hold), **Isolation** (concurrent transactions don't see each other's partial work), **Durability** (committed = survives crash, via write-ahead logging). Error handling pattern: `BEGIN TRY ... BEGIN CATCH` + `XACT_STATE()` + rollback + `THROW`.

### 3.3 Isolation levels and locking

Concurrency problems: **dirty read** (seeing uncommitted data), **non-repeatable read** (row changes between two reads), **phantom** (new rows appear). Levels trade correctness vs concurrency:

- `READ UNCOMMITTED` — allows dirty reads (and NOLOCK is the same hint, with the same risks: wrong totals, skipped/duplicate rows during page splits).
- `READ COMMITTED` — default; no dirty reads.
- `REPEATABLE READ` — read rows can't change under you.
- `SERIALIZABLE` — full correctness, heaviest blocking.
- **Snapshot / RCSI (Read Committed Snapshot):** readers see a row-versioned snapshot in tempdb — readers stop blocking writers; the modern default posture for OLTP (Azure SQL enables RCSI by default).

**Deadlocks:** two sessions each holding what the other wants; SQL Server kills the cheaper victim (error 1205). Prevention: touch tables in a consistent order, keep transactions short, index so locks are narrow; handle 1205 with a retry.

## 4. Performance — Indexes & Execution Plans

### 4.1 Indexes — the highest-yield topic in the course

- **Clustered index** = the table itself, physically ordered by the key (one per table; usually the PK; want it narrow, static, ever-increasing — hence `INT IDENTITY` love).
- **Nonclustered indexes** = separate sorted structures of (key columns → row locator). Each speeds specific reads and taxes every write.
- **Covering index:** `INCLUDE` columns so the query is satisfied entirely from the index — eliminates **key lookups** (the plan operator that murders performance when a seek must fetch thousands of rows from the base table).
- **SARGability:** predicates must leave the column bare for index seeks. `WHERE YEAR(OrderDate) = 2026` scans; `WHERE OrderDate >= '2026-01-01' AND OrderDate < '2027-01-01'` seeks. Leading wildcards (`LIKE '%x'`), functions on columns, implicit conversions (NVARCHAR parameter vs VARCHAR column) all kill seeks — each of these is a standard interview scenario.
- Composite index column order matters: the index serves predicates on a *leading prefix* of its columns.

### 4.2 Reading execution plans

The skill: get the actual plan and look for — **scan vs seek** on large tables, **key lookups** with high row counts, **big discrepancies between estimated and actual rows** (statistics problems → update stats), expensive **sorts/hash operations** (missing index or missing ORDER BY support), and **implicit conversion warnings**. Say "I read the plan" rather than "I add indexes until it's fast."

### 4.3 The usual suspects checklist

Parameter sniffing (a cached plan optimized for unrepresentative parameters — fixes: `OPTION (RECOMPILE)`, parameter-sensitive plan features in 2022+), missing/fragmented statistics, `SELECT *` dragging columns that break covering, row-by-row cursors/UDFs where set-based SQL works, and transactions held open across user think-time.

## 5. Interview Preparation — Questions & Answers

### 5.1 Basic level Q&A

**Q1. PRIMARY KEY vs UNIQUE constraint?**
Both enforce uniqueness. PK: one per table, no NULLs, and by default becomes the clustered index. UNIQUE: many per table, allows a single NULL, nonclustered by default. Both create indexes and can be FK targets.

**Q2. WHERE vs HAVING?**
WHERE filters rows *before* grouping; HAVING filters groups *after* aggregation. `WHERE Status='Paid' GROUP BY CustomerId HAVING SUM(Amount) > 10000` — you can't put the SUM condition in WHERE because it doesn't exist until grouping.

**Q3. DELETE vs TRUNCATE vs DROP?**
DELETE: row-by-row, WHERE-able, fires triggers, fully logged, keeps identity. TRUNCATE: deallocates pages, no WHERE, no per-row triggers, resets identity, minimally logged (still transactional and rollback-able — the "can't rollback truncate" myth is a trap). DROP removes the object entirely.

**Q4. Explain the join types with the LEFT JOIN filter trap.**
INNER: matches only. LEFT: all left rows + NULLs for no-match. FULL: both. CROSS: Cartesian. Trap: after `LEFT JOIN r`, writing `WHERE r.Col = 'x'` eliminates the NULL rows — silently becoming an INNER JOIN; the filter belongs in the `ON` clause to preserve left rows.

**Q5. What does NULL do to comparisons and NOT IN?**
NULL compares as UNKNOWN: `= NULL` never true (use IS NULL); `<> 'x'` drops NULL rows. `NOT IN (subquery)` returns zero rows if the subquery yields any NULL — use NOT EXISTS, which handles NULLs sanely and short-circuits.

**Q6. UNION vs UNION ALL?**
UNION deduplicates (requires a sort/hash — costs performance); UNION ALL concatenates as-is. Default to UNION ALL unless you specifically need dedup — a small answer that signals performance awareness.

**Q7. Clustered vs nonclustered index?**
Clustered = the table's physical order (one per table; the leaf level *is* the data). Nonclustered = separate structure mapping key columns to row locators (many allowed; leaf holds keys + pointer/clustering key). Analogy that lands: a dictionary is clustered by word; the index at a book's back is nonclustered.

**Q8. What is a stored procedure and why use one?**
Precompiled, parameterized T-SQL on the server: injection-safe parameters, one round trip for multi-step logic, plan reuse, permission surface (grant EXEC without table access). Balance: logic in two places, harder unit testing — teams choose per boundary.

### 5.2 Intermediate level Q&A

**Q9. ROW_NUMBER vs RANK vs DENSE_RANK — with a tie example.**
Scores 100, 100, 90: ROW_NUMBER → 1,2,3 (arbitrary between ties); RANK → 1,1,3 (gap); DENSE_RANK → 1,1,2 (no gap). Top-N-per-group uses ROW_NUMBER in a CTE filtered to rn ≤ N.

**Q10. Write the query shape for "latest order per customer."**
```sql
WITH ranked AS (
  SELECT *, ROW_NUMBER() OVER (PARTITION BY CustomerId ORDER BY OrderDate DESC) rn
  FROM Orders
)
SELECT * FROM ranked WHERE rn = 1;
```
Alternatives (correlated subquery, `TOP 1 WITH TIES ... ORDER BY ROW_NUMBER()`) exist; the CTE+ROW_NUMBER shape is the expected answer.

**Q11. What makes a predicate non-SARGable? Give three fixes.**
Anything preventing an index seek: functions on the column (`YEAR(d)=2026` → date range predicate), leading-wildcard LIKE (`'%abc'` — consider full-text), implicit conversions (parameter type ≠ column type — match types), arithmetic on the column (`Price*1.18 > x` → `Price > x/1.18`). The principle: keep the column bare on one side.

**Q12. What is a covering index and what problem does it solve?**
An index containing (as keys or INCLUDE columns) every column a query touches — the engine answers from the index alone, eliminating key lookups back to the clustered index. Thousands of lookups per query is a classic plan pathology; INCLUDE the selected columns and it becomes one seek + range scan.

**Q13. Explain parameter sniffing.**
SQL Server compiles a procedure's plan using the *first* parameter values and caches it. If those values were unrepresentative (e.g., a customer with 3 rows, plan cached as nested-loops; next call is a customer with 3 million rows), performance craters. Fixes: `OPTION (RECOMPILE)` on the statement, `OPTIMIZE FOR`, rewriting to avoid wild cardinality swings, or SQL 2022's parameter-sensitive plans.

**Q14. Walk through the isolation levels and the anomalies each prevents.**
READ UNCOMMITTED allows dirty reads. READ COMMITTED (default) prevents dirty reads. REPEATABLE READ also prevents non-repeatable reads. SERIALIZABLE also prevents phantoms. SNAPSHOT/RCSI use row versioning so readers see consistent data without blocking writers — the practical modern answer for mixed workloads. Bonus point: NOLOCK = READ UNCOMMITTED, including its wrong-results risks.

**Q15. How does SQL Server handle a deadlock, and how do you reduce them?**
The lock monitor detects the cycle and kills the cheapest victim with error 1205 (rollback). Reduce: access objects in a consistent order, keep transactions short and free of user/API waits, index to narrow lock footprints, consider RCSI to remove reader/writer conflicts. Application side: retry 1205 idempotently. Diagnose with the system_health XEvent session's deadlock graph.

**Q16. CTE vs temp table vs table variable?**
CTE: named inline query — no materialization, re-evaluated per reference; readability/recursion. #Temp table: real tempdb table with statistics — best for large intermediate sets reused across steps. @Table variable: no statistics historically (poor estimates on large sets), no recompiles — small sets, passed as TVPs. Answering "when would each hurt" is the differentiator.

### 5.3 Advanced & scenario Q&A

**Q17. Scenario: a query is suddenly slow in production but fast yesterday. Method?**
Compare plans: current vs known-good (Query Store is the tool — forced plans, regression detection). Common causes: parameter sniffing after a plan eviction, stale statistics after a large load (update stats), data growth crossing a tipping point (seek+lookup flipped to scan), or a blocked session (check `sys.dm_exec_requests`/waits, not just the plan). The senior signal: *diagnose with Query Store/DMVs before touching indexes*.

**Q18. Scenario: INSERTs into a huge table are slowing down. What do you examine?**
Index count (every nonclustered index is extra write work — drop unused ones via usage stats), clustered key pattern (random GUIDs → page splits/fragmentation; prefer sequential), triggers, foreign-key validation costs, fill factor for hot ranges, and lock escalation/contention (last-page insert hotspot on ever-increasing keys — mitigations: OPTIMIZE_FOR_SEQUENTIAL_KEY in 2019+, partitioning).

**Q19. How would you page results properly?**
`ORDER BY ... OFFSET @skip ROWS FETCH NEXT @take ROWS ONLY` — with a covering index on the sort. For deep pages, OFFSET still reads and discards all skipped rows; keyset ("seek") pagination — `WHERE (SortCol, Id) > (@lastSort, @lastId) ORDER BY SortCol, Id FETCH NEXT @take` — stays fast at any depth and is the answer for infinite scroll.

**Q20. Design the indexing for: `WHERE CustomerId = @c AND Status = @s ORDER BY OrderDate DESC` returning Id, Total.**
Composite nonclustered index on `(CustomerId, Status, OrderDate DESC) INCLUDE (Total)` (Id comes free as the clustering key). Equality columns lead, then the sort column so the ORDER BY is satisfied by index order — no sort operator; INCLUDE covers the select list — no lookups. Explaining *why that column order* is the actual question.

**Q21. How do you do a zero-downtime schema change on a busy table?**
Expand-migrate-contract: add the new nullable column (metadata-only), backfill in small batches (avoid one giant lock/log spike), deploy code writing both/reading new, add constraints as NOT NULL WITH (ONLINE) checks last, drop the old column later. Also: ONLINE index builds (Enterprise), avoid blocking ALTERs during peak, and always know which operations are metadata-only vs size-of-data.

**Q22. Optimistic vs pessimistic concurrency — how do you implement optimistic in SQL Server?**
Pessimistic locks rows up front (UPDLOCK) — simple, serializes users. Optimistic assumes no conflict: read a `ROWVERSION` column with the data; UPDATE ... WHERE Id=@id AND RowVer=@rowver; zero rows affected = someone else changed it → reload/merge. Web apps are optimistic by default (EF Core concurrency tokens map exactly to this).

**Q23. What belongs in a backup/recovery answer?**
Recovery model (FULL for point-in-time via log backups; SIMPLE for dev/ETL), backup chain: full + differential + transaction log on a schedule driven by **RPO** (data you can afford to lose) and **RTO** (time to restore), regular *restore tests* ("a backup you've never restored is a hope, not a backup"), and CHECKDB for corruption detection. HA is a different axis: Availability Groups/log shipping for failover, backups for recovery.
