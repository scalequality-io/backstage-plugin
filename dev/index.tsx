import React from 'react';
import { createRoot } from 'react-dom/client';
import CssBaseline from '@material-ui/core/CssBaseline';
import Button from '@material-ui/core/Button';
import { ThemeProvider, createTheme } from '@material-ui/core/styles';
import { TestApiProvider } from '@backstage/test-utils';
import { EntityProvider } from '@backstage/plugin-catalog-react';
import { scaleQualityApiRef, ScaleQualityApi, EntitySignals } from '../src/api';
import {
  EntityScaleQualityCard,
  SCALEQUALITY_ORG_ANNOTATION,
} from '../src/components/EntityScaleQualityCard';
import fixture from './fixture.json';

/**
 * Standalone dev harness with no sign-in: `yarn start` renders the entity card
 * exactly as a real Backstage would, with real measured data from the Digital
 * Bank organization. Use the toggle to flip Backstage's light and dark themes.
 * The ScaleQuality API is mocked (returns the fixture) so no key or proxy is
 * needed to preview.
 */

const mockEntity = {
  apiVersion: 'backstage.io/v1alpha1',
  kind: 'Component',
  metadata: {
    name: 'digital-bank',
    title: 'Digital Bank',
    annotations: {
      [SCALEQUALITY_ORG_ANNOTATION]: 'fd571382-9108-443e-9fe1-3a0ded37cd18',
    },
  },
  spec: { type: 'service', lifecycle: 'production', owner: 'platform' },
};

const mockApi: ScaleQualityApi = {
  async getEntity(): Promise<EntitySignals> {
    return fixture as unknown as EntitySignals;
  },
};

function DevHarness() {
  const [dark, setDark] = React.useState(false);
  const theme = createTheme({ palette: { type: dark ? 'dark' : 'light' } });
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div
        style={{
          minHeight: '100vh',
          padding: 28,
          background: theme.palette.background.default,
        }}
      >
        <Button variant="outlined" onClick={() => setDark(d => !d)} style={{ marginBottom: 20 }}>
          Switch to {dark ? 'light' : 'dark'} theme
        </Button>
        <div style={{ maxWidth: 920 }}>
          <TestApiProvider apis={[[scaleQualityApiRef, mockApi]]}>
            <EntityProvider entity={mockEntity as any}>
              <EntityScaleQualityCard />
            </EntityProvider>
          </TestApiProvider>
        </div>
      </div>
    </ThemeProvider>
  );
}

let el = document.getElementById('root');
if (!el) {
  el = document.createElement('div');
  el.id = 'root';
  document.body.appendChild(el);
}
createRoot(el).render(<DevHarness />);
