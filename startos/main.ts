import { FileHelper, T } from '@start9labs/start-sdk'
import * as fs from 'node:fs/promises'
import { sdk } from './sdk'
import { arkUrl } from './utils'
import { i18n } from './i18n'
import { nodePorts, cookieMountpoint, cookiePath, uiPort } from './utils'
import { storeJson } from './fileModels/store.json'
import {
  checkNode,
  checkStorage,
  checkAddressIndex,
  checkEsplora,
} from './health'

export const main = sdk.setupMain(async ({ effects }) => {
  const settings = await storeJson.read().const(effects)
  const rpc = await sdk.host
    .getBridgeAddress(effects, {
      packageId: 'rbitcoin',
      hostId: 'rpc',
      internalPort: nodePorts.rpc,
      ssl: false,
    })
    .const()
  const electrum = await sdk.host
    .getBridgeAddress(effects, {
      packageId: 'rbitcoin',
      hostId: 'electrum',
      internalPort: nodePorts.electrum,
      ssl: false,
    })
    .const()
  const esplora = await sdk.host
    .getBridgeAddress(effects, {
      packageId: 'rbitcoin',
      hostId: 'esplora',
      internalPort: nodePorts.esplora,
      ssl: false,
    })
    .const()
  if (!rpc || !electrum || !esplora) {
    return sdk.Daemons.of(effects).addHealthCheck('node-connection', {
      ready: {
        display: i18n('rbitcoin connection'),
        fn: async () => ({
          result: 'failure',
          message: i18n(
            'Enable RPC, Electrum, and Esplora in rbitcoin and generate its RPC credentials',
          ),
        }),
      },
      requires: [],
    })
  }
  await fs.mkdir(sdk.volumes.data.path, { recursive: true })
  await fs.chown(sdk.volumes.data.path, 65532, 65532)
  await fs.chmod(sdk.volumes.data.path, 0o700)
  const rpcUrl = new URL(`http://${rpc}`)
  const sub = sdk.SubContainer.of(
    effects,
    { imageId: 'explorer' },
    sdk.Mounts.of()
      .mountVolume({
        volumeId: 'data',
        subpath: null,
        mountpoint: '/data',
        readonly: false,
      })
      .mountDependency<T.SDKManifest>({
        dependencyId: 'rbitcoin',
        volumeId: 'main',
        subpath: null,
        mountpoint: cookieMountpoint,
        readonly: true,
      }),
    'explorer',
  )
  const cookie = await FileHelper.string(`${await sub.rootfs}${cookiePath}`)
    .read()
    .const(effects)
  const split = cookie?.indexOf(':') ?? -1
  if (!cookie || split < 1 || split === cookie.length - 1) {
    return sdk.Daemons.of(effects).addHealthCheck('node-connection', {
      ready: {
        display: i18n('rbitcoin connection'),
        fn: async () => ({
          result: 'failure',
          message: i18n('Generate RPC credentials in rbitcoin'),
        }),
      },
      requires: [],
    })
  }
  const ip = await sdk.getContainerIp(effects).const()
  const explorerUrl = `http://${ip.includes(':') ? `[${ip}]` : ip}:${uiPort}`
  const proxyIp = await sdk.getOsIp(effects)
  return sdk.Daemons.of(effects)
    .addDaemon('explorer', {
      subcontainer: sub,
      exec: {
        command: sdk.useEntrypoint(),
        env: {
          LISTEN_ADDR: `[::]:${uiPort}`,
          WEB_DIR: '/srv/web',
          DATA_DIR: '/data',
          MAINNET_RPC_HOST: rpcUrl.hostname.replace(/^\[|\]$/g, ''),
          MAINNET_RPC_PORT: rpcUrl.port || '80',
          MAINNET_RPC_USER: cookie.slice(0, split),
          MAINNET_RPC_PASSWORD: cookie.slice(split + 1),
          MAINNET_ELECTRUM_ADDR: electrum,
          MAINNET_ESPLORA_URL: `http://${esplora}`,
          MAINNET_LIGHTNING_ENABLED: settings?.lightning ? 'true' : 'false',
          MAINNET_BARK_URL: arkUrl('bark', settings?.bark),
          MAINNET_ARKADE_URL: arkUrl('arkade', settings?.arkade),
          MCP_ENABLED: settings?.mcp ? 'true' : 'false',
          LOG_REQUESTS: 'failures',
          LOG_CLIENT_ADDR: 'false',
          CLOUDFLARE_WEB_ANALYTICS: 'false',
          TRUSTED_PROXY_HEADER: 'X-Forwarded-For',
          TRUSTED_PROXIES: proxyIp,
        },
      },
      ready: {
        display: i18n('Web interface'),
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, uiPort, {
            successMessage: i18n('The explorer is listening'),
            errorMessage: i18n('The explorer is not listening'),
          }),
      },
      requires: [],
    })
    .addHealthCheck('node-connection', {
      ready: {
        display: i18n('rbitcoin connection'),
        fn: () => checkNode(explorerUrl),
        trigger: sdk.trigger.statusTrigger(30_000, {
          starting: 5_000,
          failure: 5_000,
        }),
      },
      requires: ['explorer'],
    })
    .addHealthCheck('esplora', {
      ready: {
        display: i18n('Esplora API'),
        fn: () => checkEsplora(`http://${esplora}`),
        trigger: sdk.trigger.statusTrigger(30_000, {
          starting: 5_000,
          failure: 5_000,
        }),
      },
      requires: ['explorer'],
    })
    .addHealthCheck('storage', {
      ready: {
        display: i18n('Explorer storage'),
        fn: () => checkStorage(explorerUrl),
        trigger: sdk.trigger.statusTrigger(30_000, {
          starting: 5_000,
          failure: 5_000,
        }),
      },
      requires: ['explorer'],
    })
    .addHealthCheck('address-index', {
      ready: {
        display: i18n('Address-history index'),
        fn: () => checkAddressIndex(explorerUrl),
        trigger: sdk.trigger.statusTrigger(30_000, {
          starting: 5_000,
          failure: 5_000,
        }),
      },
      requires: ['explorer'],
    })
})
