import React from 'react';
import {
  Progress,
  ResponseErrorPanel,
  MissingAnnotationEmptyState,
} from '@backstage/core-components';
import { useApi } from '@backstage/core-plugin-api';
import { useEntity } from '@backstage/plugin-catalog-react';
import { useTheme } from '@material-ui/core/styles';
import useAsync from 'react-use/lib/useAsync';
import useMeasure from 'react-use/lib/useMeasure';
import { EntitySignal, ScaleQualityScope, scaleQualityApiRef } from '../api';
import {
  tokens,
  Panel,
  HealthBody,
  SecurityBody,
  ComplianceBody,
  LicensesBody,
  CoverageBody,
  EngMaturityBody,
  AiBody,
  PeopleCostBody,
  InitiativesBody,
  EvolutionBody,
  TechRadarBody,
} from './widgets';

export const SCALEQUALITY_ORG_ANNOTATION = 'scalequality.io/org-id';
export const SCALEQUALITY_BU_ANNOTATION = 'scalequality.io/bu-id';
export const SCALEQUALITY_TEAM_ANNOTATION = 'scalequality.io/team-id';
export const SCALEQUALITY_AREA_ANNOTATION = 'scalequality.io/area-id';
export const SCALEQUALITY_REPO_ANNOTATION = 'scalequality.io/repo-id';

// Most specific wins: a repository over a team, a team over a business area, then the unit, then the org.
const ORDER: Array<[string, ScaleQualityScope]> = [
  [SCALEQUALITY_REPO_ANNOTATION, 'repo'],
  [SCALEQUALITY_TEAM_ANNOTATION, 'team'],
  [SCALEQUALITY_AREA_ANNOTATION, 'area'],
  [SCALEQUALITY_BU_ANNOTATION, 'bu'],
  [SCALEQUALITY_ORG_ANNOTATION, 'org'],
];
function resolveScope(annotations: Record<string, string> | undefined): { scope: ScaleQualityScope; id: string } | null {
  const a = annotations ?? {};
  for (const [key, scope] of ORDER) if (a[key]) return { scope, id: a[key] };
  return null;
}

export function EntityScaleQualityCard() {
  const { entity } = useEntity();
  const api = useApi(scaleQualityApiRef);
  const theme = useTheme();
  // Works across Material-UI v4 (`palette.type`) and v5 (`palette.mode`).
  const dark = (theme.palette as any).mode === 'dark' || (theme.palette as any).type === 'dark';
  const t = tokens(dark);
  const resolved = resolveScope(entity.metadata.annotations);
  const [ref, { width }] = useMeasure<HTMLDivElement>();
  const [compliance, setCompliance] = React.useState<EntitySignal | undefined>();

  const { value, loading, error } = useAsync(
    async () => (resolved ? api.getEntity(resolved.scope, resolved.id) : undefined),
    [resolved?.scope, resolved?.id],
  );
  React.useEffect(() => setCompliance(undefined), [resolved?.scope, resolved?.id]);

  if (!resolved) {
    return <MissingAnnotationEmptyState annotation={ORDER.map(([key]) => key)} />;
  }
  if (loading) return <Progress />;
  if (error) return <ResponseErrorPanel error={error} />;
  if (!value) return null;

  const s = value.signals;
  const columns = width >= 960 ? 3 : width >= 620 ? 2 : 1;
  const wide = Math.min(2, columns);
  const switchRegime = (regime: string) => {
    api.getCompliance(resolved.scope, resolved.id, regime).then(setCompliance).catch(() => undefined);
  };
  // Each widget only when the entity is read for it and the key carries it.
  const cards: Array<{ key: string; title: string; signal?: EntitySignal; span: number; fill?: boolean; body: React.ReactNode }> = [
    { key: 'health', title: 'Health', signal: s.health, span: wide, body: <HealthBody s={s.health} t={t} /> },
    { key: 'security', title: 'Security', signal: s.security, span: 1, body: <SecurityBody s={s.security} t={t} /> },
    { key: 'compliance', title: 'Compliance', signal: compliance ?? s.compliance, span: wide, body: <ComplianceBody s={compliance ?? s.compliance} t={t} scope={resolved.scope} onRegime={switchRegime} /> },
    { key: 'licenses', title: 'Licenses', signal: s.licenses, span: 1, fill: true, body: <LicensesBody s={s.licenses} t={t} /> },
    { key: 'coverage', title: 'Test coverage', signal: s.coverage, span: 1, fill: true, body: <CoverageBody s={s.coverage} t={t} /> },
    { key: 'engMaturity', title: 'Engineering maturity', signal: s.engMaturity, span: 1, body: <EngMaturityBody s={s.engMaturity} t={t} /> },
    { key: 'ai', title: 'AI', signal: s.ai, span: 1, fill: true, body: <AiBody s={s.ai} t={t} /> },
    { key: 'peopleCost', title: 'People and cost', signal: s.peopleCost, span: 1, body: <PeopleCostBody s={s.peopleCost} t={t} /> },
    { key: 'initiatives', title: 'Initiatives', signal: s.initiatives, span: 1, body: <InitiativesBody s={s.initiatives} t={t} /> },
    { key: 'evolution', title: 'Evolution', signal: s.evolution, span: 1, body: <EvolutionBody s={s.evolution} t={t} /> },
    { key: 'techRadar', title: 'Technology landscape', signal: s.techRadar, span: 1, body: <TechRadarBody s={s.techRadar} t={t} /> },
  ].filter(c => (s as Record<string, EntitySignal | undefined>)[c.key] !== undefined);

  return (
    <div ref={ref} style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: 14 }}>
      {cards.map(c => <Panel key={c.key} title={c.title} signal={c.signal} t={t} span={c.span} fill={c.fill}>{c.body}</Panel>)}
    </div>
  );
}
