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
import { scaleQualityApiRef } from '../api';
import {
  tokens,
  Panel,
  EngRadarBody,
  CodeMaturityBody,
  DurabilityBody,
  TechRadarBody,
} from './widgets';

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

export function EntityScaleQualityCard() {
  const { entity } = useEntity();
  const api = useApi(scaleQualityApiRef);
  const theme = useTheme();
  // Works across Material-UI v4 (`palette.type`) and v5 (`palette.mode`).
  const dark =
    (theme.palette as any).mode === 'dark' || (theme.palette as any).type === 'dark';
  const t = tokens(dark);
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
    return <Progress />;
  }
  if (error) {
    return <ResponseErrorPanel error={error} />;
  }
  if (!value) {
    return null;
  }

  const { signals } = value;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 16 }}>
      <Panel title="Eng maturity" deepLink={signals.engMaturity.deepLinkUrl} t={t}>
        <EngRadarBody s={signals.engMaturity} t={t} />
      </Panel>
      <Panel title="Code maturity" deepLink={signals.codeMaturity.deepLinkUrl} t={t}>
        <CodeMaturityBody s={signals.codeMaturity} t={t} />
      </Panel>
      <Panel title="Durability" deepLink={signals.durability.deepLinkUrl} t={t} wide>
        <DurabilityBody s={signals.durability} t={t} />
      </Panel>
      <Panel title="Tech Radar" deepLink={signals.techRadar.deepLinkUrl} t={t} wide>
        <TechRadarBody s={signals.techRadar} t={t} />
      </Panel>
    </div>
  );
}
