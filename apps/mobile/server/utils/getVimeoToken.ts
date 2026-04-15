import type { H3Event } from 'h3'

type CloudflareEnv = {
  NUXT_VIMEO_TOKEN?: string
  VIMEO_TOKEN?: string
}

export function getVimeoToken(event: H3Event) {
  const runtimeToken = useRuntimeConfig(event).vimeoToken
  if (runtimeToken) return runtimeToken

  const cloudflareEnv = (event.context.cloudflare as { env?: CloudflareEnv } | undefined)?.env
  if (cloudflareEnv?.NUXT_VIMEO_TOKEN) return cloudflareEnv.NUXT_VIMEO_TOKEN
  if (cloudflareEnv?.VIMEO_TOKEN) return cloudflareEnv.VIMEO_TOKEN

  if (process.env.NUXT_VIMEO_TOKEN) return process.env.NUXT_VIMEO_TOKEN
  if (process.env.VIMEO_TOKEN) return process.env.VIMEO_TOKEN

  return ''
}
