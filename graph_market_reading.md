# Graph Reading & Market Reading — A Complete Field Guide

**Companion to:** [course_start.md](course_start.md) (expands Modules 3–6 into a full reference)
**Context:** Indian markets (NSE/BSE) · Charts: TradingView or your broker's platform

This document has two halves that mirror the two skills:

- **Part I — Graph (Chart) Reading:** extracting information from a single chart — price, volume, structure, patterns.
- **Part II — Market Reading:** understanding the whole market's condition — flows, breadth, sectors, macro, sentiment.

A chart tells you about *one stock*. Market reading tells you about the *tide*. Roughly three-quarters of a stock's daily move is explained by the market and its sector, not the company — which is why great chart reads fail in bad markets, and mediocre setups work in strong ones. You need both skills, in that order of priority: **tide first, boat second.**

---

# PART I — GRAPH READING

## 1. What a chart actually is

A price chart is not a picture of a company — it is a **record of every transaction**, which means a record of human decisions made under greed and fear. Every candle is an auction result. When you read a chart you are answering one question over and over:

> **"Who is in control right now — buyers or sellers — and where does that control change?"**

Everything below — candles, levels, trendlines, patterns, volume — is just a different instrument for answering that question. If a tool doesn't help answer it, discard the tool.

### The fixed reading order

Read every chart in this exact order. It prevents the beginner error of starting at indicators:

1. **Zoom out** — weekly/monthly: where is price in its multi-year story?
2. **Trend structure** — daily: higher highs/higher lows, or lower highs/lower lows, or a range?
3. **Levels** — where are the zones price has respected?
4. **Volume** — is participation confirming or contradicting the move?
5. **Candles at key locations** — who won the recent sessions *at the levels that matter*?
6. **Indicators last** — RSI/MACD as confirmation only.

---

## 2. Candlestick reading — beyond pattern names

(Fundamentals are in course Module 3; this section is the field-usage layer.)

### 2.1 Read candles as sentences, not symbols

Don't ask "which pattern is this?" Ask three questions of any candle:

1. **Where did it close within its range?** Close near the high = buyers finished in control. Close near the low = sellers did. Close mid-range = unresolved.
2. **How big is it relative to recent candles?** A giant candle after quiet ones = new information arrived, someone acted with size. A shrinking series = energy draining.
3. **What was rejected?** Long wicks mark prices the market visited and refused. A long lower wick *at support* = sellers tried to break it and were absorbed. The same wick mid-range = noise.

### 2.2 Location is 80% of the meaning

The identical hammer candle means:
- **At tested support after a decline** → buyers defended a watched level. Meaningful.
- **In the middle of a range** → nothing. Noise.
- **At resistance** → actually mildly *bearish* context (price is stalling where sellers live).

Rule: **first find the location (levels, trend), then read the candle.** A candle without location is a word without a sentence.

### 2.3 The handful of moments worth acting on

- **Reversal candle at a key zone:** hammer / bullish engulfing at strong support in an uptrend's pullback — the classic swing entry trigger.
- **Failure candle:** price pokes above resistance intraday, closes back below it (long upper wick through the level). Trapped breakout buyers now sit overhead — often precedes a sharp move down.
- **Conviction candle through a level:** a wide-bodied candle *closing* decisively beyond resistance on high volume — a real breakout looks like this. A weak poke with a small body is what false breakouts look like.
- **Inside candle after a big move:** a small candle contained within the prior big one — pause, not verdict. The break of the inside candle's range often sets the next direction.

---

## 3. Levels — the map layer

(Why levels exist — memory and regret — is course Module 4. Here: craft.)

### 3.1 Drawing levels properly

