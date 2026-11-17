import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

export const storeJson = FileHelper.json(
  { base: sdk.volumes.startos, subpath: 'store.json' },
  z.looseObject({
    lightning: z.boolean().catch(false),
    mcp: z.boolean().catch(false),
  }),
)
