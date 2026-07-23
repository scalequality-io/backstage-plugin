import React from 'react';
import { EntitySignal } from '../api';

/**
 * The rich ScaleQuality widgets, ported 1:1 from the platform's Developers
 * gallery so the card looks identical inside Backstage. Everything is inline
 * SVG + inline styles (no Tailwind, no external assets), theme-aware via the
 * `dark` flag so it stays impeccable in both Backstage light and dark themes.
 */

type Tokens = ReturnType<typeof tokens>;

export function tokens(dark: boolean) {
  return {
    grid: dark ? 'rgba(255,255,255,0.13)' : '#e4e4e7',
    gridLabel: dark ? '#8c9099' : '#a1a1aa',
    muted: dark ? '#9aa0a6' : '#6b7280',
    text: dark ? '#e6e7ea' : '#27272a',
    track: dark ? 'rgba(255,255,255,0.10)' : '#ececef',
    panelBg: dark ? '#1e1f24' : '#ffffff',
    border: dark ? 'rgba(255,255,255,0.10)' : '#e7e3d9',
    headBg: dark ? 'rgba(255,255,255,0.03)' : '#faf9f7',
    emerald: '#10b981',
    emeraldText: dark ? '#34d399' : '#059669',
    teal: '#14b8a6',
    tealText: dark ? '#2dd4bf' : '#0d9488',
    rose: 'rgba(251,113,133,0.85)',
    badgeBg: 'rgba(16,185,129,0.15)',
    badgeText: dark ? '#34d399' : '#047857',
  };
}

// ── geometry (exact from the gallery) ──
const polar = (r: number, deg: number): [number, number] => [
  120 + r * Math.cos((deg * Math.PI) / 180),
  120 - r * Math.sin((deg * Math.PI) / 180),
];

const RING_ORDER = ['ADOPT', 'TRIAL', 'ASSESS', 'HOLD'] as const;
const RING_LABEL: Record<string, string> = { ADOPT: 'Adopt', TRIAL: 'Trial', ASSESS: 'Assess', HOLD: 'Hold' };
const RING_DOT: Record<string, string> = { ADOPT: '#10b981', TRIAL: '#3b82f6', ASSESS: '#f59e0b', HOLD: '#ef4444' };
const RING_BAND: Record<string, [number, number]> = { ADOPT: [17, 50], TRIAL: [54, 72], ASSESS: [76, 92], HOLD: [95, 106] };
const QUAD_ORDER = ['QUALITY_FOUNDATIONS', 'AUTOMATION_CORE', 'RELIABILITY_SCALE', 'AI_ENGINEERING', 'OPS_SYNTHETIC', 'GOVERNANCE_PROCESS'] as const;
const SECTOR_MID: Record<string, number> = { QUALITY_FOUNDATIONS: 90, AUTOMATION_CORE: 30, RELIABILITY_SCALE: 330, AI_ENGINEERING: 270, OPS_SYNTHETIC: 210, GOVERNANCE_PROCESS: 150 };
const QUAD_SHORT: Record<string, string> = { QUALITY_FOUNDATIONS: 'Quality', AUTOMATION_CORE: 'Automation', RELIABILITY_SCALE: 'Reliability', AI_ENGINEERING: 'AI Eng', OPS_SYNTHETIC: 'Ops', GOVERNANCE_PROCESS: 'Governance' };
const QUAD_FULL: Record<string, string> = { QUALITY_FOUNDATIONS: 'Quality Foundations', AUTOMATION_CORE: 'Automation Core', RELIABILITY_SCALE: 'Reliability & Scale', AI_ENGINEERING: 'AI Engineering', OPS_SYNTHETIC: 'Ops & Synthetic', GOVERNANCE_PROCESS: 'Governance & Process' };
const QUAD_FILL: Record<string, string> = { QUALITY_FOUNDATIONS: '#3b82f6', AUTOMATION_CORE: '#a855f7', RELIABILITY_SCALE: '#f97316', AI_ENGINEERING: '#ec4899', OPS_SYNTHETIC: '#06b6d4', GOVERNANCE_PROCESS: '#94a3b8' };

