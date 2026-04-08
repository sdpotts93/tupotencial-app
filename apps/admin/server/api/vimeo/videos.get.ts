import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'

interface VimeoVideo {
  uri: string
  name: string
  description: string | null
  duration: number
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
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, message: 'No autenticado' })

  const serviceClient = serverSupabaseServiceRole(event)
  const { data: adminRow } = await serviceClient
    .from('admin_users')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (!adminRow || !['admin', 'editor'].includes(adminRow.role)) {
    throw createError({ statusCode: 403, message: 'Sin permisos' })
  }

  const token = useRuntimeConfig().vimeoToken
  if (!token) throw createError({ statusCode: 500, message: 'VIMEO_TOKEN no configurado' })

  // Get existing vimeo_ids from DB first
  const { data: existing } = await serviceClient
    .from('content_items')
    .select('vimeo_id')
    .eq('type', 'video')
    .not('vimeo_id', 'is', null)

  const existingIds = new Set((existing ?? []).map((r: any) => r.vimeo_id))

  // Fetch from Vimeo sorted by date desc — stop as soon as we hit a known video
  const newVideos: { vimeo_id: string; title: string; description: string | null; duration_seconds: number; thumbnail: string | null }[] = []
  let page = 1
  const perPage = 100
  let done = false

  while (!done) {
    const res = await $fetch<VimeoResponse>(
      `https://api.vimeo.com/me/videos?fields=uri,name,description,duration,pictures.sizes,created_time,link&per_page=${perPage}&page=${page}&sort=date&direction=desc`,
      { headers: { Authorization: `Bearer ${token}` } },
    )

    for (const v of res.data) {
      const vimeoId = v.uri.replace('/videos/', '')
      if (existingIds.has(vimeoId)) {
        // We've reached videos that are already imported — stop
        done = true
        break
      }
      const thumb = v.pictures.sizes.find(s => s.width === 640)
        ?? v.pictures.sizes[v.pictures.sizes.length - 1]
      newVideos.push({
        vimeo_id: vimeoId,
        title: v.name,
        description: v.description,
        duration_seconds: v.duration,
        thumbnail: thumb?.link ?? null,
      })
    }

    // No more pages
    if (page * perPage >= res.total) break
    page++
  }

  return { videos: newVideos, new_count: newVideos.length }
})
