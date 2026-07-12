# ERP — Enterprise Resource Planning: Complete Course

Enterprise Resource Planning (ERP) is an integrated business management system that unifies all core business functions — from purchasing raw materials and running production to delivering finished goods, collecting payments, managing employees, and reporting financials — into a single, connected platform.

This course covers all 11 standard ERP modules, their internal process flows, and how they interact with each other to form a complete business operating system.

---

## 1. Introduction to ERP Systems

### What is an ERP System?

An **Enterprise Resource Planning (ERP)** system is software that integrates all the core business processes of an organization into one unified platform, sharing a common database and real-time information flow.

Before ERP, companies operated in silos — the purchase team used one system, finance another, and production a completely separate one. This caused delays, data duplication, errors, and poor decision-making. ERP solved this by creating a single source of truth.

**Core principles of ERP:**

- **Single database:** All departments access and update the same data. When a purchase order is raised, Finance, Inventory, and Production all see it instantly.
- **Real-time information:** No batch processing delays — a dispatch in the warehouse is reflected in customer invoices and inventory reports simultaneously.
- **Process automation:** Approvals, notifications, and document generation (invoices, GRNs, payslips) are automated based on configured workflows.
- **Audit trail:** Every transaction is logged with user, timestamp, and action — essential for compliance and investigations.
- **Role-based access:** Finance staff can see financial data but not HR payroll details; warehouse staff can update stock but not modify pricing.

**Popular ERP systems worldwide:**
- SAP S/4HANA (large enterprise — manufacturing, FMCG, pharma)
- Oracle ERP Cloud (finance-heavy industries)
- Microsoft Dynamics 365 (mid-market)
- Tally Prime / Busy (Indian SME market — accounting-first)
- Odoo (open-source, SME/startup friendly)
- ERPNext (open-source, India-specific features)

### ERP Architecture — The 11 Modules

A complete ERP system covers these interconnected functional areas:

| Module | Short Name | Core Flow |
|--------|-----------|-----------|
| Customer Relationship Management | CRM | Lead → Sales Order |
| Sales & Distribution | SD / S&D | Order → Cash |
| Master Production Planning | MPS / MRP | Demand → Production Plan |
| Purchase Management | MM / P2P | Indent → Stock |
| Inventory & Warehouse | WM / IM | Receipt → Issue |
| Production | PP | Order → Finished Goods |
| Quality Management | QM | Test → Release |
| Finance & Accounting | FI / CO | Record → Report |
| HR & Payroll | HCM / HR | Hire → Retire |
| Asset Management | AM | Acquire → Dispose |
| Reports & Analytics | BI / MIS | Data → Decisions |

**How the modules connect:**
A sales order from CRM triggers a demand signal in Production Planning. Production Planning checks finished goods stock — if unavailable, it either raises a Production Order or a Purchase Requisition. The Production Order pulls raw materials from Inventory, sends QC samples to Quality Management, and once the batch passes, transfers Finished Goods to the warehouse. Simultaneously, Purchase creates POs, receives goods via GRN, and sends vendor invoices to Finance for payment. Finance tracks all money movements, HR manages the people executing these processes, Asset Management tracks the machinery, and Analytics reports everything to management.

### ERP Benefits and Implementation Challenges

**Key benefits:**
- Eliminates data duplication and manual reconciliation
- Provides real-time visibility across the entire supply chain
- Enforces standardized business processes
- Reduces order-to-delivery cycle time
- Enables accurate financial reporting and compliance

**Common implementation challenges:**
- **Change management:** People resist new processes — training and buy-in are harder than the software itself
- **Data migration:** Cleaning and migrating years of legacy data is typically 30-40% of the project effort
- **Customization vs. standardization:** Over-customizing ERP breaks upgrades and defeats the purpose
- **Go-live risk:** A big-bang go-live on day one is high risk; phased rollouts are safer
- **Integration with legacy systems:** Old plant-floor machines, billing software, or government portals may need custom connectors

---

## 2. CRM — Customer Relationship Management

### Lead Management and Qualification

CRM is the entry point of the ERP value chain. Before a sales order exists, there is a **lead** — an expression of interest from a potential customer.

**Lead Generation Sources:**
- Inbound: website forms, trade show inquiries, cold calls, referrals
- Outbound: marketing campaigns, social media, email campaigns
- Internal: existing customers exploring new products

**Lead Qualification Process:**
When a lead comes in, the sales team evaluates it against qualification criteria:

1. **Budget:** Does the prospect have the budget to buy?
2. **Authority:** Are we speaking to the decision-maker?
3. **Need:** Do they genuinely need our product?
4. **Timeline:** When do they plan to purchase?

This is the classic BANT framework. Leads that pass become **Opportunities**.

**In the ERP system:**
- A lead record is created with source, contact details, and product interest
- The salesperson logs all communications (calls, emails, meetings)
- A qualification checklist is filled
- Unqualified leads are archived with a reason code (budget mismatch, wrong segment, etc.)
- Qualified leads are converted to Opportunities

### Opportunity Management and Quotation

An **Opportunity** is a qualified prospect that has a realistic chance of becoming a customer. Managing the opportunity pipeline is the heart of CRM.

**Opportunity stages:**
1. **Discovery** — Understanding the customer's detailed requirements
2. **Demo / Site Visit** — Product demonstration or customer site assessment
3. **Proposal** — Preparing and presenting a formal quotation
4. **Negotiation** — Price, quantity, payment terms, delivery timeline
5. **Closure** — Won (becomes a Sales Order) or Lost (reason logged)

**Quotation in ERP:**
The quotation (also called a Proforma Invoice or Offer Letter) contains:
- Product/service line items with quantities and unit prices
- Discounts and special terms
- Validity period
- Delivery timelines
- Payment terms (advance, credit period)

The quotation is auto-generated from ERP with pricing from the price master and approved discount structure. Multiple version of a quotation can be maintained as negotiations proceed.

