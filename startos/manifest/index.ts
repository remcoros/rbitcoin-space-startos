import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'rbitcoin-space',
  title: 'rbitcoin.space',
  license: 'MIT',
  packageRepo: 'https://github.com/remcoros/rbitcoin-space-startos',
  upstreamRepo: 'https://github.com/smolcars/rbitcoin-space',
  donationUrl: null,
  marketingUrl: 'https://rbitcoin.space',
  description: { short, long },
  volumes: ['data', 'startos'],
  images: {
    explorer: {
      source: { dockerTag: 'ghcr.io/smolcars/rbitcoin-space:0.5.0' },
      arch: ['x86_64', 'aarch64'],
    },
  },
})
