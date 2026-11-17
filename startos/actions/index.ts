import { sdk } from '../sdk'
import { i18n } from '../i18n'
import { storeJson } from '../fileModels/store.json'

const settings = sdk.Action.withInput(
  'settings',
  {
    name: i18n('Explorer settings'),
    description: i18n(
      'Configure the Lightning explorer and read-only MCP server.',
    ),
    warning: i18n(
      'Saving restarts the explorer. Lightning connects directly to public peers and uses additional memory.',
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
  }),
  async () => {
    const settings = await storeJson.read().once()
    return {
      lightning: settings?.lightning ?? false,
      mcp: settings?.mcp ?? false,
    }
  },
  async ({ effects, input }) => {
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
