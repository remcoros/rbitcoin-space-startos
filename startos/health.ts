import { z } from '@start9labs/start-sdk'
import { i18n } from './i18n'

const readiness = z.looseObject({
  networks: z.looseObject({
    mainnet: z.looseObject({
      rpc: z.enum([
        'pending',
        'ok',
        'auth_failed',
        'wrong_network',
        'unreachable',
      ]),
      electrum: z.boolean(),
      store: z.enum([
        'off',
        'open_failed',
        'failing',
        'wrong_chain',
        'waiting',
        'ok',
      ]),
      address_index: z.enum(['unknown', 'on', 'off']),
    }),
  }),
})

async function readReadiness(url: string) {
  const response = await fetch(`${url}/readyz`, {
    signal: AbortSignal.timeout(5000),
  })
  if (response.status !== 200 && response.status !== 503) {
    throw new Error('Unexpected readiness status')
  }
  return readiness.parse(await response.json()).networks.mainnet
}

export async function checkNode(url: string) {
  try {
    const state = await readReadiness(url)
    if (state.rpc === 'pending')
      return {
        result: 'starting' as const,
        waiting: true,
        message: i18n('Waiting for the first rbitcoin RPC check'),
      }
    if (state.rpc === 'auth_failed')
      return {
        result: 'failure' as const,
        message: i18n(
          'rbitcoin rejected the RPC cookie; check its credentials',
        ),
      }
    if (state.rpc === 'wrong_network')
      return {
        result: 'failure' as const,
        message: i18n('rbitcoin must use mainnet'),
      }
    if (state.rpc !== 'ok')
      return {
        result: 'failure' as const,
        message: i18n('rbitcoin RPC is unreachable; check the node API health'),
      }
    return state.electrum
      ? {
          result: 'success' as const,
          message: i18n('RPC and Electrum are ready'),
        }
      : {
          result: 'failure' as const,
          message: i18n('Electrum is disconnected; check the node API health'),
        }
  } catch {
    return {
      result: 'failure' as const,
      message: i18n(
        'The explorer readiness response is unavailable or invalid',
      ),
    }
  }
}

export async function checkStorage(url: string) {
  try {
    const state = await readReadiness(url)
    switch (state.store) {
      case 'ok':
        return {
          result: 'success' as const,
          message: i18n('Explorer storage is ready'),
        }
      case 'waiting':
        return {
          result: 'starting' as const,
          waiting: true,
          message: i18n(
            'Waiting for the node chain verification before storing history',
          ),
        }
      case 'open_failed':
        return {
          result: 'failure' as const,
          message: i18n(
            'The explorer database could not open; check the logs and available disk space',
          ),
        }
      case 'failing':
        return {
          result: 'failure' as const,
          message: i18n(
            'The explorer database cannot write; check available disk space and the logs',
          ),
        }
      case 'wrong_chain':
        return {
          result: 'failure' as const,
          message: i18n(
            'The explorer database belongs to a different chain; restore a matching backup',
          ),
        }
      case 'off':
        return {
          result: 'failure' as const,
          message: i18n('Explorer storage is disabled; check the service logs'),
        }
    }
  } catch {
    return {
      result: 'failure' as const,
      message: i18n(
        'The explorer readiness response is unavailable or invalid',
      ),
    }
  }
}

export async function checkAddressIndex(url: string) {
  try {
    const state = await readReadiness(url)
    switch (state.address_index) {
      case 'on':
        return {
          result: 'success' as const,
          message: i18n('The address-history index is enabled'),
        }
      case 'off':
        return {
          result: 'failure' as const,
          message: i18n(
            'Enable the address-history index in rbitcoin to use address pages',
          ),
        }
      case 'unknown':
        return {
          result: 'starting' as const,
          waiting: true,
          message: i18n('Waiting for the rbitcoin address-index check'),
        }
    }
  } catch {
    return {
      result: 'failure' as const,
      message: i18n(
        'The explorer readiness response is unavailable or invalid',
      ),
    }
  }
}

export async function checkEsplora(url: string) {
  try {
    const response = await fetch(`${url}/blocks/tip/height`, {
      signal: AbortSignal.timeout(5000),
    })
    const height = (await response.text()).trim()
    if (
      !response.ok ||
      !/^\d+$/.test(height) ||
      !Number.isSafeInteger(Number(height))
    ) {
      return {
        result: 'failure' as const,
        message: i18n(
          'Esplora did not return a valid block height; check the node API health',
        ),
      }
    }
    return {
      result: 'success' as const,
      message: i18n('Esplora is serving block data'),
    }
  } catch {
    return {
      result: 'failure' as const,
      message: i18n('Esplora is unreachable; check the node API health'),
    }
  }
}