**Lost opportunity analysis:**
ERP tracks why deals are lost — price too high, competitor won, requirement changed, budget cut. This data feeds into strategic decisions about pricing and product positioning.

### Sales Order Conversion

When a customer accepts the quotation, it converts into a **Sales Order (SO)** — the legal commitment between buyer and seller.

**What a Sales Order contains:**
- Customer master data (billing address, shipping address, GSTIN)
- Ordered items with quantities, prices, and taxes
- Confirmed delivery date
- Payment terms (e.g., 30% advance, 70% on delivery)
- Special instructions

**After Sales Order creation:**
- The SO is locked and numbered (e.g., SO/2024-25/00234)
- It triggers an availability check in the Inventory module
- If stock is available → dispatch planning begins
- If stock is insufficient → MPS/MRP is triggered to plan production or procurement
- Finance module creates a pending accounts receivable entry
- Customer receives an order acknowledgment

**CRM → Other Modules:**
- → Sales & Distribution (order processing and fulfillment)
- → Finance (customer credit limit check, advance payment terms)
- → Analytics (pipeline reports, win/loss ratio, conversion rates)

---

## 3. Sales and Distribution — Order to Cash

### Sales Order Processing and Credit Check

Sales & Distribution (S&D) manages everything after the Sales Order is confirmed — all the way until cash is collected from the customer.

**Order processing steps:**
1. Sales Order received (from CRM or direct entry)
2. **Order review and confirmation** — pricing, quantities, delivery terms verified
3. **Credit check** — Finance module checks if the customer is within their credit limit
4. If credit hold: Finance team reviews, may request advance payment before proceeding
5. If credit clear: proceed to availability check

**Credit check mechanics:**
- Customer master has a **credit limit** (e.g., ₹50 lakhs)
- The system checks current outstanding balance + this new order value
- If combined value ≤ credit limit: auto-approved
- If exceeds limit: order goes on credit hold; Finance manager reviews and either releases, blocks, or asks for advance payment

### Availability Check, Picking, and Dispatch

Once a Sales Order clears credit, the system checks if finished goods are available.

**Availability check:**
- The system queries the FG (Finished Goods) stock in the warehouse
- Compares against the ordered quantity
- If available: creates a **delivery order / picking list**
- If not available: escalates to Production Planning (triggers MPS/MRP)

**Picking and packing:**
- A picking list is generated for the warehouse team
- Stock is physically picked from the designated bin locations
- Items are packed and labelled (including batch numbers, expiry dates for pharma/food)
- A **Delivery Note** is created — the physical document that travels with the goods

**Dispatch:**
- Vehicle/courier is assigned
- E-way bill generated (mandatory for India GST — for consignments above ₹50,000 moving beyond 10 km)
- Delivery challan or Lorry Receipt (LR) obtained from transporter
- Stock is reduced in the system at the point of dispatch

### Invoicing, Payment Collection, and Account Closure

**Customer Invoice (Tax Invoice):**
Raised immediately after dispatch (or sometimes after delivery confirmation).

Contains:
- HSN code and GST rate for each product
- CGST/SGST (intra-state) or IGST (inter-state) amounts
- Customer and supplier GSTIN
- Invoice number in the prescribed format

**Payment collection:**
- Invoice is sent to the customer's accounts payable team
- ERP creates an **Accounts Receivable** entry in Finance
- A **payment follow-up schedule** (dunning) is auto-generated based on credit terms
  - Example: Reminder at 15 days, formal notice at 30 days, escalation at 45 days
- When payment arrives, the Finance team posts a **Payment Receipt** and links it to the invoice

**Account closure:**
- Invoice is marked as "Cleared"
- The Sales Order status changes to "Completed"
- Customer outstanding balance is reduced
- Revenue is recognized in the General Ledger

---

## 4. Master Production Planning

### Master Production Schedule (MPS)

The Master Production Schedule (MPS) is the plan that tells manufacturing **what to produce, how much, and when**. It bridges the gap between customer demand and factory capacity.

**Inputs to MPS:**
- **Confirmed Sales Orders** — actual customer orders with delivery dates
- **Sales Forecast** — predicted demand for the planning horizon (usually 3–12 months)
- **Opening Finished Goods Stock** — current FG inventory level
- **Safety Stock Target** — minimum FG stock to maintain at all times

**MPS calculation (simplified):**
```
Production Required = Demand - Opening Stock + Safety Stock Target
```

Example:
- Customer orders: 1,000 units
- Opening FG stock: 200 units
- Safety stock target: 100 units
- Production Required: 1,000 - 200 + 100 = **900 units**

**MPS output:**
- Production orders for each product line (what and how much)
- Required delivery dates to production floor
- Capacity loading on each work centre / machine

**FG Availability Check:**
Before generating a production order, MPS first checks if the Finished Goods stock can directly fulfill the Sales Order:
- **FG available → direct dispatch** (no production needed)
- **FG insufficient → production order released** → triggers MRP

### Material Requirement Planning (MRP)

Once the MPS determines what needs to be produced, MRP calculates **what raw materials and components are needed**.

**MRP works backward from the production quantity:**
1. **Bill of Materials (BOM) explosion** — the product recipe is expanded to show every raw material and its quantity needed per unit of output
2. **Stock check** — current raw material inventory is queried
3. **Net requirement calculation:**
   ```
   Net Requirement = Gross Requirement - Stock on Hand - Stock on Order
   ```
4. **Material Availability Decision:**
   - Materials available → proceed to production
   - Materials short → generate **Purchase Requisition** (triggers Purchase module)

**BOM Example (pharmaceutical tablet batch):**
| Material | Qty per 1,000 tablets | Unit |
|----------|----------------------|------|
| API (Active Ingredient) | 500 | g |
| Excipient A | 200 | g |
| Coating agent | 50 | g |
| Packaging film | 10 | m² |
| Labels | 1 | sheet |
| Carton | 0.1 | box |