- **Draw zones (rectangles), not lines.** ₹476–484, not ₹480.00.
- **Fewer, stronger levels.** If your chart has 12 lines, you have none. Keep only zones with 2+ clear reactions or heavy consolidation. Weekly-chart levels outrank daily ones.
- **Wicks vs closes:** the zone should span from roughly the extreme wicks to the cluster of closes — that band is where the fight actually occurred.
- **Recency matters.** A level respected last month beats one from 2019; markets forget slowly but they do forget.

### 3.2 A practical level hierarchy (strongest first)

1. **All-time high / multi-year high** — the entire history of trapped buyers sits there; and once broken, blue-sky (no sellers at breakeven above).
2. **Weekly swing highs/lows** with multiple reactions.
3. **High-volume consolidation shelves** — months of sideways trade = enormous position memory.
4. **Prior breakout levels** (role-reversal zones) — the highest-quality *entry* locations.
5. **Round numbers** (₹100, ₹500, ₹1,000; NIFTY 22,000/22,500) — self-fulfilling order magnets.
6. **Gap edges** — unfilled gap zones often act as S/R on revisit.

### 3.3 How price behaves at a level — the four outcomes

1. **Clean rejection:** approach, reversal candle, departure. Level holds; trade the bounce with a stop beyond the zone.
2. **Clean break:** conviction candle through, ideally on volume. Level's role flips; the *retest* is your entry.
3. **False break (trap):** pierce, no follow-through, snap back inside. The most tradeable event on charts — trapped traders on the wrong side must unwind, fuelling the reverse move. A false break above resistance is a *short* signal; a false break below support (a "spring") is a *long* signal.
4. **Grind-through:** repeated testing until the level quietly gives way — each test consumes the resting orders. A level tested 5 times in a tightening pattern usually breaks.

---

## 4. Trendlines and channels

- A **trendline** connects rising swing lows (uptrend) or falling swing highs (downtrend). It needs **2 touches to draw, 3 to trust.**
- Trendlines are *diagonal levels* — the same memory logic. The steeper the line, the less durable: a 60° climb always breaks; that break usually means the trend is *slowing*, not reversing. Horizontal structure break (the last higher low) is the real reversal test.
- A **channel** adds a parallel line at the swing highs. In a rising channel: channel bottom = pullback-buy zone, channel top = profit-taking zone (not an auto-short in a strong trend).
- Don't force lines. If a trendline needs one wick ignored and another timeframe to look right, it isn't there. The chart owes you nothing.

---

## 5. Classical chart patterns — what they are and what they're worth

Patterns are just **structure + psychology given names.** Know the six that matter; treat them as context, never as certainties. Two honest warnings first:

- Patterns are only reliable **with volume confirmation and location context**, and even then they fail routinely. Trade them with stops, sized by course Module 7.
- Hindsight sees patterns everywhere; the right edge of a live chart is far messier. Bar-replay practice (TradingView) is the cure.

### 5.1 Continuation patterns (trend pauses)

- **Flag / pennant:** sharp move (the pole), then a small, tight, drifting pullback (the flag) on *shrinking volume*, then breakout in the trend's direction on rising volume. The shrinking volume is the tell — profit-taking, not reversal. Target ≈ pole length projected from the breakout.
- **Ascending triangle:** flat resistance + rising lows — buyers getting more aggressive against a fixed sell wall. Usually resolves upward; the flat line's break is the trigger.
- **Rectangle/range:** sideways between two zones. Trade the *break-and-retest*, or fade the edges only if the range is wide and well-established.

### 5.2 Reversal patterns (trend endings)

