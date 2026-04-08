import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'

interface VimeoVideo {
  uri: string
  name: string
  description: string | null
  duration: number
  type: string
  pictures: { sizes: { link: string; width: number }[] }
  created_time: string
  link: string
}

interface VimeoResponse {
  total: number
  page: number
  per_page: number
  data: VimeoVideo[]
}

export default defineEventHandler(async (event) => {
  // Auth check
  const client = await serverSupabaseClient(event)
  const { data: claimsData, error: claimsError } = await client.auth.getClaims()
  const uid = (claimsData?.claims as any)?.sub
  if (claimsError || !uid) throw createError({ statusCode: 401, message: 'No autenticado' })

  const serviceClient = serverSupabaseServiceRole(event)
  const { data: adminRow } = await serviceClient
    .from('admin_users')
    .select('role')
    .eq('user_id', uid)
    .single()

  if (!adminRow || !['admin', 'editor'].includes(adminRow.role)) {
    throw createError({ statusCode: 403, message: 'Sin permisos' })
  }

  const token = useRuntimeConfig().vimeoToken
  if (!token) throw createError({ statusCode: 500, message: 'VIMEO_TOKEN no configurado' })

  // Get existing vimeo_live_event_ids from DB
  const { data: existing } = await serviceClient
    .from('events')
    .select('vimeo_live_event_id')
    .not('vimeo_live_event_id', 'is', null)

  const existingIds = new Set((existing ?? []).map((r: any) => r.vimeo_live_event_id))

  // Fetch from /me/videos filtered to type=live, sorted by date desc
  const newEvents: { vimeo_live_event_id: string; title: string; description: string | null; duration_seconds: number; thumbnail: string | null }[] = []
  let page = 1
  const perPage = 100
  let done = false

  while (!done) {
    const res = await $fetch<VimeoResponse>(
      `https://api.vimeo.com/me/videos?fields=uri,name,description,duration,type,pictures.sizes,created_time,link&filter=live&per_page=${perPage}&page=${page}&sort=date&direction=desc`,
      { headers: { Authorization: `Bearer ${token}` } },
    )

    for (const v of res.data) {
      if (v.type !== 'live') continue
      const vimeoId = v.uri.replace('/videos/', '')
      if (existingIds.has(vimeoId)) {
        done = true
        break
      }
      const thumb = v.pictures.sizes.find(s => s.width === 640)
        ?? v.pictures.sizes[v.pictures.sizes.length - 1]
      newEvents.push({
        vimeo_live_event_id: vimeoId,
        title: v.name,
        description: v.description,
        duration_seconds: v.duration,
        thumbnail: thumb?.link ?? null,
      })
    }

    if (page * perPage >= res.total) break
    page++
  }

  return { events: newEvents, new_count: newEvents.length }
})
