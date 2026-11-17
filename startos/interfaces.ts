import { sdk } from './sdk'
import { i18n } from './i18n'
import { uiPort } from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const origin = await sdk.MultiHost.of(effects, 'ui').bindPort(uiPort, {
    protocol: 'http',
    preferredExternalPort: 80,
    addSsl: { alpn: ['http/1.1'], preferredExternalPort: 443 },
    proxy: { addXForwardedHeaders: true },
  })
  return [
    await origin.export([
      sdk.createInterface(effects, {
        id: 'ui',
        name: i18n('Explorer'),
        description: i18n(
          'Mainnet block explorer and Esplora-compatible API. No authentication.',
        ),
        type: 'ui',
        masked: false,
        schemeOverride: null,
        username: null,
        path: '',
        query: {},
      }),
    ]),
  ]
})