### Production Order vs. Purchase Decision

After MRP, the system routes to one of two execution paths:

**Path 1 — Production Cycle:**
- All required raw materials are in stock
- Production Order is confirmed and released to the shop floor
- Production module takes over

**Path 2 — Purchase Cycle:**
- Some or all raw materials are unavailable
- Purchase Requisition is automatically generated for short materials
- Purchase module raises POs and procures the materials
- Once materials arrive, production can begin

**MPS/MRP → Other Modules:**
- → Production (releases production orders)
- → Purchase (generates purchase requisitions for material shortfalls)
- → Inventory (queries current stock levels)
- → Sales (checks finished goods availability for dispatch)

---

## 5. Purchase Management — Procure to Pay

### Indent Creation and Approval

Purchase Management handles the complete **Procure-to-Pay (P2P)** cycle — from the initial request for material through to payment of the vendor.

**What is an Indent?**
An Indent (also called a Purchase Requisition or Material Request) is an internal document raised by a department requesting that the Purchase team procure specific materials.

**Who raises indents?**
- Production team: raw materials and packing materials for manufacturing
- MRP module: auto-generated based on material shortfalls
- Maintenance team: spare parts and consumables
- Admin: office supplies, utilities

**Indent details:**
- Material name, code, and specification
- Required quantity and unit of measure
- Required delivery date
- Delivery location (store/warehouse)
- Cost centre / department

**Indent Approval Workflow:**
```
Indent Created → Department Head Review → Purchase Head Review
     ↓                    ↓                        ↓
  Submitted          Need Amendment?            Approved?
                      ↙     ↘                  ↙      ↘
                   Yes       No            Rejected   Approved
                   ↓                                     ↓
              Modify & Resubmit                   Purchase team proceeds
```

### Quotation Process and Vendor Selection

After indent approval, the Purchase team decides how to source the material:

**Route 1 — Direct Purchase Order (Direct PO):**
Used when:
- The vendor is already approved and prices are contracted
- The material is a standard/recurring item with an existing rate contract
- The value is below a threshold (e.g., below ₹10,000 no quotation needed)

**Route 2 — Through Quotation (RFQ Process):**
Used when:
- Material is being purchased for the first time
- Existing vendor prices need to be reviewed
- Value exceeds the threshold requiring competitive quotation

**RFQ Process steps:**
1. **Request for Quotation (RFQ)** issued to 3+ shortlisted vendors
2. Vendors submit their **Quotations** (price, delivery time, payment terms, specifications)
3. **Quotation Entry** — all vendor quotes entered in ERP
4. **Comparative Statement** — ERP generates a side-by-side comparison
5. **Vendor Selection** — based on price, quality history, delivery reliability, payment terms
6. **Purchase Order** raised for the selected vendor

**Comparative Statement example:**

| Criteria | Vendor A | Vendor B | Vendor C |
|----------|---------|---------|---------|
| Unit Price | ₹450 | ₹420 | ₹460 |
| Delivery | 7 days | 10 days | 5 days |
| Payment Terms | 30 days | 45 days | 15 days |
| Quality Rating | A | B | A |
| **Recommended** | | ✓ | |

### Purchase Order, GRN, and Quality Inspection

**Purchase Order (PO):**
- Formal legal document committing to buy specific materials at agreed price and terms
- PO number is communicated to the vendor
- **PO Approval workflow:** Similar to indent — below a threshold it's auto-approved; above threshold requires management approval

**PO Approval decision:**
- Approved → PO sent to vendor, vendor schedules delivery
- Need Amendment → Purchase team modifies terms and resubmits

**Material Gate Entry:**
When the vendor delivers materials:
1. Security at the gate records the vehicle number, vendor name, and PO reference
2. Physical count / weight check at the gate
3. Gate Entry document created with timestamp

**Goods Receipt Note (GRN):**
The GRN is the internal document confirming receipt of goods.
- Links to the PO (3-way match reference)
- Records actual received quantity vs. PO quantity
- Triggers quality hold — material moves to QC pending status

**GRN Physical Inspection:**
The store keeper or QC team physically verifies:
- Quantity matches GRN
- Condition (no damage, leaks, contamination)
- Labelling and documentation (COA, MSDS if required)
- **Pass** → request sent to QC team for detailed testing
- **Rejected** → Rejection Note raised, vendor is informed

**QC Sampling and Decision:**
QC team collects samples as per the sampling plan (based on quantity received — AQL levels).
Testing is done against approved specifications.

- **QC Pass:** Certificate of Analysis (COA) issued, material status changes to "Approved" and moves to the main store
- **QC Fail:** Rejection Note raised. Material is quarantined and either:
  - Returned to vendor (Purchase Return) with a debit note
  - Destroyed on-site (Destruction Note, requires QC and management approval)

**Purchase Management → Other Modules:**
- ← MPS (receives purchase requisitions from MRP)
- → Inventory (approved GRN adds stock)
- → Quality Management (QC sampling and COA)
- → Finance / AP (3-way match: PO + GRN + vendor invoice → payment)

---

## 6. Inventory and Warehouse Management

### Stock Receipt and Location Assignment

Inventory Management controls all movement of materials — from the moment goods arrive until they are consumed in production or dispatched to customers.

**Stock categories in a manufacturing ERP:**
- **Raw Material (RM) Store** — incoming materials from vendors
- **Packing Material (PM) Store** — labels, cartons, foil, bottles
- **Work in Progress (WIP)** — materials currently in production
- **Finished Goods (FG) Store** — completed products awaiting dispatch
- **Quarantine / QC Hold** — materials pending quality inspection
- **Rejected / Blocked Stock** — failed QC, not usable

**Location assignment:**
Modern warehouses use a **bin location system:**
- Row → Bay → Level → Bin (e.g., A-03-02-04)
- ERP assigns bin locations based on product, temperature requirement, and FEFO (First Expiry, First Out) or FIFO rules
- Cold chain products go to refrigerated zones; flammables to a separate licensed area

