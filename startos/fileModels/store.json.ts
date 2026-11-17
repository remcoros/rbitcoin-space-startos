import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

const arkSelection = z
  .discriminatedUnion('selection', [
    z.looseObject({
      selection: z.literal('disabled'),
      value: z.looseObject({}),
    }),
    z.looseObject({ selection: z.literal('public'), value: z.looseObject({}) }),
    z.looseObject({
      selection: z.literal('custom'),
      value: z.looseObject({ url: z.string() }),
    }),
  ])
  .catch({ selection: 'disabled', value: {} })

export const storeJson = FileHelper.json(
  { base: sdk.volumes.startos, subpath: 'store.json' },
  z.looseObject({
    lightning: z.boolean().catch(false),
    mcp: z.boolean().catch(false),
    bark: arkSelection,
    arkade: arkSelection,
  }),
)
