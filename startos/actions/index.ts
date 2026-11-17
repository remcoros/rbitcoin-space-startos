import { sdk } from '../sdk'
import { i18n } from '../i18n'
import { storeJson } from '../fileModels/store.json'
import { ArkProvider, arkPublicUrls, isArkUrl } from '../utils'

const arkInput = (provider: ArkProvider) =>
  sdk.Value.union({
    name: provider === 'bark' ? i18n('Bark explorer') : i18n('Arkade explorer'),
    description: `${i18n('Look up mainnet VTXOs on the selected operator. The operator receives your lookup requests.')} ${i18n('Public server')}: ${arkPublicUrls[provider]}`,
    default: 'disabled',
    variants: sdk.Variants.of({
      disabled: { name: i18n('Disabled'), spec: sdk.InputSpec.of({}) },
      public: {
        name: i18n('Public server'),
        spec: sdk.InputSpec.of({}),
      },
      custom: {
        name: i18n('Custom URL'),
        spec: sdk.InputSpec.of({
          url: sdk.Value.text({
            name: i18n('Server URL'),
            description:
              provider === 'bark'
                ? i18n(
                    'HTTP or HTTPS host and optional port, without a path, credentials, query or fragment. Requires a compatible Bark gRPC API over HTTP/2.',
                  )
                : i18n(
                    'HTTP or HTTPS URL of a compatible Arkade public indexer. A base path is allowed; credentials, queries and fragments are not.',
                  ),
            required: true,
            default: arkPublicUrls[provider],
          }),
        }),
      },
    }),
  })

const settings = sdk.Action.withInput(
  'settings',
  {
    name: i18n('Explorer settings'),
    description: i18n(
      'Configure Lightning, Ark explorers and the read-only MCP server.',
    ),
    warning: i18n(
      'Saving restarts the explorer. Lightning connects to public peers and uses additional memory. Ark lookups connect to the selected servers.',
    ),
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  },
  sdk.InputSpec.of({
    lightning: sdk.Value.toggle({
      name: i18n('Lightning explorer'),
      default: false,
    }),
    mcp: sdk.Value.toggle({
      name: i18n('Read-only MCP server'),
      description: i18n(
        'Allows AI clients to query this explorer at /mcp without authentication. It cannot broadcast transactions.',
      ),
      default: false,
    }),
    bark: arkInput('bark'),
    arkade: arkInput('arkade'),
  }),
  async () => {
    const settings = await storeJson.read().once()
    return {
      lightning: settings?.lightning ?? false,
      mcp: settings?.mcp ?? false,
      bark: settings?.bark ?? { selection: 'disabled' as const, value: {} },
      arkade: settings?.arkade ?? { selection: 'disabled' as const, value: {} },
    }
  },
  async ({ effects, input }) => {
    for (const provider of ['bark', 'arkade'] as const) {
      const setting = input[provider]
      if (
        setting.selection === 'custom' &&
        !isArkUrl(setting.value.url, provider)
      )
        throw new Error(
          provider === 'bark'
            ? i18n(
                'Invalid Bark URL. Use an HTTP or HTTPS host with an optional port and no path, credentials, query or fragment.',
              )
            : i18n(
                'Invalid Arkade URL. Use an HTTP or HTTPS URL without credentials, a query or a fragment.',
              ),
        )
    }
    await storeJson.merge(effects, input)
    return {
      version: '1',
      title: i18n('Settings saved'),
      message: null,
      result: null,
    }
  },
)

export const actions = sdk.Actions.of().addAction(settings)
