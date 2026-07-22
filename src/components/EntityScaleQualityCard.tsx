import React from 'react';
import {
  InfoCard,
  Progress,
  ResponseErrorPanel,
  MissingAnnotationEmptyState,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import useAsync from 'react-use/lib/useAsync';
import { scaleQualityApiRef, EntitySignal, SignalStatus } from '../api';

export const SCALEQUALITY_ORG_ANNOTATION = 'scalequality.io/org-id';
export const SCALEQUALITY_BU_ANNOTATION = 'scalequality.io/bu-id';
export const SCALEQUALITY_TEAM_ANNOTATION = 'scalequality.io/team-id';

// Most specific wins: a team-scoped entity reads team signals, etc.
function resolveScope(
  annotations: Record<string, string> | undefined,
): { scope: 'org' | 'bu' | 'team'; id: string } | null {
  const a = annotations ?? {};
  if (a[SCALEQUALITY_TEAM_ANNOTATION]) return { scope: 'team', id: a[SCALEQUALITY_TEAM_ANNOTATION] };
  if (a[SCALEQUALITY_BU_ANNOTATION]) return { scope: 'bu', id: a[SCALEQUALITY_BU_ANNOTATION] };
  if (a[SCALEQUALITY_ORG_ANNOTATION]) return { scope: 'org', id: a[SCALEQUALITY_ORG_ANNOTATION] };
  return null;
}

const STATUS_COLOR: Record<SignalStatus, string> = {
  ok: '#059669',
  warn: '#d97706',
  risk: '#dc2626',
  unknown: '#8c8c8c',
};

const MUTED = '#8c8c8c';

function Tile(props: { label: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        border: '1px solid rgba(128,128,128,0.22)',
        borderRadius: 8,
        padding: '12px 14px',
        minWidth: 0,
      }}
    >
      <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: MUTED, marginBottom: 6 }}>
        {props.label}
      </div>
      {props.children}
    </div>
  );
}

function Big(props: { value: React.ReactNode; suffix?: string; status: SignalStatus }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
      <span style={{ fontSize: 26, fontWeight: 700, color: STATUS_COLOR[props.status], lineHeight: 1 }}>
        {props.value}
      </span>
      {props.suffix ? <span style={{ fontSize: 12, color: MUTED }}>{props.suffix}</span> : null}
    </div>
  );
}

function DurabilityTile({ s }: { s: EntitySignal }) {
  const pct = typeof s.value === 'number' ? s.value : null;
  return (
    <Tile label="AI durability">
      {pct == null ? (
        <Big value="—" status="unknown" />
      ) : (
        <>
          <Big value={`${pct}%`} suffix="survives" status={s.status as SignalStatus} />
          <div style={{ display: 'flex', height: 8, borderRadius: 20, overflow: 'hidden', background: 'rgba(128,128,128,0.18)', marginTop: 10 }}>
            <div style={{ width: `${pct}%`, background: '#10b981' }} />
            <div style={{ width: `${100 - pct}%`, background: 'rgba(220,38,38,0.75)' }} />
          </div>
          {typeof s.data?.reworkUsd === 'number' ? (
            <div style={{ fontSize: 11, color: MUTED, marginTop: 6 }}>
              ${Math.round(s.data.reworkUsd).toLocaleString('en-US')} rework
            </div>
          ) : null}
        </>
      )}
    </Tile>
  );
}

function LevelTile({ s }: { s: EntitySignal }) {
  const lvl = typeof s.value === 'number' ? s.value : null;
  return (
    <Tile label="Engineering maturity">
      <Big value={lvl == null ? '—' : `L${lvl}`} suffix={lvl == null ? undefined : 'of 5'} status={s.status as SignalStatus} />
      {typeof s.data?.teamsAssessed === 'number' && s.data.teamsAssessed > 0 ? (
        <div style={{ fontSize: 11, color: MUTED, marginTop: 6 }}>{s.data.teamsAssessed} team(s) assessed</div>
      ) : null}
    </Tile>
  );
}

function CodeTile({ s }: { s: EntitySignal }) {
  const score = typeof s.value === 'number' ? s.value : null;
  const d = s.data?.domains ?? {};
  return (
    <Tile label="Code maturity">
      <Big value={score == null ? '—' : score} suffix={score == null ? undefined : 'of 100'} status={s.status as SignalStatus} />
      {score != null ? (
        <div style={{ fontSize: 11, color: MUTED, marginTop: 6 }}>
          {[
            typeof d.security === 'number' ? `Sec ${d.security}` : null,
            typeof d.reliability === 'number' ? `Rel ${d.reliability}` : null,
            typeof d.maintainability === 'number' ? `Maint ${d.maintainability}` : null,
          ].filter(Boolean).join(' · ')}
        </div>
      ) : null}
    </Tile>
  );
}

function RadarTile({ s }: { s: EntitySignal }) {
  const total = typeof s.value === 'number' ? s.value : 0;
  const st = s.data?.stats ?? {};
  return (
    <Tile label="Tech radar">
      <Big value={total} suffix="technologies" status="ok" />
      <div style={{ fontSize: 11, color: MUTED, marginTop: 6 }}>
        {`${st.adopt ?? 0} adopt · ${st.trial ?? 0} trial · ${st.assess ?? 0} assess · ${st.hold ?? 0} hold`}
      </div>
    </Tile>
  );
}

export function EntityScaleQualityCard() {
  const { entity } = useEntity();
  const api = useApi(scaleQualityApiRef);
  const resolved = resolveScope(entity.metadata.annotations);

  const { value, loading, error } = useAsync(
    async () => (resolved ? api.getEntity(resolved.scope, resolved.id) : undefined),
    [resolved?.scope, resolved?.id],
  );

  if (!resolved) {
    return (
      <MissingAnnotationEmptyState
        annotation={[
          SCALEQUALITY_TEAM_ANNOTATION,
          SCALEQUALITY_BU_ANNOTATION,
          SCALEQUALITY_ORG_ANNOTATION,
        ]}
      />
    );
  }
  if (loading) {
    return (
      <InfoCard title="ScaleQuality">
        <Progress />
      </InfoCard>
    );
  }
  if (error) {
    return <ResponseErrorPanel error={error} />;
  }
  if (!value) {
    return null;
  }

  const { signals } = value;
  return (
    <InfoCard
      title="ScaleQuality"
      subheader={`${value.subject.type} · ${value.subject.name}`}
      deepLink={{ title: 'Open in ScaleQuality', link: signals.durability.deepLinkUrl }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 12 }}>
        <DurabilityTile s={signals.durability} />
        <LevelTile s={signals.engMaturity} />
        <CodeTile s={signals.codeMaturity} />
        <RadarTile s={signals.techRadar} />
      </div>
    </InfoCard>
  );
}
