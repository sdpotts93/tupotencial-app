import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'

interface VimeoLiveEvent {
  uri: string
  title: string
  stream_description: string | null
  stream_privacy: { view: string }
  created_time: string
  pictures: { sizes: { link: string; width: number }[] } | null
}

interface VimeoResponse {
  total: number
  page: number
  per_page: number
  data: VimeoLiveEvent[]
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

  // Fetch live events from Vimeo sorted by date desc — stop when we hit a known one
  const newEvents: { vimeo_live_event_id: string; title: string; description: string | null; thumbnail: string | null }[] = []
  let page = 1
  const perPage = 100
  let done = false

  while (!done) {
    const res = await $fetch<VimeoResponse>(
      `https://api.vimeo.com/me/live_events?fields=uri,title,stream_description,stream_privacy,created_time,pictures.sizes&per_page=${perPage}&page=${page}&direction=desc`,
      { headers: { Authorization: `Bearer ${token}` } },
    )

    for (const e of res.data) {
      const liveId = e.uri.replace('/me/live_events/', '').replace('/users/', '').split('/live_events/').pop()!
      if (existingIds.has(liveId)) {
        done = true
        break
      }
      const thumb = e.pictures?.sizes.find(s => s.width === 640)
        ?? e.pictures?.sizes[e.pictures.sizes.length - 1]
      newEvents.push({
        vimeo_live_event_id: liveId,
        title: e.title,
        description: e.stream_description,
        thumbnail: thumb?.link ?? null,
      })
    }

    if (page * perPage >= res.total) break
    page++
  }

  return { events: newEvents, new_count: newEvents.length }
})
