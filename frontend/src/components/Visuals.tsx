import type { JSX } from 'react'

/*
 * Hand-drawn SVG teaching visuals, matched to lessons by title keywords.
 * All use the app's dark theme palette and scale to container width.
 */

const G = '#22c55e'
const R = '#ef4444'
const W = '#f59e0b'
const TXT = '#dbe4f3'
const MUT = '#8b9bb8'
const GRID = '#24334f'

function CandleAnatomy() {
  return (
    <svg viewBox="0 0 640 265" role="img" aria-label="Candlestick anatomy">
      <text x="320" y="20" textAnchor="middle" fill={MUT} fontSize="12">One candle = one session's auction: Open, High, Low, Close</text>
      {/* bullish */}
      <line x1="180" y1="32" x2="180" y2="235" stroke={G} strokeWidth="2" />
      <rect x="155" y="75" width="50" height="110" fill={G} rx="2" />
      <line x1="112" y1="32" x2="172" y2="32" stroke={GRID} /><text x="104" y="36" textAnchor="end" fill={MUT} fontSize="12">High</text>
      <line x1="112" y1="75" x2="150" y2="75" stroke={GRID} /><text x="104" y="79" textAnchor="end" fill={MUT} fontSize="12">Close</text>
      <line x1="112" y1="185" x2="150" y2="185" stroke={GRID} /><text x="104" y="189" textAnchor="end" fill={MUT} fontSize="12">Open</text>
      <line x1="112" y1="235" x2="172" y2="235" stroke={GRID} /><text x="104" y="239" textAnchor="end" fill={MUT} fontSize="12">Low</text>
      <text x="180" y="258" textAnchor="middle" fill={G} fontSize="12">Bullish — buyers won the session</text>
      {/* bearish */}
      <line x1="460" y1="42" x2="460" y2="240" stroke={R} strokeWidth="2" />
      <rect x="435" y="90" width="50" height="100" fill={R} rx="2" />
      <line x1="468" y1="42" x2="528" y2="42" stroke={GRID} /><text x="536" y="46" fill={MUT} fontSize="12">High</text>
      <line x1="490" y1="90" x2="528" y2="90" stroke={GRID} /><text x="536" y="94" fill={MUT} fontSize="12">Open</text>
      <line x1="490" y1="190" x2="528" y2="190" stroke={GRID} /><text x="536" y="194" fill={MUT} fontSize="12">Close</text>
      <line x1="468" y1="240" x2="528" y2="240" stroke={GRID} /><text x="536" y="244" fill={MUT} fontSize="12">Low</text>
      <text x="460" y="258" textAnchor="middle" fill={R} fontSize="12">Bearish — sellers won the session</text>
    </svg>
  )
}

function CandlePatterns() {
  return (
    <svg viewBox="0 0 640 235" role="img" aria-label="Key candlestick patterns">
      {/* hammer */}
      <line x1="90" y1="58" x2="90" y2="172" stroke={G} strokeWidth="2" />
      <rect x="75" y="58" width="30" height="26" fill={G} rx="2" />
      <text x="90" y="196" textAnchor="middle" fill={TXT} fontSize="12">Hammer</text>
      <text x="90" y="212" textAnchor="middle" fill={MUT} fontSize="10">sellers pushed, buyers absorbed</text>
      {/* shooting star */}
      <line x1="250" y1="30" x2="250" y2="148" stroke={R} strokeWidth="2" />
      <rect x="235" y="122" width="30" height="26" fill={R} rx="2" />
      <text x="250" y="196" textAnchor="middle" fill={TXT} fontSize="12">Shooting star</text>
      <text x="250" y="212" textAnchor="middle" fill={MUT} fontSize="10">rally rejected from above</text>
      {/* doji */}
      <line x1="410" y1="40" x2="410" y2="162" stroke={MUT} strokeWidth="2" />
      <rect x="393" y="98" width="34" height="5" fill={MUT} />
      <text x="410" y="196" textAnchor="middle" fill={TXT} fontSize="12">Doji</text>
      <text x="410" y="212" textAnchor="middle" fill={MUT} fontSize="10">open ≈ close, a stand-off</text>
      {/* bullish engulfing */}
      <line x1="545" y1="70" x2="545" y2="150" stroke={R} strokeWidth="2" />
      <rect x="533" y="85" width="24" height="46" fill={R} rx="2" />
      <line x1="588" y1="52" x2="588" y2="168" stroke={G} strokeWidth="2" />
      <rect x="574" y="62" width="28" height="90" fill={G} rx="2" />
      <text x="567" y="196" textAnchor="middle" fill={TXT} fontSize="12">Bullish engulfing</text>
      <text x="567" y="212" textAnchor="middle" fill={MUT} fontSize="10">buyers overwhelm in one bar</text>
    </svg>
  )
}

