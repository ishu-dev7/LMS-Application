# Share Market Mastery — The Complete Course (Basic to Advanced)

**Context:** Indian markets (NSE/BSE) · **Cost:** ₹0 (free resources only)
**Textbook companion:** Zerodha Varsity (varsity.zerodha.com) · **Charting:** TradingView (free tier)
**Realistic timeline:** 12–18 months to a tested, working skill set

This document is written as a self-contained textbook. Each module teaches the concepts in full, then gives you practice work and a checkpoint. Read in order — the sequence is deliberate. Most people fail because they learn strategies before foundations; this course reverses that.

**The golden rules:**
- No F&O (futures & options) trading until Modules 7–9 are complete. No exceptions.
- No meaningful real-money trading until Module 7.
- If a strategy, course, or influencer promises fast money, it is by definition wrong for you.

---

# PHASE 1 — FOUNDATIONS

## Module 0: Setup & Habits (Week 1)

Before learning anything, set up your tools and start the one habit that matters more than all the reading combined.

### What to set up

1. **A demat + trading account.** Any discount broker works: Zerodha, Upstox, Dhan, Fyers. The *demat account* (held with a depository — NSDL or CDSL) is where your shares live electronically, like a bank account for shares. The *trading account* (with the broker) is what places orders. Your bank account funds the trading account.
2. **A free TradingView account** for charts. Your broker's app has charts too, but TradingView is where you'll do your nightly practice.
3. **A journal.** A notebook or a simple text file. This is your most important tool.

### The daily journal habit (starts today, never stops)

Every market evening, write 5 lines:

1. What did NIFTY do today? (points and %)
2. Why? (your best guess — it's fine to be wrong)
3. FII/DII net buy/sell figures (published daily on the NSE website and most broker apps)
4. Which sectors led and which lagged?
5. What surprised you?

Why this works: reading about markets gives you vocabulary. The journal gives you *pattern recognition* — after 6 months you will start feeling "this looks like that week in October" and that intuition cannot be bought or taught. Every serious trader who lasts keeps some form of this.

### Your first purchase (₹500–2,000)

Buy a tiny quantity of a NIFTY 50 ETF (e.g., NIFTYBEES). Not for profit — because having real money in the market, even ₹500, makes everything you read stick. Watch how your order sits in the order book and executes. Read the contract note emailed to you that evening. Find every charge on it (you'll understand them fully in Module 2).

**Checkpoint:** Journal has 5 consecutive entries, and you can name every line item on your contract note.

---

## Module 1: What the Market Actually Is (Weeks 1–3)

**Companion reading:** Varsity Module 1 — *Introduction to Stock Markets*

### 1.1 What a share is

A share is fractional ownership of a company. If Infosys has ~415 crore shares outstanding and you own 100, you own 100/415-crore of Infosys — its offices, its contracts, its future profits. You benefit two ways: **dividends** (the company pays out part of its profit in cash) and **capital appreciation** (the business grows, so your slice becomes worth more).

Why do companies sell shares at all? To raise money without taking loans. When a private company first sells shares to the public, that's an **IPO (Initial Public Offering)** — the *primary market*, where money goes to the company. Everything after that — you buying Infosys from some other investor on the exchange — is the *secondary market*. The company gets nothing from secondary-market trades; shares just change hands between investors, and the price is set by supply and demand.

### 1.2 The exchanges: BSE and NSE

- **BSE (Bombay Stock Exchange)** — founded 1875, Asia's oldest. Benchmark index: **SENSEX** (30 large companies). Lists 5,000+ companies, many small and illiquid. Identifies stocks by numeric codes (Reliance = 500325).
- **NSE (National Stock Exchange)** — founded 1992, brought electronic trading to India. Benchmark: **NIFTY 50**. Dominates trading volume, especially derivatives — it is the world's largest derivatives exchange by contracts. Uses ticker symbols (RELIANCE, TCS).

Most large stocks trade on both. Prices stay nearly identical because arbitragers instantly buy on the cheaper exchange and sell on the costlier one, closing any gap.

### 1.3 What an index is

An index is a weighted average of selected stocks, built to represent "the market." NIFTY 50 = the 50 largest liquid NSE stocks, weighted by **free-float market cap** — company value counting only shares actually available for public trading (promoters' locked-in holdings are excluded). So when the news says "market rose 1%," it means this weighted basket rose 1%. Heavyweights like Reliance, HDFC Bank, and ICICI Bank move the index far more than the 50th stock. Indices rebalance semi-annually — stocks that shrink drop out, growers come in. This matters: an index is *self-cleaning*, which is a quiet reason index investing works.

### 1.4 The ecosystem — who does what

| Player | Role |
|---|---|
| **SEBI** | The regulator. Writes and enforces the rules for everyone below. |
| **Exchanges (NSE/BSE)** | Run the marketplace — the electronic order books where buyers meet sellers. |
| **Brokers** | Your gateway. You can't trade on the exchange directly; the broker routes your orders. |
| **Clearing corporations** | Guarantee every trade. If the person who sold you shares defaults, the clearing corporation makes you whole. This is why you never worry about the counterparty. |
| **Depositories (NSDL/CDSL)** | Hold everyone's shares electronically. Your broker gives you access; the depository has custody. |

### 1.5 The order book and the life of an order

Every stock has an electronic **order book**: a list of buy orders (bids) and sell orders (asks/offers), sorted by price. The highest bid and the lowest ask define the **spread**. A trade happens when a buyer and seller agree — i.e., orders match.

When you tap "Buy" on your app:
1. The broker validates the order (do you have funds/margin?) and sends it to the exchange.
2. The exchange matching engine checks the order book. Match found → trade executed, usually in milliseconds.
3. The clearing corporation steps in as guarantor.
4. **Settlement on T+1:** one working day later, shares arrive in your demat and money leaves your account (India settles faster than the US did for decades).

### 1.6 Order types — your basic toolkit

- **Market order:** "Buy now at whatever the best available price is." Fast, but in an illiquid stock you may get a worse price than the screen showed (**slippage**).
- **Limit order:** "Buy only at ₹450 or lower." Price control, but no guarantee of execution — price may never come to you.
- **Stop-loss order:** "If price falls to ₹438, sell me out." Your pre-decided exit that limits damage. A **SL-M** triggers a market order at the stop price; a **SL-L** triggers a limit order (safer from bad fills, but can fail to execute in a fast crash).
- **Product types:** **CNC** (Cash and Carry — delivery; you pay full price, shares go to demat, hold as long as you like) vs **MIS** (Margin Intraday Square-off — intraday only; broker gives leverage, but the position **must** close the same day; if you don't close it, the broker force-closes it around 3:15–3:20 PM and charges you a penalty fee).

### 1.7 Market timings

- **9:00–9:15 AM — pre-open session.** Orders collect without executing; at 9:07–9:08 the exchange computes a single equilibrium opening price. This absorbs overnight news so the open isn't chaotic.
- **9:15 AM–3:30 PM — normal continuous trading.**
- **3:40–4:00 PM — post-close** at the closing price. Also: **Muhurat trading**, a special one-hour session every Diwali.

### 1.8 Circuit breakers — the market's fuses

- **Index-level:** if NIFTY/SENSEX moves ±10%, ±15%, or ±20% in a day, trading halts market-wide for a cooling period (longer at each level; ±20% halts the day). Triggered during the COVID crash of March 2020.
- **Stock-level price bands:** stocks without derivatives get daily bands of 2/5/10/20% — price literally cannot trade beyond the band that day. You'll see "stock locked in upper circuit" — meaning only buyers remain and no one will sell.

### 1.9 Corporate actions — and why prices "drop" without bad news

- **Dividend:** company pays cash per share. On the **ex-date**, the price drops by roughly the dividend amount — you haven't lost anything; value moved from share price into your bank account.
- **Stock split:** a ₹2,000 share splits 1:10 into ten ₹200 shares. Your wealth is unchanged; shares just got more affordable/liquid.
- **Bonus issue:** free shares in ratio (1:1 = one free per one held). Price halves accordingly. Again — cosmetic, wealth unchanged.
- **Rights issue:** existing shareholders may buy new shares at a discount. The company is raising money; ask *why* it needs cash.
- **Buyback:** company repurchases its own shares — usually a signal management thinks the stock is cheap, and it raises earnings per remaining share.

The lesson: never judge a price chart without checking corporate actions. A 50% "crash" might be a 1:1 bonus. (Good charting platforms adjust historical prices automatically.)

### 1.10 IPOs in one paragraph

Company files a prospectus → price band announced → you bid via your broker (UPI blocks the funds) → oversubscribed issues allot by lottery (retail) → shares list on the exchange. Listing-day pops are common in bull markets and lure beginners; remember most of the easy listing gains go to allotment luck, and many hyped IPOs trade below issue price within a year. Read the prospectus's *risk factors* section — it's the most honest thing a company ever publishes.

**Checkpoint (quiz yourself or ask Claude):**
1. Trace a limit buy order end-to-end from your phone to shares in demat.
2. A stock closed at ₹500 and opens at ₹490 on ex-dividend date with a ₹10 dividend. Did investors lose money? Why not?
3. You bought shares as MIS and forgot about them. What happens at 3:20 PM?

---

## Module 2: Costs & Taxation (Weeks 3–4)

**Companion reading:** Varsity Module 7 — *Markets & Taxation*

### 2.1 The full cost stack

Every trade carries charges beyond brokerage. On a discount broker, delivery brokerage is usually ₹0 and intraday is ~₹20/order, but the government and exchanges always take their cut:

- **STT (Securities Transaction Tax)** — the big one on delivery: 0.1% on both buy and sell.
- **Exchange transaction charges** — small % paid to NSE/BSE.
- **Stamp duty** — on the buy side.
- **GST** — 18% on brokerage + transaction charges.
- **DP charge** — flat fee (~₹13–15 + GST) whenever shares *leave* your demat, i.e., per stock per sell day.
- **SEBI turnover fee** — tiny.

### 2.2 Worked example — ₹50,000 delivery trade (buy and later sell)

Approximate, discount broker:
- Brokerage: ₹0
- STT: 0.1% × ₹50,000 × 2 sides = **₹100**
- Transaction charges + SEBI fee + GST on them: ~**₹7**
- Stamp duty (buy): ~**₹8**
- DP charge on sell: ~**₹16**
- **Total ≈ ₹130, or ~0.26% round trip.** Your stock must rise ~0.26% just to break even.

Intraday on ₹50,000: brokerage ₹40 (two orders), but STT is lower (0.025%, sell side only ≈ ₹12), no DP charge → total ≈ ₹75–90. Charges look small per trade — but an intraday trader doing 3 round trips a day pays roughly ₹250/day ≈ **₹60,000/year** on this capital. Frequency is a hidden tax; this single fact should shape how often you trade.

### 2.3 Taxation (equity, current regime — verify rates before filing)

- **STCG (short-term capital gains):** shares sold within 12 months → taxed at a flat special rate (20% as of 2024's revision).
- **LTCG (long-term):** held over 12 months → 12.5% on gains above the annual ₹1.25 lakh exemption.
- **Intraday trading profit:** *speculative business income* — taxed at your slab rate.
- **F&O profit/loss:** *non-speculative business income* — slab rate; losses can offset other business income and carry forward. High-turnover F&O traders may need a tax audit.

Keep every contract note and a trade log from day one — reconstructing a year of trades in March is misery.

**Checkpoint:** Compute total charges and break-even % for (a) a ₹1,00,000 delivery round trip, (b) the same intraday. Explain why frequent trading has a structurally higher hurdle.

---

# PHASE 2 — CHART READING / TECHNICAL ANALYSIS

**A framing note before Phase 2.** Technical analysis is *not* fortune-telling. A chart is a record of every rupee that changed hands — a psychological X-ray of buyers and sellers. Reading it tells you where the pressure is, where trapped traders sit, where interest concentrates. It gives probabilities and locations, never certainties. Anyone who treats chart patterns as guarantees is reading tea leaves; anyone who ignores charts entirely throws away half the available information.

## Module 3: Candlesticks & Price Action (Weeks 5–8)

**Companion reading:** Varsity Module 2 (candlestick chapters) · Deeper: Steve Nison — *Japanese Candlestick Charting Techniques*

### 3.1 Anatomy of a candle

One candle summarizes one period (a day, an hour, 15 minutes) with four prices: **Open, High, Low, Close (OHLC)**.

- The **body** spans open→close. Close above open = bullish candle (green); close below open = bearish (red).
- The **wicks/shadows** stretch to the high and low — prices visited but *rejected*.

The candle is a story about who won the session:
- **Big green body, tiny wicks (bullish marubozu):** buyers dominated start to finish.
- **Long upper wick, small body near the low:** price rallied, sellers slammed it back down — the rally was *rejected*. After an uptrend this is a **shooting star** — a warning.
- **Long lower wick, small body near the high:** sellers pushed down, buyers absorbed everything and drove it back. After a downtrend this is a **hammer** — buyers defended that zone.
- **Doji (open ≈ close):** a stand-off. Meaningful mostly after strong trends, where a stalemate hints the trend is tiring.

### 3.2 Multi-candle patterns worth knowing

- **Bullish engulfing:** a red candle, then a green body that completely engulfs it — sellers had control and buyers overwhelmed them in one session. Bearish engulfing is the mirror.
- **Morning star:** big red → small indecisive candle → big green. A downtrend deflating, pausing, reversing. **Evening star** is the mirror at tops.
- **Harami:** a tiny candle inside the previous big one — momentum stalling.

### 3.3 The rule that makes or breaks candlestick reading: CONTEXT

A hammer *at a strong support level after a decline* means buyers defended a level everyone is watching — that's information. The same hammer in the middle of a random range means nothing. Candles are the last sentence of a paragraph; the paragraph is the trend and the levels (Module 4). Beginners memorize 40 pattern names and trade them everywhere — that's the mistake. Learn to read *any* candle as "who won, and where did rejection happen," and you no longer need the name.

### 3.4 Timeframes

The same market looks different per timeframe: a violent red 15-min candle may be an invisible blip on the weekly. Convention: **higher timeframe = context** (weekly/daily: trend, big levels), **lower timeframe = timing** (hourly/15-min: precise entries). Always read top-down. Swing traders live on daily charts; that's where you'll live for this course.

**Practice (daily, 30 min, 3+ weeks):** pick 5 NIFTY 50 stocks. Every evening, describe each stock's day-candle *in words* — who controlled the session, where was price rejected. Pattern names optional; the who-won reading is mandatory.

**Checkpoint:** Take any 5 candles from today's charts and explain each as a buyer/seller battle without needing a pattern name.

---

## Module 4: Support, Resistance & Trend Structure (Weeks 9–12)

**This is the single most valuable module in technical analysis. Do not rush it.**

### 4.1 What support and resistance really are

**Support** = a price zone where buying has repeatedly overwhelmed selling; falls halt there. **Resistance** = the opposite; rallies stall there. They exist because of *memory and regret*:

Imagine a stock bounced twice off ₹480. Traders who bought there are proud and will buy again. Traders who *missed* it regret it and place orders for next time. Traders short from ₹480 saw it bounce and will cover there. Three groups → buy pressure at ₹480 → self-fulfilling support. That's all "technical levels" are: coordination points of human memory.

Two consequences:
- **Levels are zones, not lines.** Not ₹480.00 — think ₹476–484. Draw rectangles, not hairlines.
- **The more times a level is tested and holds, the more visible it is — but each test consumes the buy orders sitting there.** A 5th test is often weaker than the 2nd. Level "strength" comes from: number of reactions, volume at the zone, how recent it is, and roundness (₹500, ₹1,000 attract orders simply because humans like round numbers).

### 4.2 Where levels come from

1. **Prior swing highs and lows** — the most recent peaks and troughs.
2. **High-volume consolidation zones** — where price spent a long time; many positions were opened there, so many people have feelings about it.
3. **Gaps** — empty zones from overnight jumps often act as levels when revisited.
4. **Round numbers.**
5. **All-time highs** — powerful resistance (everyone who bought the previous peak is waiting to "exit at breakeven"), and once broken, powerful support (no trapped sellers above — blue-sky territory).

### 4.3 Role reversal — the most useful S/R behavior

When resistance at ₹520 finally breaks and price runs to ₹560, ₹520 typically becomes *support* on the way back. Why: breakout buyers defend their entry; regretful non-buyers see their second chance; trapped shorts cover. The **retest of a broken level** is one of the highest-quality entry locations in all of trading — better than chasing the breakout itself.

### 4.4 Trend structure — the skeleton of every chart

- **Uptrend:** higher highs AND higher lows (HH/HL). Each dip bottoms above the last dip.
- **Downtrend:** lower highs AND lower lows (LH/LL).
- **Sideways/range:** neither — price oscillates between a floor and ceiling.

This simple definition is decision-grade:
- In an uptrend, **pullbacks to the region of the prior higher low are buying opportunities**, not emergencies.
- The uptrend is *questioned* when price fails to make a new high, and *broken* when it takes out the last higher low. That break is objective — no indicator needed.
- **Most strategies die in sideways markets.** Breakouts fail, trends don't follow through. Learning to recognize "this is a range — reduce activity" saves more money than any entry signal.

**Dow Theory's phase lens:** trends move through **accumulation** (smart money buys quietly; chart looks dull), **public participation** (the obvious trending phase — where trend-followers profit), and **distribution** (early buyers hand shares to the excited late public; volatile, toppy). You cannot label phases precisely in real time, but the lens keeps you asking the right question: *who is buying from whom right now?*

### 4.5 How to actually practice this

Every evening for **60+ days** (through Modules 4–6), on NIFTY + your 5 stocks:
1. Mark trend structure: label the recent swing highs/lows — HH/HL or LH/LL?
2. Draw S/R zones (rectangles) where price *actually reacted*, not where lines look pretty.
3. Write a falsifiable line: *"If price reaches X tomorrow, I expect a reaction because Y."*
4. Next evening, grade yesterday's call. Track your hit rate in the journal.

This feedback loop — prediction, result, correction — is the actual skill acquisition. The reading is just vocabulary.

**Checkpoint:** Your marked levels visibly get respected more often than not, and for each you can say *why that zone should matter* (whose memory lives there).

---

## Module 5: Volume, Moving Averages & Indicators (Weeks 13–16)

**Companion reading:** rest of Varsity Module 2 · Lifetime reference: John Murphy — *Technical Analysis of the Financial Markets*

### 5.1 Volume — the half of the chart most people ignore

Volume = shares traded per candle. Price says *what* happened; volume says *how much conviction* was behind it.

- **Healthy trend:** volume expands on moves *with* the trend, shrinks on pullbacks. Rallies on rising volume + quiet dips = real demand.
- **Suspect move:** price makes new highs on *shrinking* volume — fewer participants at each new price. Trend running on fumes.
- **Breakout test:** a resistance breakout on 2–3× average volume means broad participation — believable. The same breakout on thin volume is frequently a **false breakout**: price pokes above, finds no follow-through, collapses back and traps buyers. Volume is your first-line filter.
- **Climax:** an enormous volume spike after an extended trend often marks *exhaustion* — the last frantic wave of buyers (or panicked sellers) all acting at once, leaving no one left to continue the move. Extremes of volume tend to appear near extremes of price.

### 5.2 Moving averages — trend context, not signal machines

A moving average (MA) smooths the last N closes into a line. **EMA** (exponential) weights recent prices more than **SMA** (simple); for this course use EMAs: **20** (~1 trading month, short-term), **50** (medium), **200** (the long-term regime line).

Use them for *context*:
- Price above a rising 200 EMA → long-term uptrend regime; treat dips as opportunities until proven otherwise. Below a falling 200 EMA → be defensive; countertrend longs have poor odds.
- In steady trends, the 20/50 EMA zone often acts as dynamic support where pullback buyers step in.
- The slope of the MA matters as much as the side price is on. Flat MAs = rangebound = reduce activity.

What *not* to do: trade every MA crossover ("golden cross" etc.) mechanically. Crossovers work beautifully in trends and get whipsawed to death in ranges — and markets range more than they trend. The MA tells you what regime you're in; your levels and price action (Modules 3–4) time entries.

### 5.3 Two indicators only: RSI and MACD

**Rule: no indicator collecting.** Every indicator is derived from the same price series — five oscillators are one signal wearing five hats. More indicators = more noise and more excuses, not more edge.

**RSI (Relative Strength Index, 14-period)** — momentum on a 0–100 scale.
- The textbook says >70 overbought/sell, <30 oversold/buy. **The textbook use is a losing strategy in trends** — in a strong uptrend RSI can sit above 70 for weeks while price climbs relentlessly. "Overbought" ≠ "will fall"; it means "rising fast."
- Better uses: **(a) Regime ranges** — in uptrends RSI tends to oscillate ~40–80 (pullbacks bottoming near 40–50 = healthy); in downtrends ~20–60. **(b) Divergence** — price makes a new high but RSI makes a lower high: the new high came with less momentum. A warning to tighten stops, *never* a standalone reversal signal (divergences can stack up for months while trends continue).

**MACD** — two EMAs' difference plus a signal line; visualizes momentum shifts and confirms what structure already suggests. If price breaks a key level *and* MACD turns, you have agreement. If they disagree, trust price.

### 5.4 Gaps

Overnight news moves the open away from yesterday's close, leaving a gap. Three flavors: **breakaway** (out of a long base, high volume — starts trends; don't wait for it to fill), **runaway** (mid-trend continuation), **exhaustion** (late in a trend, gaps then reverses — trapping the last chasers). "Gaps always fill" is folklore — exhaustion gaps fill fast; breakaway gaps may never fill.

### 5.5 Putting it together — the reading order

Every chart, always in this order:
1. **Trend structure** (HH/HL or LH/LL? Which regime per the 200 EMA?)
2. **Levels** (where are the zones that matter?)
3. **Volume** (does it confirm or contradict the current move?)
4. *Then* indicators (RSI/MACD as confirmation only)

If you catch yourself starting with indicators, repeat this module. Indicators are seasoning; structure is the meal.

**Checkpoint:** Deliver a full four-step read of any chart, in the order above, out loud or to Claude.

---

# PHASE 3 — MARKET READING

## Module 6: Macro, Flows & Breadth (Weeks 15–20, then forever)

Charts tell you *what* is happening; this module is *why*. Markets are moved by money flows, and money flows respond to a handful of macro forces. In India, learn these six.

### 6.1 Interest rates (RBI policy)

The repo rate — what RBI charges banks — is gravity for all asset prices, through three channels: **(1) Discounting:** a stock's value is its future profits discounted to today; higher rates shrink present value, and hit long-duration growth stocks hardest. **(2) Credit:** costlier EMIs and corporate borrowing → less spending and investment → lower profits (autos, real estate, capital goods are rate-sensitive). **(3) Competition:** FDs at 8% lure money out of equities; FDs at 5% push money in.

The market moves on *expectations*, not events — a widely expected rate cut is priced in before it happens ("buy the rumor, sell the news"). The surprise vs. expectation is what moves prices. RBI's Monetary Policy Committee meets ~every two months; mark the dates.

### 6.2 Inflation (CPI)

Moderate inflation is fine; high inflation forces RBI to raise rates (see above) and squeezes both corporate margins and household spending. Monthly CPI prints move markets when they surprise.

### 6.3 Crude oil — India's special weakness

India imports ~85% of its crude. Rising crude worsens the trade deficit, weakens the INR, feeds inflation (fuel is in everything), and squeezes paint/aviation/tyre margins. Sustained crude above ~$100 has historically coincided with Indian market stress; falling crude is a quiet tailwind.

### 6.4 USD/INR

A weakening rupee: FIIs' returns shrink in dollar terms → can trigger FII selling → further weakness (a loop). IT companies earn dollars, so a weak INR *helps* them — one reason IT sometimes rallies while the broader market struggles.

### 6.5 FII/DII flows — the daily tug-of-war

**FIIs** (foreign institutions) drive medium-term trends; sustained multi-week FII selling has accompanied most Indian corrections. **DIIs** (domestic mutual funds and insurers, powered by monthly SIP inflows) have become a massive stabilizing counter-force — this is structural and has made post-2020 India more resilient to FII exits than in earlier decades. Check both figures daily (it's journal line 3). One day means nothing; a month of one-sided flow is a trend.

### 6.6 Breadth, VIX, and sector rotation

- **Breadth** = how many stocks participate. Advance/decline ratio; % of stocks above their 200 DMA. An index at highs while most stocks decline = a **narrow rally** carried by a few heavyweights — fragile. Broad participation = healthy.
- **India VIX** = the fear gauge implied by option prices. Low VIX (~10–12) = complacency (often precedes shocks); spiking VIX (25+) = panic (often near tradeable bottoms). Use as context, not as a timing signal.
- **Sector rotation:** money rotates — IT → banks → autos → pharma → PSUs... An index can go nowhere for months while huge trends run inside sectors. Weekly, rank sector indices (Nifty Bank, IT, Auto, Pharma, FMCG, Metal, PSU Bank, Realty): what's making new highs? What's basing after a long decline? Spotting where money is *flowing* is worth more than any indicator.

### 6.7 The event calendar

Know what's scheduled: RBI MPC (~every 2 months) · Union Budget (Feb 1) · quarterly results seasons (Apr, Jul, Oct, Jan) · monthly index F&O expiry · US Fed meetings (~8/year) and the overnight US close · monthly CPI prints. Overnight global cues + GIFT Nifty set the opening tone every single day.

**Practice:** journal deepens — connect each day's move to causes and flows. **Weekly market-state summary, 5 lines:** trend, breadth, flows, leading sectors, key risk ahead. Ask Claude to critique your reasoning.

**Checkpoint:** Four consecutive weekly summaries where your reasoning (not necessarily your prediction) holds up under critique.

---

# PHASE 4 — RISK, STRATEGIES & DERIVATIVES

## Module 7: Risk Management (Weeks 21–24) — before strategies, deliberately

A mediocre strategy with strict risk management outlives a brilliant strategy without it. This module is arithmetic — learn it cold.

### 7.1 The 1% rule and position sizing

Risk a fixed small percentage of capital per trade — classically **1%**. Note: *risk*, not *position size*. With ₹2,00,000 capital, 1% = ₹2,000 is the most a single losing trade may cost.

**Position size = (Capital × Risk%) ÷ (Entry − Stop-loss)**

Example: capital ₹2,00,000, risk ₹2,000. Entry ₹450, stop ₹438 → risk per share ₹12 → **166 shares** (₹74,700 position). If the stop is hit, you lose ~₹2,000. Precisely planned.

Two things follow:
- **Size comes from stop distance, never from conviction.** Feeling very sure is not a sizing input — your feelings have no edge.
- A tighter (valid) stop allows a *larger* position for the same risk. But never tighten a stop to buy more size — the stop goes where the trade idea is *invalidated* (below the support you bought, below the breakout level), not where sizing is convenient.

### 7.2 Why 1% — the survival math

Losses are asymmetric: lose 10%, need 11% to recover; lose 50%, need **100%**. Deep drawdowns are mathematically brutal *and* they destroy judgment — desperate traders take desperate trades.

Losing streaks are guaranteed by statistics, not caused by failure: a 50%-win-rate system has a ~26% chance of an 8-loss streak within 400 trades. At 1% risk that's a −8% drawdown — annoying, survivable. At 5% risk it's −34%; at 10% risk you're near ruin *running the same profitable system*. Risk sizing is what keeps randomness from killing you before your edge pays.

### 7.3 Expectancy — the only trade math that matters

**Expectancy = (Win% × Avg Win) − (Loss% × Avg Loss)** — what an average trade earns you.

Win rate alone is meaningless: a 40% win rate with avg win ₹4,000 / avg loss ₹1,500 → (0.40×4000) − (0.60×1500) = **+₹700/trade** — excellent. A 90% win rate with avg win ₹500 / avg loss ₹6,000 → **−₹150/trade** — slow ruin with a great-feeling win rate (this is exactly the profile of naked option selling done badly: many small wins, occasional catastrophes).

Consequences: judge no strategy on fewer than ~50 trades; protect expectancy by cutting losers per plan and *not* cutting winners early — the beginner's habit of snatching small profits and letting losses run inverts a good system into a losing one.

Demand **risk:reward ≥ 1:1.5–2** at entry (stop 10 points away → target ≥15–20 points away, and the target must be *plausible*, i.e., a real level from Module 4). At 1:2 you can be wrong 60% of the time and still profit.

### 7.4 Correlation and portfolio-level risk

Five 1%-risk trades in five PSU banks = one 5% bet, because they move together. Cap simultaneous risk in correlated names (~2% per sector/theme) and total open risk across everything (~5%). Also respect event risk: a stop-loss cannot protect you from an overnight gap through your stop — hence size conservatively on positions held through results days and other binary events.

**Checkpoint (compute, don't estimate):**
1. Capital ₹2,00,000, risk 1%, entry ₹450, stop ₹438 — quantity?
2. Win 45%, avg win ₹3,000, avg loss ₹1,500 — expectancy per trade? Per 100 trades?
3. Your system risks 2%/trade at a 50% win rate. Roughly how deep could a plausible bad streak take you? Comfortable?

---

## Module 8: Strategy Families & Building Your Own (Months 7–9)

**Companion reading:** Varsity Module 10 — *Trading Systems* · Philosophy: Schwager — *Market Wizards*

### 8.1 What a strategy actually is

Not a feeling, not a chart pattern you sometimes notice — a **written set of rules** covering setup, entry, stop, exit, size, and when *not* to trade. Written, because the moment real money moves, your brain becomes a rationalization machine; rules made calmly beat decisions made adrenalized. Every question answered *before* entry.

### 8.2 The families

**1. Swing/positional trading (days–weeks) — the recommended start.** Daily charts; decisions after market hours (no screen-watching); wide enough stops that noise doesn't shake you out; compatible with a day job. Two classic setups you already have the tools for:
- **Pullback-in-uptrend:** stock in HH/HL structure above rising 50 EMA pulls back to a support zone / prior breakout / 20–50 EMA area; wait for a bullish reversal candle at the zone (hammer, engulfing); stop below the zone; target the prior high or beyond (must clear 1:2).
- **Breakout with volume:** long consolidation range breaks upward on 2–3× volume; enter on the break or (higher quality) the retest of the broken level; stop back inside the range.

**2. Momentum investing (weeks–months).** Systematic: rank the universe (e.g., NIFTY 200) by 6–12-month returns, hold the top 10–20, rebalance monthly, exit what falls off the list. Closest to what has *academic* evidence behind it (the momentum factor); shallow decision-making per trade, discipline-heavy at rebalance. NSE even publishes momentum indices to study.

**3. Intraday — hardest, despite looking easiest.** Every cognitive weakness amplified, plus costs (Module 2's ₹60k/year lesson) and time consumed. Classic setups exist (opening-range breakout, VWAP reversion) but most people should delay intraday by a year or skip it. Nothing about shorter timeframes makes money easier — it makes discipline harder.

**4. Options strategies — after Module 9 only.**

### 8.3 Write your strategy document

Must answer, exactly and without vagueness:
1. **Universe** (e.g., NIFTY 200 above ₹100 with adequate liquidity)
2. **Setup conditions** (all must be true)
3. **Entry trigger** (the specific event that pulls the trigger)
4. **Stop-loss** (what invalidates the idea)
5. **Exit** (target at a real level / trailing method; minimum R:R)
6. **Size** (Module 7 formula, 1%)
7. **When NOT to trade** (results week for that stock, index in a violent range, VIX above X, max 3 open positions...)

The "when not to trade" section will save you more money than the entry rules.

### 8.4 The testing protocol — non-negotiable

1. **Backtest by hand:** scroll charts back 2–3 years (TradingView bar-replay hides the future), find **50–100 historical setups**, log each honestly in a spreadsheet — entry, stop, exit, R-multiple. Honesty note: your eye cheats in hindsight; bar-replay forces you to decide on the hard right edge. Log the marginal setups too, not just the beauties.
2. **Compute:** win rate, expectancy, max losing streak, max drawdown. Expectancy ≤ 0? Fix or discard — do not "feel" it will work live.
3. **Paper trade** live for 1–2 months (tests your process in real time, though not your emotions — paper losses don't hurt).
4. **Go live at minimum size** for 3–6 months. This is where emotions join. Expect to break your own rules and to be shocked that you did; the journal catches it.
5. **Journal every trade:** setup, entry, exit, R-result, emotional state, rule broken (if any). Review monthly: your worst pattern will be embarrassingly consistent — *that pattern, not the entry signal, is what you fix next.*

**Checkpoint:** a written strategy document + a 50-trade backtest log with computed expectancy — then hand both to Claude for an adversarial critique.

---

## Module 9: Futures & Options (Months 9–12)

**Companion reading:** Varsity Modules 4, 5, 6 · **Prerequisite:** Modules 7–8 complete. SEBI's own study: ~90% of retail F&O traders lose money. The 10% who don't are systematic about exactly the things below.

### 9.1 Futures

A futures contract = an agreement to buy/sell an underlying at a set price on a set expiry date, traded in fixed **lot sizes** (e.g., NIFTY lot = 75 units; one contract at 22,000 controls ~₹16.5 lakh of index).

- **Margin, not full payment:** you post SPAN + exposure margin (~12–15% for index futures) — leverage of ~7–8×. A 1% index move = ~8% move on your margin, both directions. Leverage is the whole story of why futures are dangerous: it amplifies your P&L *and* your emotions.
- **Mark-to-market daily:** losses are debited from your account *every evening*, in cash. You feel every tick.
- **Pricing:** futures trade near spot ± cost of carry; premium/discount and **open interest** (number of outstanding contracts) reveal positioning. Rising OI + rising price = new longs building (strong); rising price + *falling* OI = shorts covering (weaker fuel).
- Contracts expire monthly (last Thursday, currently); positions must be closed or **rolled** to the next month.

### 9.2 Options — the concepts that matter

A **call** gives the buyer the *right* (not obligation) to buy at a **strike price** by expiry; a **put**, the right to sell. The buyer pays a **premium**; that premium is the buyer's maximum loss. The **seller/writer** collects the premium and takes on the *obligation* — capped profit (the premium), potentially large loss.

**Premium = intrinsic value + time value.** NIFTY at 22,000: a 21,800 call is in-the-money (ITM) with ₹200 intrinsic; a 22,200 call is out-of-the-money (OTM), all time value. Time value is what buyers pay for *possibility*, and it melts to zero by expiry — which is the core economics: **buyers own possibility that decays; sellers rent it out and collect the decay.**

### 9.3 The Greeks — plain-language versions

- **Delta:** how much the premium moves per 1 point of underlying (≈0.5 ATM, →1 deep ITM, →0 far OTM). Also usable as a rough market-implied probability of expiring ITM. A 0.10-delta lottery-ticket option needs a *huge* move to pay — that's why cheap OTM options empty retail accounts.
- **Theta:** premium lost per day from time decay — accelerates in the final 1–2 weeks. The buyer's rent; the seller's income. Buy an option and get a sideways week, and you lose money *while being not-wrong*.
- **Vega:** sensitivity to **implied volatility (IV)** — the market's priced-in expectation of movement. IV inflates before big events (results, budget, elections) and collapses after — **IV crush**. The classic trap: buy a call before results, company beats estimates, stock rises 2%… option *falls*, because IV crush outweighed the move. You must be right on direction, size, *and* timing to beat inflated IV.
- **Gamma:** how fast delta changes. For sellers near expiry, small underlying moves swing P&L violently ("gamma risk") — why sellers respect expiry week.

### 9.4 Reading an option chain

The chain lists calls and puts across strikes with premium, IV, **OI** and change in OI. Big OI at a strike = crowd interest — heavy call OI above often behaves like resistance, heavy put OI below like support (option *writers* defend the strikes they've sold). **PCR** (put-call ratio) gauges sentiment at extremes; "max pain" is folklore-adjacent — know the terms, lean on none of them alone.

### 9.5 Strategies — defined risk first, always

**Rule: every option position must have a defined maximum loss until you have 2+ years of experience.** Naked selling has blown up professionals.

- **Bull call spread:** buy the 22,000 call (₹200), sell the 22,200 call (₹110) → net cost ₹90/lot-unit = max loss; max profit = 200-point spread − 90 = ₹110. Cheaper than a naked call, theta partly neutralized, everything capped and known.
- **Bear put spread:** the mirror, for downside views.
- **Credit spreads:** sell the nearer strike, buy a farther one as insurance — you collect net premium, profit if the underlying *doesn't* cross your short strike. Income with a known worst case.
- **Iron condor:** a call credit spread above + a put credit spread below → profit if the index stays in a range. The workhorse "boring income" structure; its enemy is a big trending move.
- **Straddles/strangles:** buying = betting on a big move either way (expensive; fights theta *and* IV crush); selling = collecting big premium against unlimited two-sided risk — many small wins, occasional account-ending loss (recall the Module 7 expectancy trap). Not for you yet.
- **Hedges:** covered call (own shares, sell an OTM call — rent on holdings); protective put (own shares, buy a put — insurance with a premium cost).

**Checkpoint:** (1) Sketch the bull-call-spread payoff above with breakeven (22,090). (2) You hold a long 22,200 call one week from expiry; NIFTY goes sideways for 4 sessions — what do theta and vega each do to you, and why can you lose without being wrong? (3) Explain why heavy call OI at a strike can act as resistance.

---

# PHASE 5 — ADVANCED & MASTERY (Year 2+)

## Module 10: Trading Psychology (start only AFTER real trades)

**Books:** Mark Douglas — *Trading in the Zone*; Morgan Housel — *The Psychology of Money*. Douglas means nothing until you've felt real money move — read it after months of live trading, not before.

The core reframe: **any single trade is a coin flip weighted slightly in your favor; the edge exists only across a series.** Internalize that, and a stopped-out trade is a business expense, not a verdict on you. Fail to internalize it, and you exhibit the four classic self-sabotages — learn their names and catch yourself:

1. **Revenge trading:** a loss "must be won back" immediately → oversized, low-quality trade → bigger loss. Antidote: a hard daily-loss limit; hit it, close the terminal.
2. **Moving the stop:** "it'll come back" → small planned loss becomes account damage. The stop is where your idea is *wrong*; moving it means trading hope.
3. **Averaging losers:** buying more of a falling position to "lower the average" — maximum size in your worst ideas, small size in your best. Invert it: add only to *winners*.
4. **Snatching winners:** taking +0.5R profits out of fear while letting −1R losses run — the exact inversion of expectancy (Module 7). The plan sets the exit, not the anxiety.

**Process over outcome:** you control rule-following, not results. A rule-following loss is a *good* trade; a lucky rule-breaking win is a *bad* trade that teaches your brain to gamble. Grade yourself weekly on process adherence only. Add an emotional column to the journal (state at entry and exit); after ~50 trades your one signature failure pattern will be obvious — fixing *that* is worth more than any new strategy.

## Module 11: Quantitative Thinking & Fundamental Depth

**Books:** Taleb — *Fooled by Randomness*; Graham — *The Intelligent Investor* (esp. ch. 8 & 20); Lynch — *One Up on Wall Street* · **Reading:** Varsity Module 3 in full

**The skeptic's toolkit:** Survivorship bias (you study winners because losers vanished — Taleb's point that a coin-flipping crowd always produces "geniuses"). Overfitting (tune rules to past data hard enough and they memorize noise; the fix is out-of-sample and walk-forward testing — Module 12). Luck vs. skill (in bull markets everything works; the market's return isn't your skill — compare against just holding NIFTY). Factor evidence: **momentum, value, quality, low-volatility** are the handful of premia with decades of academic support; most indicator folklore has none.

**Fundamental analysis in brief:** The three statements — P&L (profitability), balance sheet (what's owned/owed), **cash flow** (the honest one; profits are opinion, cash is fact — divergence between reported profit and operating cash flow is the classic red flag). Key ratios: ROE/ROCE (capital efficiency; >15–20% sustained = quality), debt-to-equity (leverage kills in downturns), margins and their *trend*, P/E vs growth (PEG ~1 as sanity check), P/B for banks/financials. Valuation: DCF as a logic (a business = its discounted future cash) rather than false precision; Damodaran's framing — a valuation is a **story quantified**, and the numbers are only as good as the story. Graham's two immortal ideas: **Mr. Market** (a moody counterparty quoting daily prices you're free to ignore — quotes serve you, not instruct you) and **margin of safety** (buy far enough below your value estimate that being partly wrong still turns out fine).

## Module 12: Systemization (optional, for programmers)

Turn your written rules into code: broker APIs (Zerodha Kite Connect, Dhan, Fyers) for data + execution; build a historical database from free NSE/BSE **bhavcopy** files; backtest with realistic costs and slippage; validate with **walk-forward testing** and out-of-sample data; guard against lookahead bias (accidentally using information unavailable at decision time — the #1 silent backtest killer). Run any bot on paper for months before live. Automation removes emotional errors and adds engineering errors — a bug can trade faster than you can panic.

---

# APPENDIX A — Resource Stack (all free/cheap)

| Purpose | Resource |
|---|---|
| Core textbook | Zerodha Varsity (web/app/PDF) + free Varsity Certified tests |
| Charting practice | TradingView free tier (bar replay for backtesting) |
| Official certifications | NISM Series VIII (Equity Derivatives), Series XV (Research Analyst) — workbooks free, exams ~₹1,500 |
| Exchange education | NSE Academy / Knowledge Hub, BSE Institute |
| Conceptual (global) | Robert Shiller's "Financial Markets" — Coursera, free to audit |
| Screening | Screener.in, Tickertape (free tiers) |
| Data | NSE/BSE sites: bhavcopy, FII/DII data, option chain, India VIX |

# APPENDIX B — Reading List by Stage

1. **Foundations:** Varsity Modules 1, 3, 7
2. **Charts:** Murphy — *Technical Analysis of the Financial Markets*; Nison — *Japanese Candlestick Charting Techniques*
3. **Philosophy/psychology:** Lefèvre — *Reminiscences of a Stock Operator*; Schwager — *Market Wizards*; Douglas — *Trading in the Zone*; Housel — *The Psychology of Money*
4. **Skepticism/quant:** Malkiel — *A Random Walk Down Wall Street*; Taleb — *Fooled by Randomness*; Kahneman — *Thinking, Fast and Slow*
5. **India-specific:** Nair — *Bulls, Bears and Other Beasts*; Basu & Dalal — *The Scam*
6. **Value investing:** Graham — *The Intelligent Investor*; Lynch — *One Up on Wall Street*; Buffett's shareholder letters (free at berkshirehathaway.com)

# APPENDIX C — Red Flags (memorize)

- Courses sold with Lamborghinis, "guaranteed returns," or "secret strategies"
- Telegram/WhatsApp tip groups; unregistered advisors (SEBI acts against these constantly)
- Finfluencers who earn from attention, not trading
- Any urge to trade F&O before Modules 7–9 are done
- Averaging down on losers; moving a stop "just this once"
- Confusing a bull-market portfolio with skill

# APPENDIX D — Progress Tracker

| Module | Status | Started | Completed | Checkpoint passed? |
|---|---|---|---|---|
| 0 — Setup & Habits | ☐ | | | |
| 1 — What the Market Is | ☐ | | | |
| 2 — Costs & Taxation | ☐ | | | |
| 3 — Candlesticks & Price Action | ☐ | | | |
| 4 — Support/Resistance & Trend | ☐ | | | |
| 5 — Volume, MAs & Indicators | ☐ | | | |
| 6 — Macro, Flows & Breadth | ☐ | | | |
| 7 — Risk Management | ☐ | | | |
| 8 — Strategy Building | ☐ | | | |
| 9 — Futures & Options | ☐ | | | |
| 10 — Psychology | ☐ | | | |
| 11 — Quant & Fundamentals | ☐ | | | |
| 12 — Systemization | ☐ | | | |

---

*Compiled July 2026. Market rules (settlement cycles, lot sizes, tax rates, SEBI F&O regulations) change — verify current specifics on NSE/SEBI/Varsity before acting. Education, not investment advice.*