**Stock valuation methods:**
- **FIFO (First In, First Out)** — oldest stock issued first; used in food, pharma
- **FEFO (First Expiry, First Out)** — soonest expiry issued first; mandatory in pharma
- **Weighted Average** — cost per unit is recalculated with each receipt; common in manufacturing
- **Standard Cost** — fixed cost per unit; variances are tracked separately

### Material Issues, Transfers, and Returns

**Material Issue to Production:**
When the production team needs raw materials:
1. A **Material Requisition Slip (MRS)** is raised against the Production Order
2. The store verifies the quantity and picks the material (FEFO/FIFO)
3. Material is issued and the stock is reduced
4. The issued quantity is linked to the Production Order for costing

**Stock Transfer:**
Movement between storage locations within the same plant or between plants:
- **Transfer Order** documents the movement
- Applicable for inter-store transfers (RM store → Production floor), inter-plant transfers, or shifting from quarantine to main stock

**Material Return Note (MRN):**
When production returns excess raw materials back to the store:
- MRN is raised with reason (excess, wrong material, cancelled production)
- Store accepts material back after inspection
- Stock increases again; production cost is adjusted

**Purchase Return:**
When rejected or excess material is returned to the vendor:
- Purchase Return Note raised
- Debit note sent to vendor (reduces vendor payable)
- Transport arranged for return shipment

### Physical Stock Verification

Also called **Physical Inventory Count** or **Stock Taking**. This is the process of physically counting all items in the warehouse and comparing against the system stock (book stock).

**Types of physical verification:**
- **Annual physical inventory:** Full count of all items, usually at year-end for financial reporting
- **Cycle counting:** Count a portion of inventory continuously throughout the year (e.g., high-value items monthly, medium quarterly, slow-movers annually)
- **ABC analysis:** A items (high value, 20% of items = 80% of value) counted most frequently

**Process:**
1. Stock freeze — no movements allowed during counting
2. Count tags generated for each bin location
3. Physical counting by designated counters
4. Recount for discrepancies above threshold
5. **Variance analysis:** Reasons investigated (theft, breakage, system errors, unposted GRNs)
6. Approved adjustments posted to adjust book stock to physical count

---

## 7. Production — Batch Manufacturing

### Batch Creation and Release Order

Production in a regulated manufacturing environment (pharma, food, chemicals) is done in **batches** — a defined quantity of product manufactured under the same conditions, with full traceability.

**Production Order (from MPS):**
The starting point — specifies what to produce, how much, and when. It links to the:
- **Bill of Materials (BOM):** the recipe (which raw materials, what quantities)
- **Routing:** the sequence of operations (mixing → granulation → compression → coating → packing)

**Batch Offer:**
The production supervisor reviews the Production Order and creates a **Batch Offer** — a commitment to manufacture a specific batch quantity using available capacity.

**Batch Master Creation:**
A unique Batch Number is assigned (e.g., B240712001). The Batch Master records:
- Batch number, product, quantity
- Manufacture date, expiry date (calculated from shelf life)
- BOM and routing version used
- Target quality parameters

**Batch Release Order:**
Before production begins, the batch must be **formally released for manufacture**:

```
Batch Release Order created
         ↓
Review by Production Head
         ↓
Need Amendment? → Modify / Change → Resubmit
         ↓
    Approved → Production begins
```

### Raw Material Requisition, Issue, and In-Process QC

**Raw Material Requisition (RMR):**
- Raised against the specific batch and Production Order
- Specifies each RM required with exact quantity (as per BOM)
- Batch numbers of raw materials are also recorded for full traceability

**Raw Material Issue:**
- Store verifies RMR and picks the materials (FEFO-based batch selection)
- QC checks the RM batches to confirm they are still within approved status
- Materials are physically handed over to the production team and recorded in ERP

**Bulk / Semi-Finished Sampling:**
During or after the manufacturing process (but before packing), samples are collected from the bulk batch:
- QC analyses the sample against in-process specifications (particle size, pH, moisture content, assay)
- **Sampling Result Decision:**
  - **Pass:** Production moves to packing stage
  - **Fail:** Batch goes to destruction (Destruction Note raised)
  - **Online Rejection (partial):** The rejected portion goes to Step A (additional handling)

**Step A — Additional Material Handling:**
For partial rejections or when additional materials are needed mid-production:
1. **Additional Requisition (OLR/Normal):** New material requisition for replacement or extra materials
2. **Additional Material Issue:** Store issues the replacement materials
3. **Rejected Material Return to Store:** Rejected portion is sent back to the store
4. **Purchase Return Note:** If the rejected material is of vendor origin and needs to be returned

### Finished Goods Sampling, Transfer, and Batch Release

**Packing Material Requisition and Issue:**
Once bulk passes QC:
- Packing materials (labels, cartons, bottles, foil) are requisitioned
- Same process as RM — FEFO-based, QC-approved batches only

**Finished Goods Sampling:**
After packing is complete, samples of the finished, packed product are collected:
- QC tests against finished product specifications (content uniformity, disintegration, appearance)
- **F.G. Sampling Result:**
  - **Pass:** Batch is ready for transfer to FG Store
  - **Fail:** Batch goes to Destruction Note approval
  - **Online Rejection:** Partially rejected units go to Step A

**Transfer Ticket (TT):**
The formal document for moving finished goods from the production area to the FG Store:
1. **Transfer Ticket created** by production team
2. **Transfer Ticket Release:** Production Head approves the release
3. **Transfer Ticket Acceptance:** Store Manager accepts the goods and signs off
4. **Finished Goods Moved to Store:** ERP stock updated — FG stock increases

**Excess Raw Material Return:**
Any raw or packing material remaining after the batch is complete:
- **Material Return Note (MRN)** raised by production team
- Store inspects and accepts the returned material
- Stock is increased; production cost is adjusted downward

