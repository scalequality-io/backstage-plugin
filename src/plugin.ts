import {
  createApiFactory,
  createComponentExtension,
  createPlugin,
  discoveryApiRef,
  fetchApiRef,
} from '@backstage/core-plugin-api';

import { rootRouteRef } from './routes';
import { scaleQualityApiRef, ScaleQualityClient } from './api';

export const scaleQualityPlugin = createPlugin({
  id: 'scalequality',
  apis: [
    createApiFactory({
      api: scaleQualityApiRef,
      deps: { discoveryApi: discoveryApiRef, fetchApi: fetchApiRef },
      factory: ({ discoveryApi, fetchApi }) =>
        new ScaleQualityClient({ discoveryApi, fetchApi }),
    }),
  ],
  routes: {
    root: rootRouteRef,
  },
});

/**
 * Entity card showing the ScaleQuality signals (AI durability, engineering
 * maturity, code maturity, tech radar) for the entity's mapped scope.
 * Add it to your EntityPage; the scope is read from the entity annotations.
 */
export const EntityScaleQualityCard = scaleQualityPlugin.provide(
  createComponentExtension({
    name: 'EntityScaleQualityCard',
    component: {
      lazy: () =>
        import('./components/EntityScaleQualityCard').then(
          m => m.EntityScaleQualityCard,
        ),
    },
  }),
);
