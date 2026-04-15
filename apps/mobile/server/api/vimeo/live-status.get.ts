import { getVimeoToken } from '../../utils/getVimeoToken'

interface VimeoVideoResponse {
  type: string
  status: string
  transcode?: {
    status: string
  }
}

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const vimeoId = query.id as string

  if (!vimeoId) {
    throw createError({ statusCode: 400, message: 'Missing vimeo ID' })
  }

  const token = getVimeoToken(event)
  if (!token) {
    throw createError({ statusCode: 500, message: 'Vimeo token not configured' })
  }

  try {
    // Query the videos API - for live videos, transcode.status = "in_progress" means streaming
    const res = await $fetch<VimeoVideoResponse>(
      `https://api.vimeo.com/videos/${vimeoId}?fields=type,status,transcode.status`,
      { headers: { Authorization: `Bearer ${token}` } },
    )

    // For live videos: transcode.status "in_progress" = actively streaming
    const isStreaming = res.type === 'live' && res.transcode?.status === 'in_progress'

    return {
      is_transmitting: isStreaming,
      status: res.status,
      transcode_status: res.transcode?.status ?? null,
      type: res.type,
    }
  }
  catch (err: any) {
    const errorData = err.data || err.response?._data || {}
    console.error('Vimeo API error:', err.message, 'Data:', JSON.stringify(errorData))
    return { is_transmitting: false, status: null, error: err.message, details: errorData }
  }
})