---

## 8. Quality Management

### Incoming Material Quality Control

Quality Management (QM) covers all testing, certification, and quality decision-making across the ERP value chain. In regulated industries (pharma, food, chemicals), QM is not optional — it is legally mandated.

**Incoming QC Flow:**

```
GRN Physical Inspection (store keeper)
         ↓
QC Sampling Request raised
         ↓
Lab analyst collects samples per sampling plan
         ↓
Laboratory Testing vs. approved specification
         ↓
Results entered in ERP
         ↓
QC Manager reviews and approves/rejects
         ↓
Certificate of Analysis (COA) issued (if pass)
         ↓
Material status changed: "Approved" / "Rejected"
```

**Specification management:**
Each raw material, packing material, and finished product has an approved specification in the QM module:
- Physical parameters (appearance, color, odor)
- Chemical parameters (assay, pH, moisture, impurities)
- Microbiological limits (where applicable)
- Instrumental methods (HPLC, GC, UV, IR)

**COA (Certificate of Analysis):**
A document issued by QC confirming that the tested batch/lot meets specifications. It includes:
- Material name, batch/lot number, manufacturer/vendor name
- Test parameters and results (actual values with units)
- Specification limits
- QC Manager signature and date
- "Approved for Use" or "Rejected" status

### In-Process Quality Control

QC is not just at the start and end — critical quality checks happen throughout the production process.

**In-Process Checks (IPC) for tablet manufacturing example:**

| Stage | Parameters Checked |
|-------|-------------------|
| Granulation | Granule size, moisture content |
| Compression | Hardness, thickness, weight variation, friability |
| Coating | Weight gain, appearance |
| Packing | Seal integrity, label correctness, count |

Each IPC check is recorded in ERP against the batch. If a result is out of specification:
- Production is stopped
- QC investigates the root cause
- Production can either correct the issue and continue, or the batch is scrapped

### CAPA — Corrective and Preventive Action

When a quality failure occurs (incoming rejection, batch failure, customer complaint), a **CAPA** is initiated to prevent recurrence.

**CAPA stages:**
1. **Identification:** Non-conformance detected and documented (NC report)
2. **Containment:** Immediate action to prevent further impact (quarantine batch, hold vendor shipments)
3. **Root Cause Analysis (RCA):** Investigation — 5-Why analysis, fishbone diagrams, DOE
4. **Corrective Action:** Fix the identified root cause (retrain operators, change supplier, update SOP)
5. **Preventive Action:** Change the system to prevent similar issues in future (add incoming inspection step, change specification)
6. **Verification:** Follow-up review to confirm the CAPA was effective
7. **Closure:** CAPA record closed with all documentation

---

## 9. Finance and Accounting

### Accounts Payable — The 3-Way Match

Finance in ERP is divided into two main receivables/payables tracks and a general ledger that consolidates everything.

**Accounts Payable (AP)** manages money owed to vendors.

**The 3-Way Match** is the cornerstone of AP:
```
Purchase Order (what was ordered)
       +
Goods Receipt Note (what was received)
       +
Vendor Invoice (what vendor is charging)
       =
All three must match before payment
```

**Why the 3-way match matters:**
Without it, companies pay for goods not received, pay wrong quantities, or pay wrong prices. The 3-way match is a built-in financial control that prevents fraud and errors.

**AP Process:**
1. Vendor invoice arrives (physical or e-invoice)
2. ERP auto-matches against PO and GRN
3. **Full match:** Invoice approved for payment
4. **Partial match:** Discrepancy flagged — purchase team resolves (price difference, short supply, etc.)
5. Payment run executed (NEFT/RTGS/cheque)
6. Vendor ledger updated, PO marked as fully invoiced

**Payment terms tracking:**
ERP manages due dates based on agreed credit terms:
- Net 30: Full payment 30 days from invoice date
- 2/10 Net 30: 2% discount if paid in 10 days, otherwise full amount by 30 days
- End of month: Payment at month-end after a minimum 30 days

### Accounts Receivable and Collections

**Accounts Receivable (AR)** manages money owed by customers.

**AR Process:**
1. Customer invoice raised in ERP (upon dispatch or delivery)
2. Outstanding entry created in customer ledger
3. **Aging report** generated — shows invoices by age bucket:

| Age Bucket | Example amount | Action |
|-----------|----------------|--------|
| 0–30 days | ₹5,00,000 | Normal |
| 31–60 days | ₹2,00,000 | First reminder |
| 61–90 days | ₹80,000 | Formal notice |
| 90+ days | ₹20,000 | Escalate / legal |

4. Collections team follows up based on the dunning schedule
5. Payment received → Payment Receipt posted → Invoice cleared
6. Customer ledger reconciliation — periodic statement sent to customer for confirmation

**GST compliance (India-specific):**
- All tax invoices uploaded to GSTN
- GSTR-1 (outward supplies) filed monthly/quarterly
- GSTR-3B (summary return) filed monthly with tax payment
- GSTR-2A reconciliation to claim Input Tax Credit (ITC) on purchases

### General Ledger and Financial Reporting

The **General Ledger (GL)** is the master record of all financial transactions in the organization. Every module feeds into it — purchase invoices post to it, customer invoices post to it, payroll entries post to it, and depreciation posts to it.

**Chart of Accounts:**
A structured list of all GL accounts:
- **Assets:** Current (cash, bank, receivables, inventory) + Fixed (property, plant, machinery)
- **Liabilities:** Current (payables, provisions) + Long-term (loans, debentures)
- **Equity:** Share capital, retained earnings
- **Income:** Revenue from sales, other income
- **Expenses:** Cost of goods sold, operating expenses, depreciation

