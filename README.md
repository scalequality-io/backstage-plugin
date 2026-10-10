# @scalequality/backstage-plugin

Render [ScaleQuality](https://scalequality.io)'s **measured** signals as entity cards in
Backstage: health, security, compliance, licenses, test coverage, engineering maturity,
AI, people and cost, initiatives, evolution and the technology landscape, for the org,
business unit, team, business area or repository the entity maps to. Each card links back
into ScaleQuality for the full story.

The card reads ScaleQuality's public read-only `/v1` API through the Backstage backend
**proxy**, so your org-scoped API key (`sq_live_...`) is injected server-side and never
reaches the browser.

## The card

The entity card renders theme-aware from real measured signals, so it stays clean in
both Backstage themes.

![ScaleQuality entity card in the Backstage light theme](https://raw.githubusercontent.com/scalequality-io/backstage-plugin/main/assets/card-light.png)

![ScaleQuality entity card in the Backstage dark theme](https://raw.githubusercontent.com/scalequality-io/backstage-plugin/main/assets/card-dark.png)

## Install

```bash
# from your Backstage app root
yarn --cwd packages/app add @scalequality/backstage-plugin
```

## 1. Configure the proxy

Add to `app-config.yaml` (the key stays in your backend / secret store):

```yaml
proxy:
  endpoints:
    '/scalequality':
      target: https://app.scalequality.io/v1
      changeOrigin: true
      headers:
        Authorization: 'Bearer ${SCALEQUALITY_API_KEY}'
```

Create the API key in ScaleQuality under **Developers**, then set
`SCALEQUALITY_API_KEY` in your environment. The key is read-only and scoped to your org.

## 2. Add the card to your EntityPage

`packages/app/src/components/catalog/EntityPage.tsx`:

```tsx
import { EntityScaleQualityCard } from '@scalequality/backstage-plugin';

// inside the entity page grid, e.g. the overview content:
<Grid item md={6}>
  <EntityScaleQualityCard />
</Grid>
```

## 3. Map entities to a ScaleQuality scope

Annotate the entity (Component / Group) with the ScaleQuality id it should show. Most
specific wins (repository > team > business area > business unit > org):

```yaml
metadata:
  annotations:
    scalequality.io/repo-id: <project-uuid>   # a repository, or one module of a monorepo
    # or: scalequality.io/team-id: <team-uuid>
    # or: scalequality.io/area-id: <business-area-uuid>
    # or: scalequality.io/bu-id: <bu-uuid>
    # or: scalequality.io/org-id: <org-uuid>
```

Find the ids in ScaleQuality's `GET /v1/catalog` (org, business units, teams, business
areas and repositories), or in Developers › IDP, where each widget shows its endpoint.

## What it shows

Each widget appears only where it applies and when your key carries it. A widget with no
measurement yet renders its empty state, never a fake value or a zero.

| Widget | Where | Source | Key scope |
|---|---|---|---|
| Health (score, level, domains, coverage, licenses allowed) | all five | Diagnosis per repository | `maturity:read` |
| Security (open findings by severity) | all five | latest measurement per repository | `maturity:read` |
| Test coverage (with its history) | all five | measured executed lines | `maturity:read` |
| Evolution (score over 180 days, level bands) | all five | measurements kept | `maturity:read` |
| Licenses (components by family, policy) | all five | license inventory + your policy | `evidence:read` |
| Compliance (one regime's controls, audit dossier) | all five | controls engine | `evidence:read` |
| AI (spend by source, people using AI, durability) | org, unit, team, area | provider readings + ScaleQuality AI | `durability:read` |
| People and cost | org, unit, team, area | people × average salary | `business:read` |
| Initiatives (planned, real, projected saving) | org, team, area | AI Portfolio | `business:read` |
| Engineering maturity (L1 to L5, six domains) | org, unit, team | assessments | `maturity:read` |
| Technology landscape | org, unit, team | configured radar | `catalog:read` |

For a business area or a repository, Compliance reads the entity's own repositories. The
controls that are kept per team come from the teams that own those repositories: the card
names them, says how many repositories no team owns, and says they are not applicable when
no team owns any. They are never counted as met.

`business:read` is never part of a key's default read. People cost over headcount is a
team's average salary, so create the key with **Share people cost and initiatives**
checked only if your portal should show it. People cost is hidden below three people.
No widget shows one person's figure.

## License

Apache-2.0
