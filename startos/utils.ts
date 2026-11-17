export const uiPort = 8080
export { ports as nodePorts } from 'rbitcoin-startos/startos/utils'
export const cookieMountpoint = '/mnt/rbitcoin'
export const cookiePath = `${cookieMountpoint}/datadir/rpc.cookie`

export const arkPublicUrls = {
  bark: 'https://ark.second.tech',
  arkade: 'https://arkade.computer',
} as const

export type ArkProvider = keyof typeof arkPublicUrls
export type ArkSelection =
  | { selection: 'disabled'; value: Record<string, unknown> }
  | { selection: 'public'; value: Record<string, unknown> }
  | { selection: 'custom'; value: { url: string } }

export function isArkUrl(value: string, provider: ArkProvider): boolean {
  const text = value.trim()
  if (/[^\x21-\x7e]|\\/.test(text)) return false
  if (!/^https?:\/\/[^\s/?#]+(?:\/[^\s?#]*)?$/.test(text)) return false
  const authority = text.split('/')[2]
  if (authority.includes('@') || authority.endsWith(':')) return false
  if (provider === 'bark' && !/^[a-zA-Z0-9.\-:\[\]]+$/.test(authority))
    return false
  if (provider === 'bark' && !/^https?:\/\/[^/]+\/?$/.test(text)) return false
  try {
    const url = new URL(text)
    return !!url.hostname && url.port !== '0'
  } catch {
    return false
  }
}

export function arkUrl(provider: ArkProvider, setting?: ArkSelection): string {
  if (!setting || setting.selection === 'disabled') return ''
  if (setting.selection === 'public') return arkPublicUrls[provider]
  const url = setting.value.url.trim()
  if (!isArkUrl(url, provider)) throw new Error(`Invalid ${provider} endpoint`)
  return url
}