**Period-end close process:**
1. Cut-off: Ensure all transactions for the period are posted
2. Accruals: Book expenses incurred but not yet invoiced
3. Prepayments: Defer expenses paid in advance
4. Depreciation run: Auto-calculated by Asset Management module
5. Inventory valuation: Confirm stock value and adjust if needed
6. Trial Balance preparation: Verify debits = credits
7. Profit & Loss statement
8. Balance Sheet
9. Management approval and sign-off

### Cost Accounting and Variance Analysis

**Standard Costing:**
At the start of the financial year, a **standard cost** is set for each product:
- Standard material cost (from BOM × standard material prices)
- Standard labour cost (from routing × wage rates)
- Standard overhead (production overhead allocated per machine hour)

**Actual cost capture:**
As production runs, actual costs are recorded:
- Actual material consumption (from material issues)
- Actual labour hours (from attendance/timesheet)
- Actual machine time (from production records)

**Variance Analysis:**

| Variance Type | Meaning | Example |
|--------------|---------|---------|
| Material Price Variance | Actual price ≠ standard price | API cost increased from ₹500 to ₹520/kg |
| Material Usage Variance | Actual consumption ≠ standard | Batch used 505g API instead of 500g |
| Labour Efficiency Variance | Actual hours ≠ standard hours | Tablet compression took 10 hrs vs 8 hrs standard |
| Overhead Volume Variance | Actual production ≠ planned | Ran 900 batches vs 1,000 planned |

Variance analysis helps identify where actual costs are diverging from plan — enabling management to take corrective action.

---

## 10. HR and Payroll

### Manpower Planning and Recruitment

HR module in ERP manages people — the most critical resource in any organization.

**Manpower Planning:**
- Based on production plan, business growth projections, and attrition rates
- HR determines how many positions (by role, department, skill) need to be filled
- **Headcount budget** approved by Finance and Business Head
- Open positions raised in ERP as **Job Vacancies**

**Recruitment Process:**

```
Job Vacancy created → Job posting (internal/external)
         ↓
Applications received
         ↓
Application Screening → shortlisting criteria (experience, qualifications)
         ↓
Interview Scheduling → multiple rounds (HR, technical, management)
         ↓
Assessment / Reference Check
         ↓
Selection Decision → Offer Letter generation
         ↓
Candidate Accepts? → Yes: Joining formalities
                  → No: Next candidate
```

**ERP role in recruitment:**
- Vacancy-to-hire pipeline tracking
- Interview scheduling and feedback recording
- Offer letter auto-generation from templates
- Offer approval workflow (HR Head → Business Head → Finance for budget check)

### Attendance, Leave, and Payroll Processing

**Employee Master:**
Created on day of joining. Contains:
- Personal details (name, PAN, Aadhaar, bank account for salary)
- Employment details (department, designation, reporting manager, date of joining)
- Compensation details (CTC, pay structure)
- Statutory details (PF account number, ESI number if applicable)

**Attendance management:**
- Biometric / RFID integration with ERP — swipe data auto-imported
- Shift scheduling: day/evening/night shifts with different allowances
- Overtime tracking and approval
- Absent / late arrival tracking with escalation to reporting manager

**Leave management:**
- Leave types configured: PL (Privilege Leave), SL (Sick Leave), CL (Casual Leave), ML (Maternity Leave), etc.
- Leave balance maintained per employee
- Leave application → Manager approval → HR confirmation workflow
- Auto-deduction from pay if leave without pay (LWP)

**Payroll Processing (monthly):**
1. **Attendance finalization** — cut-off date, overtime approved, LWP confirmed
2. **Earnings calculation:** Basic + HRA + conveyance + special allowance + OT
3. **Deductions calculation:** PF (12% employee), ESI (0.75% employee if salary ≤ ₹21,000), TDS, loan EMI, advance recovery
4. **Net salary:** Gross earnings − total deductions
5. **Payslip generation:** Auto-generated per employee
6. **Bank transfer file:** NEFT file uploaded to bank for bulk salary disbursement
7. **Statutory filings:** PF challan, ESI challan, TDS return — generated from ERP data

**HR → Other Modules:**
- → Finance (payroll journal entries post to GL; statutory payment via AP)
- → Production (attendance data feeds into labour cost for cost accounting)
- → Analytics (headcount, attrition, absenteeism, cost-per-hire dashboards)

---

## 11. Asset Management

### Asset Acquisition and Capitalization

Asset Management (AM) tracks all **fixed assets** — machinery, vehicles, computers, furniture, buildings — throughout their operational life.

**Asset Acquisition Request:**
- Raised by the department needing the asset (e.g., Production needs a new tablet press)
- **Capex (Capital Expenditure) budget** must be approved by Finance and Management
- For small assets below a threshold (e.g., below ₹5,000): may be expensed directly rather than capitalized

**Procurement:**
- Asset purchased through the Purchase Management module (Indent → PO → GRN)
- **Capitalization:** When the asset is received and installed/commissioned, it is "capitalized" — recorded as a fixed asset in the GL

**Asset Master Creation:**
Contains:
- Asset code (unique identifier), description, category (Plant & Machinery, Computer, Vehicle)
- Purchase cost, purchase date, vendor
- Location (plant, department, floor number)
- Cost centre (who bears the depreciation expense)
- Useful life (in years) and residual value (scrap value at end of life)
- Serial number, model number (for physical identification)

### Depreciation and Maintenance

**Depreciation** is the systematic reduction in the book value of an asset over its useful life, representing the economic consumption of the asset.

**Depreciation methods:**

| Method | Description | Best for |
|--------|------------|---------|
| **SLM (Straight Line Method)** | Equal amount every year: Cost ÷ Useful life | Buildings, furniture |
| **WDV (Written Down Value)** | Fixed % on reducing balance; higher early years | Machinery, vehicles |
| **Units of Production** | Based on actual usage (hours or units) | Mining equipment, moulds |

*Indian Companies Act 2013 mandates specific useful lives and depreciation rates for different asset categories.*