function radarBlips(tools: any[]): Array<{ x: number; y: number; color: string }> {
  const blips: Array<{ x: number; y: number; color: string }> = [];
  const half = 21;
  for (const q of QUAD_ORDER) {
    const mid = SECTOR_MID[q];
    const color = QUAD_FILL[q];
    for (const ring of RING_ORDER) {
      const group = tools.filter(t => String(t?.quadrant) === q && String(t?.ring) === ring);
      const k = group.length;
      if (!k) continue;
      const [lo, hi] = RING_BAND[ring] ?? [76, 92];
      const pts: Array<[number, number]> = [];
      let placed = 0;
      let r = lo;
      let arc = 0;
      while (placed < k && r <= hi + 0.01) {
        const arcLen = ((2 * half * Math.PI) / 180) * r;
        const cap = Math.max(1, Math.floor(arcLen / 8.5));
        const n = Math.min(cap, k - placed);
        const phase = (arc % 2) * (half / Math.max(n, 2)) * 0.6;
        for (let j = 0; j < n; j++) {
          const ang = n === 1 ? mid : mid - half + (2 * half * j) / (n - 1);
          pts.push([r, ang + phase]);
        }
        placed += n;
        r += 7.0;
        arc++;
      }
      const rem0 = k - placed;
      for (let j = 0; placed < k; j++, placed++) {
        pts.push([hi, mid - half + (2 * half * (j + 0.5)) / rem0]);
      }
      for (const [rr, ang] of pts) {
        const [x, y] = polar(rr, ang);
        blips.push({ x, y, color });
      }
    }
  }
  return blips;
}

// eng radar: six chosen axes, mapped from the assessment radar by name.
const ENG_DOMAINS: Array<{ label: string; match: (n: string) => boolean }> = [
  { label: 'Security', match: n => n.includes('security') },
  { label: 'AI Quality', match: n => n.includes('llm') || n.startsWith('ai ') || n.includes('ai quality') || n.includes('ai &') },
  { label: 'Process', match: n => n.includes('process') },
  { label: 'Governance', match: n => n.includes('governance') },
  { label: 'SRE', match: n => n.includes('reliability') || n === 'sre' },
  { label: 'Unit Tests', match: n => n.includes('unit test') },
];

function engVals(radar: any[]): number[] {
  return ENG_DOMAINS.map(({ match }) => {
    const d = (radar ?? []).find((c: any) => match(String(c?.domainName ?? '').toLowerCase()));
    return d ? Math.max(0.06, Math.min(1, (d.score ?? 0) / 2)) : 0.06;
  });
}

function engPoints(v: number[]): string {
  const cx = 110, cy = 86, R = 52, dx = 45, dy = 26;
  const p: Array<[number, number]> = [
    [cx, cy - R * v[0]],
    [cx + dx * v[1], cy - dy * v[1]],
    [cx + dx * v[2], cy + dy * v[2]],
    [cx, cy + R * v[3]],
    [cx - dx * v[4], cy + dy * v[4]],
    [cx - dx * v[5], cy - dy * v[5]],
  ];
  return p.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
}