function SupportResistance() {
  return (
    <svg viewBox="0 0 640 305" role="img" aria-label="Support, resistance and role reversal">
      <rect x="40" y="80" width="560" height="22" fill="rgba(239,68,68,0.13)" stroke={R} strokeDasharray="5 4" rx="3" />
      <text x="46" y="74" fill={R} fontSize="12">Resistance zone (sellers' memory)</text>
      <rect x="40" y="210" width="290" height="22" fill="rgba(34,197,94,0.13)" stroke={G} strokeDasharray="5 4" rx="3" />
      <text x="46" y="250" fill={G} fontSize="12">Support zone (buyers' memory)</text>
      <polyline
        points="60,258 110,218 150,250 195,214 240,252 300,100 340,168 385,98 415,152 455,58 490,86 545,55 600,30"
        fill="none" stroke={TXT} strokeWidth="2" strokeLinejoin="round" />
      <circle cx="110" cy="218" r="4" fill={G} /><circle cx="195" cy="214" r="4" fill={G} />
      <circle cx="300" cy="100" r="4" fill={R} /><circle cx="385" cy="98" r="4" fill={R} />
      <text x="440" y="46" fill={G} fontSize="12">Breakout ↑</text>
      <circle cx="490" cy="86" r="5" fill="none" stroke={G} strokeWidth="2" />
      <text x="628" y="120" textAnchor="end" fill={G} fontSize="11">Retest — broken resistance</text>
      <text x="628" y="134" textAnchor="end" fill={G} fontSize="11">becomes support (role reversal)</text>
      <text x="46" y="292" fill={MUT} fontSize="11">Zones, not lines — the fight happens in a price band, and each touch consumes the resting orders.</text>
    </svg>
  )
}

function TrendStructure() {
  return (
    <svg viewBox="0 0 640 285" role="img" aria-label="Trend structure: higher highs and higher lows">
      <text x="40" y="26" fill={MUT} fontSize="12">Uptrend = higher highs (HH) + higher lows (HL). It breaks when the last HL gives way.</text>
      <polyline
        points="40,240 120,150 170,190 250,110 300,160 380,80 430,130 500,105 600,215"
        fill="none" stroke={TXT} strokeWidth="2" strokeLinejoin="round" />
      <circle cx="120" cy="150" r="4" fill={G} /><text x="120" y="138" textAnchor="middle" fill={G} fontSize="11">HH</text>
      <circle cx="250" cy="110" r="4" fill={G} /><text x="250" y="98" textAnchor="middle" fill={G} fontSize="11">HH</text>
      <circle cx="380" cy="80" r="4" fill={G} /><text x="380" y="68" textAnchor="middle" fill={G} fontSize="11">HH</text>
      <circle cx="170" cy="190" r="4" fill={G} /><text x="170" y="207" textAnchor="middle" fill={G} fontSize="11">HL</text>
      <circle cx="300" cy="160" r="4" fill={G} /><text x="300" y="177" textAnchor="middle" fill={G} fontSize="11">HL</text>
      <circle cx="430" cy="130" r="4" fill={G} /><text x="430" y="147" textAnchor="middle" fill={G} fontSize="11">HL</text>
      <circle cx="500" cy="105" r="4" fill={W} /><text x="500" y="93" textAnchor="middle" fill={W} fontSize="11">LH ⚠ failed to make a new high</text>
      <line x1="430" y1="130" x2="620" y2="130" stroke={R} strokeDasharray="5 4" />
      <text x="620" y="122" textAnchor="end" fill={R} fontSize="11">last higher low</text>
      <text x="560" y="245" textAnchor="middle" fill={R} fontSize="12">structure broken — trend over</text>
    </svg>
  )
}

function VolumeConfirm() {
  const bars: Array<[number, number, string]> = [
    [40, 45, G], [80, 55, G], [120, 24, GRID], [160, 62, G], [200, 26, GRID],
    [240, 72, G], [280, 34, GRID], [320, 26, GRID], [360, 20, GRID], [400, 18, GRID],
    [440, 16, GRID], [480, 96, G], [520, 60, G], [560, 50, G],
  ]
  return (
    <svg viewBox="0 0 640 285" role="img" aria-label="Volume confirms price">
      <polyline
        points="40,150 100,112 150,132 210,88 260,110 320,62 360,76 400,72 440,80 480,34 540,48 600,20"
        fill="none" stroke={TXT} strokeWidth="2" strokeLinejoin="round" />
      {bars.map(([x, h, c]) => (
        <rect key={x} x={x - 11} y={260 - h} width="22" height={h} fill={c} rx="2"
          stroke={x === 480 ? '#fff' : 'none'} strokeWidth="1.5" />
      ))}
      <text x="140" y="185" textAnchor="middle" fill={G} fontSize="11">volume expands with the trend</text>
      <text x="395" y="185" textAnchor="middle" fill={MUT} fontSize="11">dries up in consolidation</text>
      <text x="480" y="145" textAnchor="middle" fill={G} fontSize="11">breakout on 2–3× volume = believable</text>
      <text x="40" y="278" fill={MUT} fontSize="11">Price says what happened; volume says how much conviction was behind it.</text>
    </svg>
  )
}

function OptionPayoff() {
  return (
    <svg viewBox="0 0 640 300" role="img" aria-label="Bull call spread payoff diagram">
      <text x="50" y="28" fill={MUT} fontSize="12">Bull call spread at expiry — buy 22,000 CE @ ₹200, sell 22,200 CE @ ₹110 (net cost ₹90)</text>
      <line x1="50" y1="170" x2="610" y2="170" stroke={MUT} strokeDasharray="4 4" />
      <text x="608" y="162" textAnchor="end" fill={MUT} fontSize="10">P&amp;L ₹0</text>
      <line x1="240" y1="55" x2="240" y2="265" stroke={GRID} strokeDasharray="3 4" />
      <line x1="420" y1="55" x2="420" y2="265" stroke={GRID} strokeDasharray="3 4" />
      <polyline points="60,224 240,224 321,170" fill="none" stroke={R} strokeWidth="2.5" />
      <polyline points="321,170 420,104 600,104" fill="none" stroke={G} strokeWidth="2.5" />
      <circle cx="321" cy="170" r="5" fill="#fff" />
      <text x="321" y="150" textAnchor="middle" fill="#fff" fontSize="11">Breakeven 22,090</text>
      <text x="140" y="245" textAnchor="middle" fill={R} fontSize="11">Max loss −₹90 (capped)</text>
      <text x="510" y="90" textAnchor="middle" fill={G} fontSize="11">Max profit +₹110 (capped)</text>
      <text x="240" y="284" textAnchor="middle" fill={MUT} fontSize="11">22,000 (buy CE)</text>
      <text x="420" y="284" textAnchor="middle" fill={MUT} fontSize="11">22,200 (sell CE)</text>
      <text x="600" y="284" textAnchor="end" fill={MUT} fontSize="10">NIFTY at expiry →</text>
    </svg>
  )
}

function RiskSizing() {
  return (
    <svg viewBox="0 0 640 250" role="img" aria-label="Position sizing from stop distance">
      <rect x="60" y="60" width="320" height="90" fill="rgba(34,197,94,0.10)" />
      <rect x="60" y="150" width="320" height="55" fill="rgba(239,68,68,0.10)" />
      <line x1="60" y1="60" x2="380" y2="60" stroke={G} strokeWidth="2" />
      <text x="390" y="64" fill={G} fontSize="12">Target ₹474</text>
      <line x1="60" y1="150" x2="380" y2="150" stroke={TXT} strokeWidth="2" />
      <text x="390" y="154" fill={TXT} fontSize="12">Entry ₹450</text>
      <line x1="60" y1="205" x2="380" y2="205" stroke={R} strokeWidth="2" />
      <text x="390" y="209" fill={R} fontSize="12">Stop ₹438</text>
      <text x="220" y="110" textAnchor="middle" fill={G} fontSize="12">Reward ₹24 = 2R</text>
      <text x="220" y="183" textAnchor="middle" fill={R} fontSize="12">Risk ₹12 = 1R</text>
      <text x="490" y="85" fill={MUT} fontSize="12">Capital ₹2,00,000</text>
      <text x="490" y="110" fill={MUT} fontSize="12">Risk 1% = ₹2,000</text>
      <text x="490" y="135" fill={MUT} fontSize="12">Stop distance = ₹12</text>
      <text x="490" y="160" fill={MUT} fontSize="12">Size = 2,000 ÷ 12</text>
      <text x="490" y="188" fill="#fff" fontSize="14" fontWeight="700">= 166 shares</text>
      <text x="60" y="238" fill={MUT} fontSize="11">Size comes from the stop distance — never from conviction.</text>
    </svg>
  )
}

function BreadthDivergence() {
  return (
    <svg viewBox="0 0 640 265" role="img" aria-label="Breadth divergence warning">
      <polyline points="40,140 140,95 240,120 340,70 440,98 540,50" fill="none" stroke={TXT} strokeWidth="2" strokeLinejoin="round" />
      <line x1="340" y1="70" x2="540" y2="50" stroke={G} strokeDasharray="5 4" />
      <circle cx="340" cy="70" r="4" fill={G} /><circle cx="540" cy="50" r="4" fill={G} />
      <text x="540" y="36" textAnchor="end" fill={G} fontSize="12">Index: higher high ✓</text>
      <polyline points="40,225 140,188 240,208 340,178 440,205 540,198" fill="none" stroke={MUT} strokeWidth="2" strokeLinejoin="round" />
      <line x1="340" y1="178" x2="540" y2="198" stroke={W} strokeDasharray="5 4" />
      <circle cx="340" cy="178" r="4" fill={W} /><circle cx="540" cy="198" r="4" fill={W} />
      <text x="540" y="228" textAnchor="end" fill={W} fontSize="12">Breadth: lower high ⚠ fewer stocks participating</text>
      <text x="40" y="252" fill={MUT} fontSize="11">Breadth (e.g. % of stocks above their 200-DMA) thinning while the index rises = narrow, fragile rally.</text>
    </svg>
  )
}

interface Visual {
  title: string
  Comp: () => JSX.Element
}

const RULES: Array<{ pattern: RegExp; visuals: Visual[] }> = [
  { pattern: /anatomy of a cand/i, visuals: [{ title: 'Candlestick anatomy', Comp: CandleAnatomy }] },
  { pattern: /multi-candle|patterns worth|moments worth|read candles/i, visuals: [{ title: 'The patterns that matter', Comp: CandlePatterns }] },
  { pattern: /candle|price action/i, visuals: [
    { title: 'Candlestick anatomy', Comp: CandleAnatomy },
    { title: 'The patterns that matter', Comp: CandlePatterns },
  ] },
  { pattern: /support|resistance|level|role reversal/i, visuals: [{ title: 'Support, resistance & role reversal', Comp: SupportResistance }] },
  { pattern: /trend|dow theory|chart pattern/i, visuals: [{ title: 'Trend structure — and how it breaks', Comp: TrendStructure }] },
  { pattern: /volume/i, visuals: [{ title: 'Volume confirms (or contradicts) price', Comp: VolumeConfirm }] },
  { pattern: /option|payoff|greek|spread|straddle|futures|f&o/i, visuals: [{ title: 'Defined-risk payoff: bull call spread', Comp: OptionPayoff }] },
  { pattern: /risk management|position siz|1% rule|expectancy|survival math|portfolio-level/i, visuals: [{ title: 'Position sizing from the stop distance', Comp: RiskSizing }] },
  { pattern: /breadth|market reading|market state|flows|macro/i, visuals: [{ title: 'Breadth divergence — the narrow-rally warning', Comp: BreadthDivergence }] },
]

/** Picks teaching visuals for a lesson by keyword-matching its title (module title as fallback context). */
export function getVisualsFor(lessonTitle: string, moduleTitle: string): Visual[] {
  for (const rule of RULES) {
    if (rule.pattern.test(lessonTitle)) return rule.visuals
  }
  for (const rule of RULES) {
    if (rule.pattern.test(moduleTitle)) return rule.visuals.slice(0, 1)
  }
  return []
}