- **Double top / double bottom:** price fails twice at the same zone — the second failure proves demand (or supply) exhausted there. Confirmed only when the middle trough/peak ("neckline") breaks. Until then it's just a range.
- **Head and shoulders:** three pushes up, the middle one highest, the third failing lower — a trend making its last, weaker highs. The neckline break confirms; volume typically shrinks across the three pushes. Inverse H&S is the bottoming mirror. This is really just "trend structure failing" wearing a costume — if you can read HH/HL breakdown, you already read H&S.
- **Cup and handle** (O'Neil): a long rounded base, then a small pullback (handle) near the old high, then breakout. The rounded base = long accumulation; works best on weekly charts in fundamentally strong stocks.

### 5.3 The meta-skill behind all patterns

Every pattern reduces to the same two primitives: **a level being defended or broken**, and **volume telling you if the crowd agrees.** Master Sections 2–3 and you can read patterns you've never been taught — and skip the 40-pattern encyclopedias entirely.

---

## 6. Volume — conviction measurement

(Basics in course Module 5; the field checklist:)

| Price | Volume | Reading |
|---|---|---|
| Rising | Rising | Healthy trend — demand real |
| Rising | Falling | Suspect — fewer buyers at each new high |
| Falling | Rising | Distribution — sellers urgent, be defensive |
| Falling | Falling | Ordinary pullback — often just profit-taking |
| Breakout | 2–3× average | Believable breakout |
| Breakout | Below average | False-break candidate — wait for retest |
| Extended trend | Massive spike | Climax — possible exhaustion, tighten stops |

Also worth knowing: **delivery percentage** (NSE publishes daily) — what fraction of traded volume was actually taken to demat vs intraday churn. Rising price + rising delivery % = investors accumulating, not just traders scalping. A uniquely Indian data edge; check it on big up-days.

---

## 7. Multi-timeframe reading — the top-down routine

The same stock, three altitudes, three questions:

1. **Weekly — the context.** Which regime (above/below 200-week trend)? Where in the multi-year structure — basing, mid-trend, extended, breaking down? Which weekly levels approach?
2. **Daily — the setup.** Trend structure (HH/HL?), the levels in play this month, the current setup if any (pullback to zone? consolidation under resistance?).
3. **Hourly/15-min — the trigger.** Only after weekly+daily agree: the precise entry event (reversal candle at the zone, break of an inside bar) and the tightest valid stop.

**The alignment rule:** trade only when higher timeframes agree with your direction. A daily buy-setup *against* a weekly downtrend is a countertrend scalp with poor odds. When timeframes conflict, the higher one wins — or you stand aside. Standing aside is a position.

**Common trap — timeframe demotion:** you enter off a daily setup, it goes against you, and you "manage" it by finding hope on the 15-minute chart. The timeframe that put you in is the only one allowed to take you out.

---

## 8. A complete worked read (the template)

Practice writing this exact one-page read nightly. Example of the *form* (invent nothing less specific than this):

> **Stock X — daily read, evening.**
> **Weekly:** long-term uptrend, above rising 200-week average; three-month consolidation ₹950–1,050 after a strong rally; big weekly level ₹1,050 (twice rejected).
> **Daily:** structure intact (last HL at ₹955); currently five tightening candles under ₹1,050 — ascending-triangle-ish; volume shrinking through the squeeze (coiling, not distributing).
> **Levels:** resistance ₹1,045–1,055; supports ₹995–1,005 (prior breakout shelf) and ₹950–960 (structure low).
> **Volume:** dull inside the squeeze — fine; needs 2× average on any break to trust it.
> **Plan (falsifiable):** *If* daily close above ₹1,055 on ≥2× volume → buy the retest of ₹1,050 zone, stop below ₹1,020 (last pivot inside), first target ₹1,150 (measured move), R:R ≈ 1:3. *If* it breaks ₹995 instead → setup void, stand aside. No trade before the trigger.

Note what makes it professional: every claim is checkable tomorrow, the *no-trade* condition is explicit, and the stop is where the idea is wrong — not where the loss feels acceptable.

---

# PART II — MARKET READING

Chart reading is the microscope; market reading is the weather report. This half is about answering, every day, the question: **"What kind of market is this, and how aggressive should I be in it?"**

## 9. The four market states

Before any macro detail, classify the current state — every strategy behaves differently in each:

1. **Trending up (risk-on):** index in HH/HL, breadth broad, dips get bought within days. Breakouts follow through. *Be aggressive; pullback-buys and breakouts both work.*
2. **Trending down:** LH/LL, rallies sold, bad news punished hard, good news ignored. Longs bleed. *Be defensive; capital preservation is the trade. Most beginners' losses come from applying bull-market habits here.*
3. **Rangebound:** index oscillating in a band, sector churn beneath. Index breakouts fail; stock-specific moves still work. *Reduce size, fade extremes or hunt only the strongest individual setups.*
4. **High-volatility / event-driven:** VIX elevated, gaps both ways, levels sliced through. *Smallest size or stand aside; stops don't protect against gaps.*

You can identify the state with tools you already have: index trend structure + breadth + VIX. Re-assess weekly; write it at the top of your journal.

## 10. Breadth — how healthy is the move?

The index can lie: it is weighted, so 5 heavyweights can carry it to highs while 400 stocks decline. Breadth exposes this.

- **Advance/decline (daily):** 1,500 advances vs 500 declines = broad participation; an index up-day with *negative* A/D = narrow, heavyweight-driven, fragile.
- **% of stocks above their 200-DMA:** the structural health gauge. Above ~70% = broad bull (also: getting stretched). Below ~30% = washed out (also: where durable bottoms form). **Divergence is the signal:** index makes a new high while this % makes a lower high → the army is thinning behind the flag — a classic late-cycle warning that has preceded most major tops.
- **New 52-week highs vs lows:** expanding highs list = healthy; index at highs while the new-lows list *grows* = rot beneath the surface.
- **Midcap/smallcap indices vs NIFTY:** risk appetite gauge. Small/midcaps leading = confident market; NIFTY grinding up while smallcaps bleed = institutions hiding in liquid large-caps — defensive behavior wearing a bullish mask.

## 11. Flows — whose money is moving?

- **FII flows:** foreign money, rate- and currency-sensitive, drives medium-term trends. One day is noise; **20-day cumulative flow** is signal. Sustained FII selling has accompanied nearly every meaningful Indian correction. Note: check *cash-market* figures — headline numbers mixing F&O positions mislead.
- **DII flows:** mutual funds + insurers, powered by ~monthly SIP autopilot — a structural, price-insensitive bid that has made post-2020 corrections shallower and V-shaped recoveries common. The classic tug-of-war: FIIs sell ₹2,000 cr, DIIs buy ₹1,800 cr → market falls less than the headline fear suggests.
- **Bulk/block deals** (published daily): what smart money did in specific stocks. **Promoter buying** in a beaten-down stock is one of the most reliable positive tells; sustained promoter *selling* deserves suspicion regardless of the stated reason.
- **Primary-market supply:** heavy IPO/QIP season drains money from the secondary market — frothy IPO frenzies (huge oversubscription, big listing pops in junk) are themselves a late-cycle sentiment reading.

## 12. Sector rotation — where the money hides

The index can go nowhere for a year while enormous trends run inside sectors. Institutions rotate: the classic cycle logic —

- **Early recovery / rate cuts expected:** banks & financials, autos, real estate lead (rate-sensitive).
- **Confident expansion:** capital goods, infrastructure, industrials, PSUs.
- **Late cycle / global strength:** metals, energy (commodity-driven).
- **Fear / slowdown:** money hides in FMCG, pharma, IT (defensive earnings) — **defensives outperforming is itself a market-reading signal:** the crowd is scared even if the index hasn't fallen yet.
- **INR weakness:** IT and pharma (dollar earners) get a tailwind.

**Weekly routine:** rank the sector indices (Bank, IT, Auto, Pharma, FMCG, Metal, Energy, PSU Bank, Realty, Infra) by distance from their 52-week highs and by 1-month/3-month returns. Ask: *what just broke to new highs? what is basing after a long decline? what just broke down?* Trade long setups primarily in the leading sectors — a mediocre chart in a leading sector outperforms a beautiful chart in a bleeding one, because the sector is ~a third of the stock's move.

## 13. Macro dashboard — the six dials

(Full explanations in course Module 6. The operational dashboard:)

| Dial | Where | What to note |
|---|---|---|
| RBI repo rate & stance | RBI MPC (~every 2 months) | Direction + surprise vs expectations |
| CPI inflation | Monthly print | Above/below RBI's comfort (~4±2%) |
| Crude (Brent) | Daily | Sustained >$90–100 = India headwind |
| USD/INR | Daily | Fast weakening = FII-outflow pressure; helps IT |
| US markets & Fed | Overnight + ~8 meetings/yr | Sets the day's opening tone via GIFT Nifty |
| 10-yr G-sec yield | Weekly | Rising = valuation gravity, banks' bond books hit |

The skill is not knowing each number — it's knowing **which dial the market is currently obsessed with.** Markets fixate on one variable at a time (some months everything is a crude story; others, everything is Fed). Identify the current obsession from what headlines accompany big moves; that dial explains the tape until the obsession shifts.

## 14. Sentiment & positioning — the contrarian layer

- **India VIX:** ~10–12 = complacency (fuel for shocks; also when option *buying* is cheap); 25+ = panic (historically near durable bottoms — the hardest time to buy is usually the right one). Trend matters: VIX rising *while the index also rises* = smart money paying up for protection into strength — a warning.
- **Put-call ratio (PCR):** useful only at extremes — very low = crowd all-bullish (contrarian caution), very high = fear washed out.
- **Anecdotal sentiment (free and underrated):** when household WhatsApp groups discuss stocks, IPO frenzies get oversubscribed 100×, and finfluencer subscriber counts explode → late cycle. When nobody wants to discuss the market at all → basing. Lefèvre knew this in 1923; nothing changed.
- The discipline: sentiment extremes are for **adjusting aggression**, not for standalone reversal trades. "Overheated" markets can overheat for another year. Combine with breadth divergence + structure break before turning bearish in size.

## 15. The daily & weekly market-reading routine

**Daily (10–15 min, evening):**
1. NIFTY + Bank Nifty: candle, structure, nearest levels.
2. A/D and sector heatmap: who led, who lagged, broad or narrow?
3. FII/DII cash figures → running 20-day mental tally.
4. VIX level and direction.
5. Anything on tomorrow's calendar (results, RBI, Fed, expiry)?
6. → Journal: 5 lines + *"market state: trending-up / down / range / volatile — aggression level X/5."*

**Weekly (30 min, weekend):**
1. Weekly candles: NIFTY, Bank Nifty, midcap/smallcap indices.
2. Sector ranking (Section 12) — new leaders/breakdowns?
3. Breadth check: % above 200-DMA, new highs vs lows.
4. Cumulative flows for the month.
5. Next week's event map.
6. → One-paragraph *market state memo:* state, evidence, leading sectors, key risk, plan.

Six months of this routine builds the thing no course sells: **context.** You'll start recognizing "this feels like a distribution week" or "this dip smells like the ones that get bought" — not mysticism, just accumulated pattern exposure, which is the actual meaning of "market reading."

---

## 16. How the two skills combine — the funnel

The complete process, top down:

1. **Market state** (Part II): what kind of market? → sets aggression and direction bias.
2. **Sector** (Part II): where is money flowing? → sets the hunting ground.
3. **Stock chart** (Part I): weekly context → daily structure & levels → setup.
4. **Trigger & risk** (Part I + course Module 7): candle trigger at the level, stop where the idea dies, size from the 1% formula.

A trade that passes all four filters is rare — a few per week, not per hour. That's correct. Selectivity *is* the edge; the market pays for patience and charges for activity.

---

*Compiled July 2026. Companion to course_start.md — the practice schedules and checkpoints there apply to everything here. Education, not investment advice.*