**ERP handles depreciation automatically:**
- Once the asset master is set up with the correct method and rate, the depreciation run is executed monthly or annually
- Depreciation journal entry: Debit Depreciation Expense, Credit Accumulated Depreciation
- Asset Net Book Value (NBV) = Cost − Accumulated Depreciation

**Maintenance management:**
- **Preventive Maintenance (PM) schedule:** Based on time (every 6 months) or usage (every 1,000 hours)
- **Work Order** raised automatically when PM is due
- Maintenance team logs actual work done, spare parts consumed, and time taken
- Breakdown Maintenance: Unplanned downtime tracked as an emergency work order
- Maintenance history linked to the asset master for lifecycle analysis

### Asset Disposal and Write-off

At the end of its useful life (or before), an asset is disposed of.

**Useful life check:**
ERP flags assets that have completed their useful life or are fully depreciated.

**Disposal types:**

**1. Sale of Asset:**
- Asset offered for sale (public auction, private sale, scrap dealer)
- Sale price negotiated
- Gain or Loss calculated: Sale Price − Net Book Value
- Gain: Credited to Profit on Sale of Asset (income)
- Loss: Debited to Loss on Sale of Asset (expense)
- Asset record closed in ERP

**2. Scrapping:**
- Asset physically scrapped (dismantled, junked)
- Scrap Note raised (similar to Rejection Note in QM)
- Scrap value recovered (weigh-bridge slip for metal scrap)
- Loss on scrapping: Net Book Value − Scrap recovery
- Asset master deactivated

**AM → Other Modules:**
- ← Purchase (capital asset procurement through PM module)
- → Finance (depreciation entries, disposal gain/loss to GL)
- → Analytics (asset register, ROI on assets, maintenance cost trend)

---

## 12. Reports and Analytics

### Operational and Financial Reports

Reports are the output that makes the entire ERP investment worthwhile — turning raw transaction data into actionable intelligence for all levels of management.

**Operational Reports (daily/weekly):**

| Report | Users | Purpose |
|--------|-------|---------|
| Production Batch Status | Production Head | Are batches on schedule? |
| GRN Pending QC | QC Manager | Backlog of material waiting for testing |
| Stock Below Reorder Level | Purchase/Stores | What needs to be ordered? |
| Open Sales Orders | Sales Head | What orders are yet to be dispatched? |
| Outstanding Payables | Finance | Which vendor payments are due this week? |
| Outstanding Receivables (Aging) | Finance/Sales | Which customers owe money, how long? |
| Purchase Order Status | Purchase | Are POs on track for delivery? |
| QC Rejection Rate | QC Head | Which vendors/materials are failing? |

**Financial Reports (monthly/quarterly/annual):**

| Report | Description |
|--------|-------------|
| Profit & Loss Statement | Revenue − Expenses = Net Profit for the period |
| Balance Sheet | Assets = Liabilities + Equity at a point in time |
| Cash Flow Statement | Cash inflows and outflows by activity |
| Trial Balance | All debit and credit balances to verify GL |
| Cost of Production | Material + Labour + Overhead per batch/product |
| Profitability by Product | Which products make the most money? |
| GST Returns (GSTR-1, GSTR-3B) | Tax compliance reports |

### Executive KPI Dashboards

Executive dashboards present the most important KPIs (Key Performance Indicators) in a visual, real-time format — typically charts, gauges, and traffic-light indicators.

**Key ERP KPIs:**

| Category | KPI | What it measures |
|----------|-----|-----------------|
| Sales | Revenue vs. Target | Month-to-date revenue vs. plan |
| Sales | Order Fill Rate | % of orders shipped complete and on time |
| Purchase | On-Time Delivery (vendor) | % of POs delivered by promised date |
| Purchase | Purchase Price Variance | Actual spend vs. standard cost |
| Production | Overall Equipment Effectiveness (OEE) | Machine availability × Performance × Quality |
| Production | Batch Success Rate | % of batches that pass QC on first attempt |
| Quality | First-Time Pass Rate | Materials/batches that pass QC without rework |
| Inventory | Inventory Turnover Ratio | Cost of Goods Sold ÷ Average Inventory |
| Inventory | Days Sales of Inventory (DSI) | How many days of stock on hand? |
| Finance | Gross Margin % | Gross Profit ÷ Revenue × 100 |
| Finance | Current Ratio | Current Assets ÷ Current Liabilities |
| HR | Attrition Rate | % of employees leaving per year |

---

## 13. ERP Integration — Inter-Module Data Flows

### Key Integration Points

The power of ERP lies in how modules connect. Here are the most critical integration touchpoints:

**CRM → Sales & Distribution:**
A won opportunity in CRM auto-creates a Sales Order in S&D with all customer details, product selections, and agreed pricing.

**Sales & Distribution → Production Planning:**
Confirmed Sales Orders and forecasts feed the MPS. The S&D module also provides real-time FG stock requests.

**Production Planning → Production:**
MPS releases Production Orders with BOM references, target quantities, and required completion dates.

**Production Planning → Purchase:**
MRP generates Purchase Requisitions for all material shortfalls identified through BOM explosion and stock netting.

**Purchase → Inventory:**
Approved GRNs (after QC clearance) add stock to the relevant store. The inventory levels updated here feed back into MRP.

**Purchase → Finance (AP):**
Each GRN creates a liability to the vendor. When the vendor invoice arrives and the 3-way match is completed, a payment obligation is posted to the GL.

**Inventory → Production:**
Material Issues against Production Orders reduce RM stock and create a cost trail for the batch.

**Production → Quality:**
In-process and FG QC requests are raised from the Production module. QC results determine whether the batch moves forward or goes to destruction.

**Quality → Inventory:**
A QC-approved batch generates a Transfer Ticket. Acceptance at the FG Store increases finished goods stock.

**Sales & Distribution → Finance (AR):**
Customer invoices raised on dispatch post to the AR sub-ledger. Payment receipts clear the outstanding and update the GL.

