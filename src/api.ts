import {
  createApiRef,
  DiscoveryApi,
  FetchApi,
} from '@backstage/core-plugin-api';

export type SignalStatus = 'ok' | 'warn' | 'risk' | 'unknown';

/** The entities ScaleQuality reads: the org tree, a business area, and a repository (a monorepo module is one of its own). */
export type ScaleQualityScope = 'org' | 'bu' | 'team' | 'area' | 'repo';

export interface EntitySignal<D = any> {
  value: number | null;
  unit: string | null;
  status: SignalStatus;
  provenance: 'MEASURED' | 'ESTIMATED' | 'DECLARED' | string;
  data: D;
  deepLinkUrl: string;
}

/**
 * Every signal the entity is read for and the API key grants. A signal the
 * scope does not support, or the key does not carry, is simply absent:
 * people cost and initiatives need a key created with business data shared.
 */
export interface EntitySignals {
  subject: { type: ScaleQualityScope; id: string; name: string };
  measuredAt: string;
  signals: Partial<Record<
    | 'health' | 'security' | 'compliance' | 'licenses' | 'coverage' | 'engMaturity'
    | 'ai' | 'peopleCost' | 'initiatives' | 'evolution' | 'techRadar' | 'durability' | 'codeMaturity',
    EntitySignal
  >>;
}

export interface ScaleQualityApi {
  /** All signals for one entity in a single response. */
  getEntity(scope: ScaleQualityScope, id: string): Promise<EntitySignals>;
  /** One regime's controls for the entity (the entity carries the first regime). */
  getCompliance(scope: ScaleQualityScope, id: string, regime: string): Promise<EntitySignal>;
}

export const scaleQualityApiRef = createApiRef<ScaleQualityApi>({
  id: 'plugin.scalequality.service',
});

/**
 * Talks to ScaleQuality's public /v1 API through the Backstage backend proxy
 * (proxy id `scalequality`), so the org-scoped `sq_live_` key is injected
 * server-side and never reaches the browser.
 */
export class ScaleQualityClient implements ScaleQualityApi {
  private readonly discoveryApi: DiscoveryApi;
  private readonly fetchApi: FetchApi;

  constructor(options: { discoveryApi: DiscoveryApi; fetchApi: FetchApi }) {
    this.discoveryApi = options.discoveryApi;
    this.fetchApi = options.fetchApi;
  }

  private async get<T>(path: string): Promise<T> {
    const proxyBaseUrl = await this.discoveryApi.getBaseUrl('proxy');
    const response = await this.fetchApi.fetch(`${proxyBaseUrl}/scalequality${path}`);
    if (!response.ok) {
      throw new Error(`ScaleQuality API request failed (${response.status} ${response.statusText})`);
    }
    return (await response.json()) as T;
  }

  getEntity(scope: ScaleQualityScope, id: string): Promise<EntitySignals> {
    return this.get(`/entity/${encodeURIComponent(scope)}/${encodeURIComponent(id)}`);
  }

  async getCompliance(scope: ScaleQualityScope, id: string, regime: string): Promise<EntitySignal> {
    const env = await this.get<any>(`/compliance/${encodeURIComponent(scope)}/${encodeURIComponent(id)}?regime=${encodeURIComponent(regime)}`);
    return { value: env?.headline?.value ?? null, unit: env?.headline?.unit ?? null, status: env?.status, provenance: env?.provenance, data: env?.data, deepLinkUrl: env?.deepLinkUrl };
  }
}
