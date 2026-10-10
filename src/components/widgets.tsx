import React from 'react';
import { EntitySignal } from '../api';

/**
 * The ScaleQuality portal widgets, ported from the platform's Developers
 * gallery so a card looks the same inside Backstage: one strong chart per
 * card, brand greens, semantic colours only for risk. Inline SVG and inline
 * styles only (no CSS framework, no external assets), theme-aware through the
 * `dark` flag. A signal with no measurement renders its empty state, never a
 * zero.
 */

export type Tokens = ReturnType<typeof tokens>;

export function tokens(dark: boolean) {
  return dark
    ? { card: '#111416', fg: '#EEF1F2', muted: '#9AA3A9', faint: '#6C757B', soft: '#0D1012', border: 'rgba(238,241,242,0.08)', borderStrong: 'rgba(238,241,242,0.16)', grid: 'rgba(238,241,242,0.08)',
        g900: '#9FE1CB', g700: '#2FB589', g500: '#1D9E75', g300: '#157A5C', g50: 'rgba(31,158,117,0.16)', ink: '#D5DADD', amber: '#E7B04A', amberBg: 'rgba(231,176,74,0.12)', rose: '#EF7A83', roseBg: 'rgba(239,122,131,0.12)', orange: '#F08A6E', blue: '#7FB0EA', violet: '#A795F0' }
    : { card: '#FFFFFF', fg: '#0E0F10', muted: '#6B7379', faint: '#9AA2A8', soft: '#F8F9F9', border: 'rgba(15,17,19,0.08)', borderStrong: 'rgba(15,17,19,0.14)', grid: 'rgba(15,17,19,0.07)',
        g900: '#0B4D3D', g700: '#0F6E56', g500: '#1D9E75', g300: '#5FC7A2', g50: '#E1F5EE', ink: '#2B3035', amber: '#C98A1A', amberBg: '#FFF4DF', rose: '#C2414B', roseBg: '#FDECEE', orange: '#E26D4E', blue: '#2F6FB8', violet: '#6E56CF' };
}

const num: React.CSSProperties = { fontVariantNumeric: 'tabular-nums' };
const usd = (n: number) => (n > 0 && n < 0.01 ? '< $0.01' : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: n >= 1000 ? 0 : 2 }).format(n));
const money = (n: number, currency = 'USD') => new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: n >= 1000 ? 0 : 2 }).format(n);
const band = (v: number, t: Tokens) => (v >= 80 ? t.g700 : v >= 60 ? t.g500 : v >= 40 ? t.amber : t.rose);
let uid = 0;
const useUid = () => React.useMemo(() => `sq${++uid}`, []);

// ─── Frame ───────────────────────────────────────────────────
/** The ScaleQuality symbol at card size: the contained variant (four rising bars, top bar white, in the Deep square). */
function BrandMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden style={{ flex: 'none' }}>
      <rect width="18" height="18" rx="4.5" fill="#0C2E26" />
      <g transform="translate(3.9 4.2) scale(0.1375)">
        <rect x="0" y="56" width="14" height="14" rx="1" fill="#9FE1CB" />
        <rect x="20" y="40" width="14" height="30" rx="1" fill="#5DCAA5" />
        <rect x="40" y="20" width="14" height="50" rx="1" fill="#1D9E75" />
        <rect x="60" y="0" width="14" height="70" rx="1" fill="#FFFFFF" />
      </g>
    </svg>
  );
}