**HR → Finance:**
Monthly payroll journal entries (salary expense to relevant cost centres, statutory deductions to liability accounts) are posted to the GL.

**Asset Management → Finance:**
Monthly depreciation run generates journal entries. Asset disposals create gain/loss entries.

**All Modules → Analytics:**
Every transaction across all modules is available for reporting — no separate data extraction needed. Management can drill from an executive KPI down to the originating transaction.

### Common ERP Master Data

Master data is the backbone shared across all modules:

| Master | Used by | Key fields |
|--------|---------|-----------|
| Customer Master | CRM, S&D, Finance | Name, address, GSTIN, credit limit, payment terms |
| Vendor Master | Purchase, Finance | Name, address, GSTIN, bank details, payment terms |
| Material Master | All | Code, description, UOM, price, storage conditions |
| Bill of Materials | Production, MRP | Product recipe with components and quantities |
| Routing | Production | Sequence of operations and time standards |
| Chart of Accounts | Finance | GL account structure |
| Employee Master | HR, Finance | Personal, employment, and pay details |
| Asset Master | AM, Finance | Fixed asset register |

---

## 14. ERP Interview Preparation

### Conceptual Questions

**Q: What is the difference between MPS and MRP?**

A: MPS (Master Production Schedule) answers "what to produce and when" — it looks at confirmed sales orders and forecasts to decide production quantities and timing. MRP (Material Requirement Planning) answers "what materials to buy and when" — it takes the MPS as input, explodes the BOM to find raw material requirements, checks current stock, and generates purchase requisitions for shortfalls.

Think of MPS as the production manager's plan, and MRP as the materials procurement plan derived from it.

**Q: What is a 3-way match in accounts payable?**

A: Three-way match is a control that compares three documents before approving a vendor payment:
1. **Purchase Order** — what was agreed to be bought (price, quantity, terms)
2. **Goods Receipt Note** — what was actually received
3. **Vendor Invoice** — what the vendor is claiming payment for

All three must match in terms of quantity and price before payment is released. This prevents paying for goods not received, paying wrong quantities, or paying inflated prices.

**Q: What is the difference between FIFO and FEFO?**

A: FIFO (First In, First Out) issues the oldest stock first based on **receipt date**. FEFO (First Expiry, First Out) issues stock with the **nearest expiry date** first, regardless of when it was received. FEFO is mandatory in pharma and food industries to prevent expired product from being used in production.

**Q: What is a Bill of Materials (BOM)?**

A: A BOM is a product recipe — a structured list of all components (raw materials, packing materials) required to produce one unit (or one batch) of a finished product, along with their quantities and units of measure. It is the foundation of MRP and production cost calculation.

**Q: What is standard costing vs. actual costing?**

A: Standard costing uses predetermined costs (set at the start of the year) for material, labour, and overhead. Actual costing uses the real costs incurred. The difference between standard and actual is the **variance** — which is analyzed to identify where costs are higher than expected and why.

### Process Flow Questions

**Q: Walk me through the Purchase-to-Pay cycle.**

A: The complete P2P cycle:
1. Indent (Purchase Requisition) raised by department or auto-generated by MRP
2. Indent approved by department head and purchase head
3. If value is high or new material: RFQ sent to vendors, quotations received, comparative statement prepared, vendor selected
4. Purchase Order raised for the selected vendor and approved
5. Vendor delivers material — Gate Entry created
6. Goods Receipt Note (GRN) created against the PO
7. Physical inspection by store; QC sampling and testing
8. QC approves or rejects the material
9. If approved: material moved to stock (inventory updated)
10. Vendor invoice received, matched against PO and GRN (3-way match)
11. Invoice approved, payment processed, vendor ledger updated

**Q: Walk me through the Order-to-Cash cycle.**

A: The complete OTC cycle:
1. Customer inquiry → quotation → negotiation → Sales Order confirmed
2. Credit check against customer credit limit
3. Availability check — FG stock checked
4. If available: picking list generated, goods picked and packed
5. Dispatch with delivery note and e-way bill (GST compliance)
6. Customer invoice (Tax Invoice) raised
7. Invoice sent to customer; AR entry posted in ERP
8. Payment follow-up based on credit terms
9. Payment received → receipt posted → invoice cleared

**Q: What happens when there is a batch failure in production?**

A: When a batch fails QC (either at bulk sampling or FG sampling stage):
1. A **Destruction Note** is raised documenting what failed and why
2. The Destruction Note goes through an **approval workflow** (QC Head + Production Head + Management)
3. If approved: material is physically destroyed under supervision
4. A **QC investigation** is initiated to find the root cause
5. A **CAPA (Corrective and Preventive Action)** is opened to prevent recurrence
6. The batch cost is written off — absorbed as production loss in the cost of goods manufactured

### Implementation Scenario Questions

**Q: How would you handle a situation where a vendor delivers fewer items than the PO quantity?**

A: In ERP:
1. The GRN is created for the **actual received quantity** (not the PO quantity)
2. The GRN is marked as "partial receipt" — the PO remains open for the balance
3. The vendor invoice should only be for the received quantity — matched to the GRN
4. The purchase team follows up with the vendor for the remaining delivery
5. If the remaining quantity is no longer needed (requirement changed), the open PO line is closed manually

**Q: What is the impact on the system if you reverse a GRN after payment has been made?**

A: Reversing a GRN (returning goods) after payment creates a multi-step adjustment:
1. **Inventory:** Stock is reduced (material removed from stock)
2. **Finance/AP:** A debit note is raised against the vendor's ledger (reducing what they owe us or creating a receivable)
3. **GL:** The inventory asset account is credited; the debit note creates a receivable or reduces the vendor payable
4. **3-way match:** The returned GRN needs to be reconciled with any credit note issued by the vendor

This is why proper GRN verification before payment is critical — reversals create significant accounting complexity and potential for disputes.
