import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'
import { getVimeoToken } from '../../utils/getVimeoToken'

interface VimeoVideo {
  uri: string
  name: string
  description: string | null
  duration: number
  type: string
  status: string
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

interface ImportableVideo {
  vimeo_id: string
  title: string
  description: string | null
  duration_seconds: number
  thumbnail: string | null
  is_past_event_recording: boolean
}

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const uid = user?.sub
  if (!uid) throw createError({ statusCode: 401, message: 'No autenticado' })

  const serviceClient = serverSupabaseServiceRole(event)
  const { data: adminRow } = await serviceClient
    .from('admin_users')
    .select('role')
    .eq('user_id', uid)
    .single()

  if (!adminRow || !['admin', 'editor'].includes(adminRow.role)) {
    throw createError({ statusCode: 403, message: 'Sin permisos' })
  }

  const token = getVimeoToken(event)
  if (!token) throw createError({ statusCode: 500, message: 'NUXT_VIMEO_TOKEN no configurado en runtime de Cloudflare' })

  // Get existing vimeo_ids from DB first
  const { data: existing } = await serviceClient
    .from('content_items')
    .select('vimeo_id')
    .eq('type', 'video')
    .not('vimeo_id', 'is', null)

  const existingIds = new Set((existing ?? []).map((r: any) => r.vimeo_id))
  const nowIso = new Date().toISOString()

  const { data: pastEventRows } = await serviceClient
    .from('events')
    .select('vimeo_live_event_id')
    .not('vimeo_live_event_id', 'is', null)
    .not('start_at', 'is', null)
    .lte('start_at', nowIso)

  const pastEventIds = new Set((pastEventRows ?? []).map((row: any) => row.vimeo_live_event_id))

  // Fetch from Vimeo sorted by date desc — stop as soon as we hit a known video
  const newVideos: ImportableVideo[] = []
  let page = 1
  const perPage = 100
  let done = false

  while (!done) {
    const res = await $fetch<VimeoResponse>(
      `https://api.vimeo.com/me/videos?fields=uri,name,description,duration,type,status,pictures.sizes,created_time,link&per_page=${perPage}&page=${page}&sort=date&direction=desc`,
      { headers: { Authorization: `Bearer ${token}` } },
    )

    for (const v of res.data) {
      const vimeoId = v.uri.replace('/videos/', '')
      if (existingIds.has(vimeoId)) {
        // We've reached videos that are already imported — stop
        done = true
        break
      }
      // Skip active/pending live events — those belong in /admin/eventos
      // But allow ended live streams (available with duration) as video recordings
      if (v.type === 'live' && !(v.status === 'available' && v.duration > 0)) continue
      const thumb = v.pictures.sizes.find(s => s.width === 640)
        ?? v.pictures.sizes[v.pictures.sizes.length - 1]
      newVideos.push({
        vimeo_id: vimeoId,
        title: v.name,
        description: v.description,
        duration_seconds: v.duration,
        thumbnail: thumb?.link ?? null,
        is_past_event_recording: pastEventIds.has(vimeoId),
      })
    }

    // No more pages
    if (page * perPage >= res.total) break
    page++
  }

  return { videos: newVideos, new_count: newVideos.length }
})