const moneyK = (n: number) => (n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${Math.round(n)}`);

// ── shared panel frame ──
export function Panel(props: { title: string; deepLink: string; t: Tokens; wide?: boolean; children: React.ReactNode }) {
  const { t } = props;
  return (
    <div
      style={{
        gridColumn: props.wide ? '1 / -1' : 'auto',
        border: `1px solid ${t.border}`,
        borderRadius: 12,
        background: t.panelBg,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px', borderBottom: `1px solid ${t.border}`, background: t.headBg }}>
        <span style={{ font: '500 12px system-ui', color: t.muted }}>ScaleQuality · {props.title}</span>
        <span style={{ font: '600 9px system-ui', letterSpacing: '0.08em', color: t.badgeText, background: t.badgeBg, padding: '2px 7px', borderRadius: 20 }}>MEASURED</span>
      </div>
      <div style={{ padding: 16, flex: 1 }}>{props.children}</div>
      <a href={props.deepLink} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', justifyContent: 'flex-end', padding: '9px 14px', borderTop: `1px solid ${t.border}`, textDecoration: 'none' }}>
        <span style={{ font: '500 11px system-ui', color: t.emeraldText }}>Open in ScaleQuality ↗</span>
      </a>
    </div>
  );
}

export function EngRadarBody({ s, t }: { s: EntitySignal; t: Tokens }) {
  const lvl = typeof s.value === 'number' ? s.value : null;
  const vals = engVals(s.data?.radar);
  const hexes = ['110,34 155,60 155,112 110,138 65,112 65,60', '110,60 132,73 132,99 110,112 88,99 88,73'];
  const spokes: Array<[number, number]> = [[110, 34], [155, 60], [155, 112], [110, 138], [65, 112], [65, 60]];
  const labels: Array<[number, number, 'start' | 'middle' | 'end', string]> = [
    [110, 24, 'middle', 'Security'], [162, 58, 'start', 'AI Quality'], [162, 118, 'start', 'Process'],
    [110, 156, 'middle', 'Governance'], [58, 118, 'end', 'SRE'], [58, 58, 'end', 'Unit Tests'],
  ];
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 2 }}>
        <span style={{ font: '600 13px system-ui', color: t.text }}>Engineering maturity</span>
        <span><span style={{ font: '700 24px system-ui', color: t.emeraldText, letterSpacing: '-0.02em' }}>{lvl == null ? '—' : `L${lvl}`}</span><span style={{ font: '400 12px system-ui', color: t.muted }}> of 5</span></span>
      </div>
      <svg viewBox="0 0 220 172" style={{ width: '100%', height: 168 }}>
        {hexes.map((h, i) => <polygon key={i} points={h} fill="none" stroke={t.grid} strokeWidth="1" />)}
        {spokes.map(([x, y], i) => <line key={i} x1="110" y1="86" x2={x} y2={y} stroke={t.grid} strokeWidth="1" />)}
        {lvl != null && <polygon points={engPoints(vals)} fill={`${t.emerald}26`} stroke={t.emerald} strokeWidth="2" strokeLinejoin="round" />}
        {labels.map(([x, y, a, txt], i) => <text key={i} x={x} y={y} textAnchor={a} fill={t.gridLabel} style={{ font: '600 9px system-ui' }}>{txt}</text>)}
      </svg>
    </>
  );
}

export function CodeMaturityBody({ s, t }: { s: EntitySignal; t: Tokens }) {
  const score = typeof s.value === 'number' ? s.value : null;
  const dom = s.data?.domains ?? {};
  const dash = score != null ? (score / 100) * 295.3 : 0;
  const rows: Array<[string, string]> = [['Security', 'security'], ['Reliability', 'reliability'], ['Maintainability', 'maintainability'], ['AI durability', 'aiDurability']];
  return (
    <>
      <div style={{ font: '600 13px system-ui', color: t.text, marginBottom: 4 }}>Code maturity</div>
      <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
        <svg viewBox="0 0 120 120" style={{ width: 120, height: 120, flexShrink: 0 }}>
          <circle cx="60" cy="60" r="47" fill="none" stroke={t.track} strokeWidth="10" />
          {score != null && <circle cx="60" cy="60" r="47" fill="none" stroke={t.teal} strokeWidth="10" strokeLinecap="round" strokeDasharray={`${dash.toFixed(1)} 295.3`} transform="rotate(-90 60 60)" />}
          <text x="60" y="55" textAnchor="middle" fill={t.tealText} style={{ font: '700 28px system-ui' }}>{score == null ? '—' : score}</text>
          <text x="60" y="73" textAnchor="middle" fill={t.muted} style={{ font: '400 9px system-ui' }}>of 100</text>
        </svg>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ font: '400 12px system-ui', color: t.muted, margin: '0 0 12px' }}>the zero-config Diagnosis verdict</p>
          {rows.map(([label, key]) => {
            const v = typeof dom[key] === 'number' ? dom[key] : null;
            return (
              <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, font: '400 11px system-ui', marginBottom: 6 }}>
                <span style={{ width: 92, color: t.muted, flexShrink: 0 }}>{label}</span>
                <span style={{ flex: 1, height: 4, borderRadius: 20, background: t.track, overflow: 'hidden' }}><span style={{ display: 'block', height: '100%', width: `${v ?? 0}%`, background: `${t.teal}b3`, borderRadius: 20 }} /></span>
                <span style={{ width: 22, textAlign: 'right', color: t.muted, fontVariantNumeric: 'tabular-nums' }}>{v ?? '—'}</span>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

export function DurabilityBody({ s, t }: { s: EntitySignal; t: Tokens }) {
  const surv = typeof s.value === 'number' ? s.value : null;
  const rew = surv == null ? 0 : 100 - surv;
  const usd = typeof s.data?.reworkUsd === 'number' ? s.data.reworkUsd : null;
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ font: '600 13px system-ui', color: t.text }}>AI durability <span style={{ fontWeight: 400, color: t.muted }}>· how much AI code survives vs turns into rework</span></span>
        <span style={{ font: '700 24px system-ui', color: t.emeraldText, fontVariantNumeric: 'tabular-nums' }}>{surv == null ? '—' : `${surv}%`}</span>
      </div>
      <div style={{ display: 'flex', height: 10, borderRadius: 20, overflow: 'hidden', marginTop: 14, background: t.track }}>
        <div style={{ width: `${surv ?? 0}%`, background: t.emerald, borderRadius: '20px 0 0 20px' }} />
        <div style={{ width: `${rew}%`, background: t.rose, borderRadius: '0 20px 20px 0' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', font: '400 11.5px system-ui', marginTop: 10 }}>
        <span style={{ color: t.emeraldText, fontWeight: 500 }}>{surv == null ? '—' : `${surv}%`} survives <span style={{ color: t.muted, fontWeight: 400 }}>· vs 95% human code</span></span>
        <span style={{ color: t.muted }}>{usd != null ? moneyK(usd) : '—'} rework you paid for</span>
      </div>
    </>
  );
}

export function TechRadarBody({ s, t }: { s: EntitySignal; t: Tokens }) {
  const tools: any[] = Array.isArray(s.data?.tools) ? s.data.tools : [];
  const count = typeof s.value === 'number' ? s.value : tools.length;
  const guides = [108, 94, 74, 52];
  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
      <svg viewBox="-18 -14 276 268" style={{ width: 230, flexShrink: 0 }}>
        <circle cx="120" cy="120" r="52" fill={`${t.emerald}0d`} />
        {guides.map(r => <circle key={r} cx="120" cy="120" r={r} fill="none" stroke={t.grid} strokeWidth="1" />)}
        {[0, 60, 120, 180, 240, 300].map(deg => { const [x, y] = polar(108, deg); return <line key={deg} x1="120" y1="120" x2={x.toFixed(1)} y2={y.toFixed(1)} stroke={t.grid} strokeWidth="1" opacity="0.5" />; })}
        {QUAD_ORDER.map(q => { const [x, y] = polar(120, SECTOR_MID[q]); return <text key={q} x={x.toFixed(1)} y={(y + 3).toFixed(1)} textAnchor="middle" fill={t.gridLabel} style={{ font: '600 8.5px system-ui' }}>{QUAD_SHORT[q]}</text>; })}
        {radarBlips(tools).map((b, i) => <circle key={i} cx={b.x.toFixed(1)} cy={b.y.toFixed(1)} r="2.8" fill={b.color} stroke={t.panelBg} strokeWidth="0.8" />)}
      </svg>
      <div style={{ minWidth: 190, flex: 1 }}>
        <div style={{ font: '600 13px system-ui', color: t.text }}>Technology landscape</div>
        <div style={{ font: '400 12px system-ui', color: t.muted, margin: '2px 0 14px' }}>{count} technologies across the four rings</div>
        <div style={{ font: '600 10px system-ui', letterSpacing: '0.05em', textTransform: 'uppercase', color: t.muted, opacity: 0.7, marginBottom: 6 }}>Rings</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 20px', marginBottom: 14 }}>
          {RING_ORDER.map(ring => {
            const n = tools.filter(tool => String(tool?.ring) === ring).length;
            return (
              <div key={ring} style={{ display: 'flex', alignItems: 'center', gap: 6, font: '400 11px system-ui' }}>
                <span style={{ height: 8, width: 8, borderRadius: '50%', background: RING_DOT[ring] }} />
                <span style={{ color: t.muted }}>{RING_LABEL[ring]}</span>
                <span style={{ marginLeft: 'auto', fontWeight: 600, color: RING_DOT[ring], fontVariantNumeric: 'tabular-nums' }}>{n}</span>
              </div>
            );
          })}
        </div>
        <div style={{ font: '600 10px system-ui', letterSpacing: '0.05em', textTransform: 'uppercase', color: t.muted, opacity: 0.7, marginBottom: 6 }}>Categories</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 20px' }}>
          {QUAD_ORDER.map(q => (
            <div key={q} style={{ display: 'flex', alignItems: 'center', gap: 6, font: '400 11px system-ui', color: t.muted, minWidth: 0 }}>
              <span style={{ height: 8, width: 8, borderRadius: '50%', flexShrink: 0, background: QUAD_FILL[q] }} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{QUAD_FULL[q]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
