import { sdk } from './sdk'
import { i18n } from './i18n'
import { apis } from 'rbitcoin-startos/startos/actions/apis'
import { indexes } from 'rbitcoin-startos/startos/actions/indexes'

export const dependencies = sdk.Dependencies.of().addDependency(
  sdk.Dependency.required('rbitcoin', {
    description: i18n(
      'Provides blocks, transactions, addresses, and the live mempool.',
    ),
    metadata: {
      title: 'rbitcoin',
      icon: 'assets/rbitcoin.png',
    },
    kind: 'running',
    versionRange: '>=0.9.2:0 <0.10.0:0',
    healthChecks: ['rpc', 'electrum', 'esplora'],
  }).withInit(async (effects) => {
    const requiredApis = {
      rpc: { selection: 'enabled' as const },
      electrum_listen: true,
      esplora_listen: true,
    }
    await sdk.action.createTask(effects, 'rbitcoin', apis, 'critical', {
      input: { kind: 'partial', accept: [requiredApis], set: requiredApis },
      when: { condition: 'input-not-matches', once: false },
      reason: i18n('Enable RPC, Electrum, and Esplora for the explorer'),
    })
    await sdk.action.createTask(effects, 'rbitcoin', indexes, 'critical', {
      input: {
        kind: 'partial',
        accept: [{ sh_index: true }],
        set: { sh_index: true },
      },
      when: { condition: 'input-not-matches', once: false },
      reason: i18n(
        'Enable the address-history index for explorer address pages',
      ),
    })
  }),
)