export function Panel(props: { title: string; signal?: EntitySignal; t: Tokens; span?: number; fill?: boolean; children: React.ReactNode }) {
  const { title, signal, t, span = 1, fill, children } = props;
  const p = signal?.provenance;
  const chip = p === 'MEASURED' ? { bg: t.g50, fg: t.g900 } : p === 'DECLARED' ? { bg: t.amberBg, fg: t.amber } : { bg: 'rgba(47,111,184,0.12)', fg: t.blue };
  return (
    <div style={{ gridColumn: `span ${span}`, background: t.card, border: `1px solid ${t.border}`, borderRadius: 16, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0, color: t.fg }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px 0' }}>
        <BrandMark />
        <span style={{ fontSize: 12, color: t.muted }}>ScaleQuality · <b style={{ color: t.fg, fontWeight: 600 }}>{title}</b></span>
        {p && <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', padding: '2px 7px', borderRadius: 999, background: chip.bg, color: chip.fg }}>{p}</span>}
      </div>
      <div style={{ padding: '12px 14px 14px', flex: 1, display: 'grid', gap: 12, alignContent: fill ? 'stretch' : 'start' }}>{children}</div>
      {signal?.deepLinkUrl && (
        <a href={signal.deepLinkUrl} target="_blank" rel="noopener noreferrer" style={{ padding: '9px 14px', borderTop: `1px solid ${t.border}`, fontSize: 11.5, color: t.g700, textDecoration: 'none', fontWeight: 500 }}>
          Open in ScaleQuality ↗
        </a>
      )}
    </div>
  );
}

const Empty = ({ t, children }: { t: Tokens; children: React.ReactNode }) => (
  <div style={{ display: 'grid', placeItems: 'center', minHeight: 140, textAlign: 'center', fontSize: 12.5, color: t.muted, padding: 12 }}>{children}</div>
);
const Kpi = ({ t, value, unit, children }: { t: Tokens; value: React.ReactNode; unit: string; children?: React.ReactNode }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap' }}>
    <span style={{ ...num, fontSize: 30, fontWeight: 650, letterSpacing: '-0.02em', lineHeight: 1.1 }}>{value}</span>
    <span style={{ fontSize: 13, color: t.muted }}>{unit}</span>{children}
  </div>
);
const Delta = ({ t, v, suffix }: { t: Tokens; v: number; suffix?: string }) => (
  <span style={{ fontSize: 12, fontWeight: 600, padding: '1px 7px', borderRadius: 999, background: v >= 0 ? t.g50 : t.roseBg, color: v >= 0 ? t.g900 : t.rose }}>{v > 0 ? `+${v}` : v}{suffix ?? ''}</span>
);
const Legend = ({ t, items, column }: { t: Tokens; items: Array<{ label: string; value: React.ReactNode; color: string }>; column?: boolean }) => (
  <div style={{ display: column ? 'grid' : 'flex', flexWrap: 'wrap', gap: column ? 4 : '6px 12px', fontSize: 11.5, color: t.muted }}>
    {items.map(i => (
      <span key={i.label} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
        <i style={{ width: 9, height: 9, borderRadius: 2, background: i.color, flex: 'none' }} />{i.label}
        <b style={{ ...num, color: t.fg, fontWeight: 600, marginLeft: column ? 'auto' : 0 }}>{i.value}</b>
      </span>
    ))}
  </div>
);
const Alert = ({ t, good, children }: { t: Tokens; good?: boolean; children: React.ReactNode }) => (
  <div style={{ fontSize: 12, padding: '8px 10px', borderRadius: 10, background: good ? t.g50 : t.roseBg, color: good ? t.g900 : t.rose }}>{children}</div>
);
const Tri = ({ t, items }: { t: Tokens; items: Array<{ label: string; value: React.ReactNode }> }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
    {items.map(i => (
      <div key={i.label} style={{ border: `1px solid ${t.border}`, borderRadius: 12, padding: 10, background: t.soft, display: 'grid', gap: 4, alignContent: 'space-between', minWidth: 0, containerType: 'inline-size' }}>
        <span style={{ fontSize: 11, color: t.muted }}>{i.label}</span>
        <span style={{ ...num, fontSize: 'clamp(13px, 17cqw, 20px)', fontWeight: 650, whiteSpace: 'nowrap' }}>{i.value}</span>
      </div>
    ))}
  </div>
);
/** One row per item: name on the left, an optional muted note, the figure on the right. `grow` shares the free height. */
const Rows = ({ t, items, grow, wrap }: { t: Tokens; items: Array<{ label: string; value: React.ReactNode; color: string; note?: string | null }>; grow?: boolean; wrap?: boolean }) => (
  <div style={{ display: 'grid', minWidth: 0, ...(grow ? { flex: 1, alignContent: 'center', gridAutoRows: 'minmax(30px, 54px)' } : {}) }}>
    {items.map((i, n) => (
      <div key={i.label} style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 28, padding: wrap ? '5px 0' : 0, fontSize: 12.5, borderTop: n ? `1px solid ${t.border}` : 'none', minWidth: 0 }}>
        <span style={{ flex: 1, minWidth: 0, display: 'inline-flex', alignItems: wrap ? 'flex-start' : 'center', gap: 7, color: t.ink }}>
          <i style={{ width: 9, height: 9, borderRadius: 2, background: i.color, flex: 'none', marginTop: wrap ? 4 : 0 }} />
          <span style={wrap ? { lineHeight: 1.3 } : { minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{i.label}</span>
        </span>
        {i.note && <span style={{ ...num, fontSize: 11.5, color: t.muted }}>{i.note}</span>}
        <b style={{ ...num, fontWeight: 600, whiteSpace: 'nowrap' }}>{i.value}</b>
      </div>
    ))}
  </div>
);
const Foot = ({ t, children }: { t: Tokens; children: React.ReactNode }) => <p style={{ fontSize: 11, color: t.faint, margin: 0 }}>{children}</p>;

// ─── Charts ──────────────────────────────────────────────────
function Ring({ value, size, stroke, t }: { value: number | null; size: number; stroke: number; t: Tokens }) {
  const id = useUid();
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, f = Math.max(0, Math.min(1, (value ?? 0) / 100));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      <defs><linearGradient id={id} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor={t.g300} /><stop offset="1" stopColor={t.g700} /></linearGradient></defs>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={t.grid} strokeWidth={stroke} />
      {value != null && <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={`url(#${id})`} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={`${c * f} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} />}
    </svg>
  );
}
function Donut({ parts, colors, size, stroke, t }: { parts: number[]; colors: string[]; size: number; stroke: number; t: Tokens }) {
  const total = parts.reduce((a, b) => a + b, 0) || 1, r = (size - stroke) / 2, c = 2 * Math.PI * r;
  const lengths = parts.map(p => (p / total) * c);
  const offsets = lengths.map((_, i) => lengths.slice(0, i).reduce((a, b) => a + b, 0));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={t.grid} strokeWidth={stroke} />
      {parts.map((p, i) => <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={colors[i]} strokeWidth={stroke} strokeDasharray={`${Math.max(0, lengths[i] - (p ? 2 : 0))} ${c}`} strokeDashoffset={-offsets[i]} transform={`rotate(-90 ${size / 2} ${size / 2})`} />)}
    </svg>
  );
}
// ─── Health ──────────────────────────────────────────────────
const LEVEL_NAMES = ['', 'Reactive', 'Initial', 'Structured', 'Managed', 'Optimized'];
const DOMAINS: Array<[string, string]> = [['security', 'Security'], ['reliability', 'Reliability'], ['maintainability', 'Maintainability'], ['aiDurability', 'AI durability'], ['supplyChain', 'Supply chain']];
export function HealthBody({ s, t }: { s?: EntitySignal; t: Tokens }) {
  const d = s?.data ?? {};
  if (d.score == null) return <Empty t={t}>No repository measured here yet.</Empty>;
  const rows: Array<{ label: string; value: number; pct?: boolean }> = DOMAINS.filter(([k]) => d.domains?.[k] != null).map(([k, label]) => ({ label, value: d.domains[k] }));
  if (d.coveragePct != null) rows.push({ label: 'Test coverage', value: d.coveragePct, pct: true });
  if (d.licensesAllowedPct != null) rows.push({ label: 'Licenses allowed', value: d.licensesAllowedPct, pct: true });
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 22, alignItems: 'center' }}>
      <div style={{ position: 'relative', width: 170, height: 170, flex: 'none' }}>
        <Ring value={d.score} size={170} stroke={15} t={t} />
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}><div>
          <div style={{ ...num, fontSize: 42, fontWeight: 650, letterSpacing: '-0.03em', lineHeight: 1 }}>{d.score}</div>
          <div style={{ fontSize: 11, color: t.muted, letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 4 }}>of 100</div>
          {d.level != null && <span style={{ display: 'inline-block', marginTop: 8, fontSize: 12, fontWeight: 600, color: t.g900, background: t.g50, padding: '2px 9px', borderRadius: 999 }}>L{d.level} · {LEVEL_NAMES[d.level]}</span>}
        </div></div>
      </div>
      <div style={{ display: 'grid', gap: 9, flex: 1, minWidth: 220 }}>
        {rows.map(r => (
          <div key={r.label} style={{ display: 'grid', gridTemplateColumns: '118px minmax(0, 1fr) 46px', gap: 10, alignItems: 'center', fontSize: 12.5 }}>
            <span style={{ color: t.ink }}>{r.label}</span>
            <span style={{ height: 8, borderRadius: 99, background: t.soft, border: `1px solid ${t.border}`, overflow: 'hidden', position: 'relative' }}>
              <i style={{ position: 'absolute', inset: '0 auto 0 0', width: `${r.value}%`, borderRadius: 99, background: band(r.value, t) }} />
              {[60, 80].map(x => <span key={x} style={{ position: 'absolute', top: -2, bottom: -2, left: `${x}%`, width: 1, background: t.borderStrong }} />)}
            </span>
            <span style={{ ...num, textAlign: 'right', fontWeight: 600 }}>{r.value}{r.pct ? '%' : ''}</span>
          </div>
        ))}
        <p style={{ fontSize: 12, color: t.muted, margin: 0 }}>{d.delta30d != null && <><Delta t={t} v={d.delta30d} /> in 30 days · </>}ticks at 60 and 80</p>
      </div>
    </div>
  );
}

// ─── Security ────────────────────────────────────────────────
export function SecurityBody({ s, t }: { s?: EntitySignal; t: Tokens }) {
  const d = s?.data ?? {};
  if (d.total == null) return <Empty t={t}>No security reading here yet.</Empty>;
  const sev = [['Critical', d.open?.critical ?? 0, t.rose], ['High', d.open?.high ?? 0, t.orange], ['Medium', d.open?.medium ?? 0, t.amber], ['Low', d.open?.low ?? 0, t.faint]] as Array<[string, number, string]>;
  return (
    <>
      <Kpi t={t} value={d.total} unit="open findings">{d.partial && <span style={{ fontSize: 12, fontWeight: 600, padding: '1px 7px', borderRadius: 999, background: t.roseBg, color: t.rose }}>at least: an inventory hit its limit</span>}</Kpi>
      {d.total > 0 && <div style={{ display: 'flex', height: 14, borderRadius: 7, overflow: 'hidden', gap: 2 }}>{sev.map(([l, n, c]) => n ? <i key={l} style={{ flex: n, background: c }} /> : null)}</div>}
      <Legend t={t} items={sev.map(([label, value, color]) => ({ label, value, color }))} />
      {sev[0][1] > 0 ? <Alert t={t}>{sev[0][1]} critical {sev[0][1] === 1 ? 'finding' : 'findings'} open. The remediation agent can open the pull request.</Alert> : <Alert t={t} good>No critical finding open.</Alert>}
    </>
  );
}

// ─── Compliance ──────────────────────────────────────────────
const CONTROL = [['MET', 'Met'], ['PARTIAL', 'Partial'], ['MISSING', 'Missing'], ['STALE', 'Stale'], ['ACCEPTED_WITH_EXCEPTION', 'With exception'], ['MANUAL', 'Manual']] as const;
export function ComplianceBody({ s, t, scope, onRegime }: { s?: EntitySignal; t: Tokens; scope?: string; onRegime: (id: string) => void }) {
  const d = s?.data ?? {};
  const colors = [t.g700, t.g300, t.rose, t.amber, t.violet, t.faint];
  const counts = CONTROL.map(([k]) => d.summary?.[k] ?? 0);
  const total = counts.reduce((a, b) => a + b, 0);
  const regimes: Array<{ id: string; name: string }> = d.regimes ?? [];
  // A business area or a repository: the controls kept per team come from the teams that own it, and the card says so.
  const perTeam: { reading: string; teams: number; unassignedRepositories: number; controls: Array<{ id: string }> } | undefined = d.teamControls;
  const perTeamIds = (perTeam?.controls ?? []).map(c => c.id).join(', ');
  const repo = scope === 'repo';
  return (
    <>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
        {regimes.slice(0, 6).map(r => {
          const on = d.regime?.id === r.id;
          return <button key={r.id} type="button" onClick={() => onRegime(r.id)} style={{ font: 'inherit', fontSize: 11.5, padding: '3px 9px', borderRadius: 999, cursor: 'pointer', border: `1px solid ${on ? 'transparent' : t.borderStrong}`, background: on ? t.g700 : 'transparent', color: on ? '#fff' : t.muted }}>{r.name}</button>;
        })}
        {regimes.length > 6 && <span style={{ fontSize: 12, color: t.muted }}>+{regimes.length - 6} regimes</span>}
      </div>
      {!d.summary ? <Empty t={t}>{d.emptyReason === 'NO_REPOSITORIES' ? 'No repositories in this business area yet, so it has no controls of its own to read.' : 'No controls read for this regime yet.'}</Empty> : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
          <div style={{ position: 'relative', width: 118, height: 118, flex: 'none' }}>
            <Donut parts={counts} colors={colors} size={118} stroke={14} t={t} />
            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}><div>
              <div style={{ ...num, fontSize: 22, fontWeight: 650 }}>{counts[0]}/{total}</div><div style={{ fontSize: 10.5, color: t.muted }}>controls met</div>
            </div></div>
          </div>
          <div style={{ display: 'grid', gap: 8, flex: 1, minWidth: 200 }}>
            <Legend t={t} items={CONTROL.map(([, label], i) => ({ label, value: counts[i], color: colors[i] }))} />
            {(d.open ?? []).length === 0 ? <span style={{ fontSize: 12, color: t.muted }}>Every control of this regime is met.</span> : (d.open ?? []).map((c: any) => (
              <div key={c.id} style={{ display: 'grid', gap: 1, fontSize: 12.5, borderLeft: `2px solid ${c.status === 'MISSING' ? t.rose : t.amber}`, paddingLeft: 9 }}>
                <span><b style={{ fontWeight: 600 }}>{c.id}</b> {c.title?.en}</span>
                <span style={{ fontSize: 12, color: t.muted }}>{CONTROL.find(([k]) => k === c.status)?.[1] ?? c.status}{c.failingCount ? ` · ${c.failingCount} to fix` : ''}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {d.summary && perTeam && perTeam.controls.length > 0 && (
        <p style={{ fontSize: 12, color: t.muted, margin: 0 }}>
          {perTeam.reading === 'NO_TEAM'
            ? `Read per team (${perTeamIds}): not applicable here, because ${repo ? 'this repository has no team' : 'none of these repositories has a team'}.`
            : `Read per team (${perTeamIds}): from the ${perTeam.teams === 1 ? 'team that owns' : `${perTeam.teams} teams that own`} ${repo ? 'this repository' : 'these repositories'}.${perTeam.unassignedRepositories > 0 ? ` ${perTeam.unassignedRepositories === 1 ? '1 repository without a team is' : `${perTeam.unassignedRepositories} repositories without a team are`} not covered.` : ''}`}
        </p>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap', fontSize: 12, padding: '8px 10px', border: `1px solid ${t.border}`, borderRadius: 10, background: t.soft }}>
        <span>{d.dossier?.generatedAt ? `Audit dossier built ${new Date(d.dossier.generatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · SHA-256 manifest` : 'No audit dossier built yet'}</span>
        {d.dossier?.generatedAt && <b style={{ color: t.g700, fontWeight: 600 }}>Evidence ready</b>}
      </div>
    </>
  );
}

// ─── Licenses ────────────────────────────────────────────────
const FAMILIES: Array<[string, string]> = [['permissive', 'Permissive'], ['weakCopyleft', 'Weak copyleft'], ['strongCopyleft', 'Strong copyleft'], ['networkCopyleft', 'Network copyleft'], ['other', 'Other'], ['unknown', 'Unknown']];
export function LicensesBody({ s, t }: { s?: EntitySignal; t: Tokens }) {
  const d = s?.data ?? {};
  if (d.components == null) return <Empty t={t}>No license inventory here yet.</Empty>;
  const colors = [t.g500, t.blue, t.violet, t.rose, t.ink, t.faint];
  const parts = FAMILIES.map(([k]) => d.families?.[k] ?? 0);
  const forbidden = d.statuses?.forbidden ?? 0;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
      <div style={{ flex: 1, display: 'grid', alignContent: 'center', minHeight: 0 }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ position: 'relative', width: 144, height: 144, flex: 'none' }}>
            <Donut parts={parts} colors={colors} size={144} stroke={16} t={t} />
            <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}><div>
              <div style={{ ...num, fontSize: 26, fontWeight: 650, letterSpacing: '-0.02em' }}>{d.components}</div><div style={{ fontSize: 11, color: t.muted }}>components</div>
            </div></div>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Rows t={t} wrap items={FAMILIES.map(([, label], i) => ({ label, value: parts[i], color: colors[i] })).filter((x, i) => x.value > 0 || i < 4)} />
          </div>
        </div>
      </div>
      {forbidden > 0 ? <Alert t={t}>{forbidden} {forbidden === 1 ? 'component uses a license' : 'components use licenses'} your policy forbids.</Alert> : <Alert t={t} good>Every component within your policy.</Alert>}
    </div>
  );
}

// ─── Coverage ────────────────────────────────────────────────
export function CoverageBody({ s, t }: { s?: EntitySignal; t: Tokens }) {
  const id = useUid();
  const d = s?.data ?? {};
  if (d.pct == null) return <Empty t={t}>No coverage measured here yet.</Empty>;
  const history: Array<{ date: string; pct: number }> = d.history ?? [];
  const delta = history.length > 1 ? Math.round(history[history.length - 1].pct - history[0].pct) : null;
  const day = (date: string) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
  const values = history.map(p => p.pct);
  const lo = values.length ? Math.max(0, Math.floor((Math.min(...values) - 5) / 10) * 10) : 0;
  const hi = values.length ? Math.min(100, Math.ceil((Math.max(...values) + 5) / 10) * 10) : 100;
  const t0 = history.length ? new Date(history[0].date).getTime() : 0, t1 = history.length ? new Date(history[history.length - 1].date).getTime() : 0;
  const x = (date: string) => (t1 === t0 ? 50 : ((new Date(date).getTime() - t0) / (t1 - t0)) * 100);
  const y = (v: number) => 100 - ((v - lo) / (hi - lo || 1)) * 100;
  const path = history.map((p, i) => `${i ? 'L' : 'M'}${x(p.date).toFixed(2)} ${y(p.pct).toFixed(2)}`).join(' ');
  const last = history[history.length - 1];
  const small: React.CSSProperties = { ...num, fontSize: 10.5, color: t.faint };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minHeight: 0 }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <div style={{ position: 'relative', width: 124, height: 124, flex: 'none' }}>
          <Ring value={d.pct} size={124} stroke={12} t={t} />
          <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', ...num, fontSize: 28, fontWeight: 650, letterSpacing: '-0.02em' }}>{d.pct}%</div>
        </div>
        <div style={{ display: 'grid', gap: 6, minWidth: 0 }}>
          <span style={{ fontSize: 12, color: t.muted }}>Executed lines, last {history.length} measurements</span>
          {delta != null && <span style={{ fontSize: 12, color: t.muted }}><Delta t={t} v={delta} suffix=" pp" /> since {day(history[0].date)}</span>}
        </div>
      </div>
      {history.length > 1 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'auto minmax(0, 1fr)', gridTemplateRows: 'minmax(0, 1fr) auto', gap: '6px 8px', flex: 1, minHeight: 150 }} aria-hidden>
          <div style={{ ...small, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', textAlign: 'right' }}>
            <span>{hi}%</span><span>{Math.round((hi + lo) / 2)}%</span><span>{lo}%</span>
          </div>
          <div style={{ position: 'relative', minHeight: 0 }}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible' }}>
              <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={t.g500} stopOpacity=".28" /><stop offset="1" stopColor={t.g500} stopOpacity="0" /></linearGradient></defs>
              {[0, 50, 100].map(gy => <line key={gy} x1="0" x2="100" y1={gy} y2={gy} stroke={t.grid} vectorEffect="non-scaling-stroke" />)}
              <path d={`${path} L${x(last.date).toFixed(2)} 100 L${x(history[0].date).toFixed(2)} 100 Z`} fill={`url(#${id})`} />
              <path d={path} fill="none" stroke={t.g500} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
            </svg>
            <span style={{ position: 'absolute', left: `${x(last.date)}%`, top: `${y(last.pct)}%`, width: 9, height: 9, borderRadius: '50%', background: t.g500, boxShadow: `0 0 0 2px ${t.card}`, transform: 'translate(-50%, -50%)' }} />
          </div>
          <span />
          <div style={{ ...small, display: 'flex', justifyContent: 'space-between' }}><span>{day(history[0].date)}</span><span>{day(last.date)}</span></div>
        </div>
      )}
    </div>
  );
}

// ─── Engineering maturity ────────────────────────────────────
const ENG = [
  { code: '13', label: 'Security', match: (n: string) => n.includes('security') },
  { code: '12', label: 'AI quality', match: (n: string) => n.includes('llm') || n.startsWith('ai ') || n.includes('ai quality') || n.includes('ai &') },
  { code: '09', label: 'Process', match: (n: string) => n.includes('process') },
  { code: '10', label: 'Governance', match: (n: string) => n.includes('governance') },
  { code: '11', label: 'SRE', match: (n: string) => n.includes('reliability') || n === 'sre' },
  { code: '01', label: 'Unit tests', match: (n: string) => n.includes('unit test') },
];
const normCode = (v: unknown) => String(v ?? '').replace(/^0+/, '').toLowerCase();
/** A long axis name breaks in two at the space nearest its middle, so the side labels stay narrow. */
function nameLines(name: string): string[] {
  if (name.length <= 11 || !name.includes(' ')) return [name];
  const spaces = [...name].map((c, i) => (c === ' ' ? i : -1)).filter(i => i > 0);
  const cut = spaces.reduce((best, i) => (Math.abs(i - name.length / 2) < Math.abs(best - name.length / 2) ? i : best), spaces[0]);
  return [name.slice(0, cut), name.slice(cut + 1)];
}
export function EngMaturityBody({ s, t }: { s?: EntitySignal; t: Tokens }) {
  const d = s?.data ?? {};
  if (d.level == null || !(d.teamsAssessed > 0)) return <Empty t={t}>No team assessed yet.</Empty>;
  const radar: any[] = d.radar ?? [];
  const axes = ENG.map(dom => {
    const hit = radar.find(r => normCode(r.domainCode) === normCode(dom.code) || dom.match(String(r.domainName ?? '').toLowerCase()));
    const score = hit && hit.answer !== 'NA' ? Number(hit.score) : null;
    return { name: dom.label, reading: score == null ? '–' : score.toFixed(1), value: score == null ? 0 : score / 2 };
  });
  const cx = 150, cy = 150, R = 112, LINE = 14.5;
  const at = (j: number, k: number) => { const a = -Math.PI / 2 + (j * 2 * Math.PI) / axes.length; return [cx + Math.cos(a) * R * k, cy + Math.sin(a) * R * k]; };
  const pts = axes.map((a, j) => at(j, Math.max(0.04, Math.min(1, a.value))));
  return (
    <>
      <Kpi t={t} value={`L${d.level}`} unit="of 5 · from the latest assessment of each team" />
      <svg width="100%" viewBox="-34 -16 368 334" style={{ maxWidth: 400, justifySelf: 'center' }} aria-hidden>
        {[1, 2, 3, 4, 5].map(k => <polygon key={k} points={axes.map((_, j) => at(j, k / 5).map(v => v.toFixed(1)).join(',')).join(' ')} fill={k % 2 ? 'none' : t.soft} stroke={t.grid} />)}
        {axes.map((_, j) => { const [px, py] = at(j, 1); return <line key={j} x1={cx} y1={cy} x2={px} y2={py} stroke={t.grid} />; })}
        <polygon points={pts.map(p => p.map(v => v.toFixed(1)).join(',')).join(' ')} fill={t.g500} fillOpacity=".22" stroke={t.g700} strokeWidth="2" strokeLinejoin="round" />
        {pts.map(([px, py], j) => <circle key={j} cx={px} cy={py} r="3.2" fill={t.g700} />)}
        {axes.map((a, j) => {
          const ang = -Math.PI / 2 + (j * 2 * Math.PI) / axes.length, lx = cx + Math.cos(ang) * (R + 12), ly = cy + Math.sin(ang) * (R + 12);
          const side = Math.abs(Math.cos(ang)) >= 0.2;
          const lines = [...nameLines(a.name), a.reading];
          // Beside a side vertex (centred on it), above the top one and below the bottom one.
          const first = side ? ly - ((lines.length - 1) * LINE) / 2 + 4 : Math.sin(ang) < 0 ? ly - (lines.length - 1) * LINE - 1 : ly + 11;
          return (
            <text key={j} textAnchor={!side ? 'middle' : Math.cos(ang) > 0 ? 'start' : 'end'} fontSize="13" fill={t.muted}>
              {lines.map((line, i) => <tspan key={i} x={lx} y={first + i * LINE} {...(i === lines.length - 1 ? { fontWeight: 650, fill: t.fg } : {})}>{line}</tspan>)}
            </text>
          );
        })}
      </svg>
      <Foot t={t}>Each axis is the domain's score, from 0 to 2.</Foot>
    </>
  );
}

// ─── AI ──────────────────────────────────────────────────────
const SOURCE_NAMES: Record<string, string> = { SQ_AUTO: 'ScaleQuality AI', SQ_WORKSPACE: 'ScaleQuality AI', CURSOR: 'Cursor', CLAUDE_CODE: 'Claude Code', GITHUB_COPILOT: 'GitHub Copilot', OPENAI_API: 'OpenAI', LITELLM: 'LiteLLM', OPENROUTER: 'OpenRouter' };
export function AiBody({ s, t }: { s?: EntitySignal; t: Tokens }) {
  const d = s?.data ?? {};
  const sources: Array<{ source: string; usd: number | null }> = d.bySource ?? [];
  if (d.monthlyUsd == null && sources.length === 0) return <Empty t={t}>No AI usage measured here yet.</Empty>;
  const palette = [t.ink, t.blue, t.violet, t.amber];
  const color = (src: string, i: number) => (src === 'SQ_AUTO' || src === 'SQ_WORKSPACE' ? t.g500 : palette[i % 4]);
  const total = d.monthlyUsd ?? 0;
  const share = (v: number | null) => {
    if (v == null || total <= 0) return null;
    const pct = (v / total) * 100;
    return pct > 0 && pct < 1 ? '< 1%' : `${Math.round(pct)}%`;
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
      <Kpi t={t} value={usd(total)} unit="this month" />
      {sources.some(x => (x.usd ?? 0) > 0) && (
        <div style={{ display: 'flex', height: 10, borderRadius: 5, overflow: 'hidden', gap: 2 }}>
          {sources.map((x, i) => (x.usd ?? 0) > 0 ? <i key={x.source} style={{ flex: Math.max(x.usd!, total * 0.02), background: color(x.source, i) }} /> : null)}
        </div>
      )}
      <Rows t={t} grow items={sources.map((x, i) => ({ label: SOURCE_NAMES[x.source] ?? x.source, value: x.usd == null ? 'tokens only' : usd(x.usd), color: color(x.source, i), note: share(x.usd) }))} />
      <Tri t={t} items={[
        { label: 'People using AI', value: d.people ? `${d.people.usingAi} of ${d.people.total}` : '–' },
        { label: 'AI code that survives', value: d.durability?.survivalPct != null ? `${d.durability.survivalPct}%` : '–' },
        { label: 'Rework paid', value: d.durability?.reworkUsd != null ? usd(d.durability.reworkUsd) : '–' },
      ]} />
      {d.partial && <Foot t={t}>A source reports tokens only: the month is a known subtotal.</Foot>}
    </div>
  );
}

// ─── People and cost ─────────────────────────────────────────
export function PeopleCostBody({ s, t }: { s?: EntitySignal; t: Tokens }) {
  const d = s?.data ?? {};
  if (d.hidden) return <Empty t={t}>Shown from 3 people up, so nobody's pay can be read from it.</Empty>;
  if (d.monthlyCost == null) return <Empty t={t}>{d.people > 0 ? 'No average salary set yet.' : 'No people here yet.'}</Empty>;
  return (
    <>
      <Kpi t={t} value={money(d.monthlyCost, d.currency)} unit="people cost / month" />
      <Tri t={t} items={[
        { label: 'People', value: d.people },
        { label: 'AI per person', value: d.aiPerPersonUsd != null ? usd(d.aiPerPersonUsd) : '–' },
        { label: 'AI vs people cost', value: d.aiShareOfPeopleCostPct != null ? `${d.aiShareOfPeopleCostPct < 0.1 ? '< 0.1' : d.aiShareOfPeopleCostPct}%` : '–' },
      ]} />
      <Foot t={t}>{d.peopleSource === 'DECLARED' ? 'Headcount declared for the area; bind people to it for the measured count.' : "People times the average salary of their team or area. An average, never one person's figure."}</Foot>
    </>
  );
}

// ─── Initiatives ─────────────────────────────────────────────
export function InitiativesBody({ s, t }: { s?: EntitySignal; t: Tokens }) {
  const d = s?.data ?? {};
  const items: any[] = d.items ?? [];
  if (items.length === 0) return <Empty t={t}>No initiative with people from here.</Empty>;
  return (
    <>
      <Kpi t={t} value={usd(d.projectedSavingMonthlyUsd ?? 0)} unit="projected saving / month" />
      <div style={{ display: 'grid', gap: 8 }}>
        {items.slice(0, 5).map(x => {
          const pct = x.plannedMonthlyUsd ? Math.min(100, (x.realMonthlyUsd / x.plannedMonthlyUsd) * 100) : 0;
          return (
            <div key={x.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto', gap: '4px 10px', fontSize: 12.5 }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{x.name}</span>
              <span style={{ ...num, fontSize: 12, color: t.muted }}>{x.plannedMonthlyUsd != null ? `${usd(x.realMonthlyUsd)} real of ${usd(x.plannedMonthlyUsd)}` : `${usd(x.realMonthlyUsd)} real`}</span>
              {x.plannedMonthlyUsd != null && <span style={{ gridColumn: '1 / -1', height: 6, borderRadius: 99, background: t.soft, border: `1px solid ${t.border}`, overflow: 'hidden', position: 'relative' }}><i style={{ position: 'absolute', inset: '0 auto 0 0', width: `${Math.max(pct, 1.5)}%`, borderRadius: 99, background: t.g500 }} /></span>}
            </div>
          );
        })}
      </div>
    </>
  );
}

// ─── Evolution ───────────────────────────────────────────────
const BANDS: Array<[number, number, string]> = [[0, 40, 'L1'], [40, 60, 'L2'], [60, 80, 'L3'], [80, 90, 'L4'], [90, 100, 'L5']];
export function EvolutionBody({ s, t }: { s?: EntitySignal; t: Tokens }) {
  const id = useUid();
  const d = s?.data ?? {};
  const series: Array<{ date: string; score: number }> = d.series ?? [];
  if (series.length === 0) return <Empty t={t}>No measurement in the last 180 days.</Empty>;
  const w = 380, h = 150, scores = series.map(p => p.score);
  const lo = Math.max(0, Math.floor((Math.min(...scores) - 8) / 10) * 10), hi = Math.min(100, Math.ceil((Math.max(...scores) + 8) / 10) * 10);
  const y = (v: number) => h - 18 - ((v - lo) / (hi - lo || 1)) * (h - 30);
  const t0 = new Date(series[0].date).getTime(), t1 = new Date(series[series.length - 1].date).getTime();
  const x = (date: string) => (t1 === t0 ? w / 2 : 40 + ((new Date(date).getTime() - t0) / (t1 - t0)) * (w - 44));
  const pts = series.map(p => [x(p.date), y(p.score)]);
  const path = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const last = pts[pts.length - 1];
  const months: Array<{ x: number; label: string }> = [];
  for (const p of series) { const label = new Date(p.date).toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' }); if (!months.some(m => m.label === label)) months.push({ x: x(p.date), label }); }
  return (
    <>
      <Kpi t={t} value={Math.round(series[series.length - 1].score)} unit="score now">{d.delta != null && <Delta t={t} v={d.delta} suffix={` since ${new Date(series[0].date).toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' })}`} />}</Kpi>
      <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }} aria-hidden>
        <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={t.g500} stopOpacity=".25" /><stop offset="1" stopColor={t.g500} stopOpacity="0" /></linearGradient></defs>
        {BANDS.filter(([a, b]) => b > lo && a < hi).map(([a, b, label], i) => {
          const top = y(Math.min(b, hi)), bottom = y(Math.max(a, lo));
          return <g key={label}><rect x="34" y={top} width={w - 34} height={bottom - top} fill={i % 2 ? t.soft : 'transparent'} /><text x="0" y={(top + bottom) / 2 + 4} fontSize="10" fill={t.faint}>{label}</text></g>;
        })}
        <path d={`${path} L${last[0]} ${h - 18} L${pts[0][0]} ${h - 18} Z`} fill={`url(#${id})`} />
        <path d={path} fill="none" stroke={t.g700} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
        {pts.map(([px, py], i) => <circle key={i} cx={px} cy={py} r="2.4" fill={t.card} stroke={t.g700} strokeWidth="1.6" />)}
        {months.map(m => <text key={m.label} x={m.x} y={h - 2} fontSize="10" fill={t.faint} textAnchor="middle">{m.label}</text>)}
      </svg>
    </>
  );
}

// ─── Technology landscape ────────────────────────────────────
export function TechRadarBody({ s, t }: { s?: EntitySignal; t: Tokens }) {
  const stats = s?.data?.stats;
  const counts = [stats?.adopt ?? 0, stats?.trial ?? 0, stats?.assess ?? 0, stats?.hold ?? 0];
  const total = counts.reduce((a: number, b: number) => a + b, 0);
  if (!stats || total === 0) return <Empty t={t}>No radar configured yet.</Empty>;
  const size = 130, cx = size / 2, rings = [0.32, 0.55, 0.76, 0.96], colors = [t.g700, t.blue, t.amber, t.rose];
  let seed = 7;
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  const dots: React.ReactNode[] = [];
  counts.forEach((n, ri) => {
    const inner = ri ? rings[ri - 1] : 0.06, outer = rings[ri];
    for (let k = 0; k < n; k++) {
      const a = rnd() * Math.PI * 2, rr = (inner + (outer - inner) * (0.15 + rnd() * 0.7)) * size / 2;
      dots.push(<circle key={`${ri}-${k}`} cx={(cx + Math.cos(a) * rr).toFixed(1)} cy={(cx + Math.sin(a) * rr).toFixed(1)} r="2.6" fill={colors[ri]} fillOpacity=".85" />);
    }
  });
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden style={{ flex: 'none' }}>
        {rings.slice().reverse().map((r, i) => <circle key={r} cx={cx} cy={cx} r={(r * size) / 2} fill={i % 2 ? t.soft : 'none'} stroke={t.grid} />)}
        {dots}
      </svg>
      <div style={{ display: 'grid', gap: 6 }}>
        <Kpi t={t} value={total} unit="technologies" />
        <Legend t={t} column items={['Adopt', 'Trial', 'Assess', 'Hold'].map((label, i) => ({ label, value: counts[i], color: colors[i] }))} />
      </div>
    </div>
  );
}
