import {
  createApiRef,
  DiscoveryApi,
  FetchApi,
} from '@backstage/core-plugin-api';

export type SignalStatus = 'ok' | 'warn' | 'risk' | 'unknown';

export interface EntitySignal {
  value: number | null;
  unit: string | null;
  status: SignalStatus;
  provenance: 'MEASURED' | 'DECLARED' | 'PROJECTED' | string;
  data: any;
  deepLinkUrl: string;
}

export interface EntitySignals {
  subject: { type: string; id: string; name: string };
  measuredAt: string;
  signals: {
    durability: EntitySignal;
    engMaturity: EntitySignal;
    codeMaturity: EntitySignal;
    techRadar: EntitySignal;
  };
}

export interface ScaleQualityApi {
  /** All measured signals for one scope entity in a single response. */
  getEntity(scope: 'org' | 'bu' | 'team', id: string): Promise<EntitySignals>;
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

  async getEntity(scope: 'org' | 'bu' | 'team', id: string): Promise<EntitySignals> {
    const proxyBaseUrl = await this.discoveryApi.getBaseUrl('proxy');
    const url = `${proxyBaseUrl}/scalequality/entity/${encodeURIComponent(
      scope,
    )}/${encodeURIComponent(id)}`;
    const response = await this.fetchApi.fetch(url);
    if (!response.ok) {
      throw new Error(
        `ScaleQuality API request failed (${response.status} ${response.statusText})`,
      );
    }
    return (await response.json()) as EntitySignals;
  }
}
