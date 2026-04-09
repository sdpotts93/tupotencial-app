import { serverSupabaseClient, serverSupabaseServiceRole } from '#supabase/server'

interface AdminUserRow {
  id: string
  user_id: string
  role: 'admin' | 'editor' | 'read_only'
  created_at: string
}

interface ProfileRow {
  id: string
  display_name: string | null
  avatar_url: string | null
  email: string | null
}

export default defineEventHandler(async (event) => {
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

  if (!adminRow || adminRow.role !== 'admin') {
    throw createError({ statusCode: 403, message: 'Sin permisos' })
  }

  const query = getQuery(event)
  const from = Math.max(0, Number(query.from ?? 0) || 0)
  const to = Math.max(from, Number(query.to ?? from + 19) || (from + 19))
  const search = String(query.search ?? '').trim().toLowerCase()

  const { data: admins, error: adminsError } = await serviceClient
    .from('admin_users')
    .select('id, user_id, role, created_at')
    .order('created_at', { ascending: false })

  if (adminsError) {
    throw createError({ statusCode: 500, message: adminsError.message })
  }

  const adminUsers = (admins ?? []) as AdminUserRow[]
  const userIds = adminUsers.map(row => row.user_id)
  if (!userIds.length) return []
  const userIdSet = new Set(userIds)

  const { data: profiles, error: profilesError } = await serviceClient
    .from('profiles')
    .select('id, display_name, avatar_url, email')
    .in('id', userIds)

  if (profilesError) {
    throw createError({ statusCode: 500, message: profilesError.message })
  }

  const profileMap = new Map<string, ProfileRow>((profiles ?? []).map(row => [row.id, row as ProfileRow]))
  const authEmailMap = new Map<string, string>()

  let page = 1
  const perPage = 200
  let done = false

  while (!done) {
    const { data, error } = await serviceClient.auth.admin.listUsers({ page, perPage })
    if (error) {
      throw createError({ statusCode: 500, message: error.message })
    }

    const users = data?.users ?? []
    for (const user of users) {
      if (userIdSet.has(user.id)) {
        authEmailMap.set(user.id, user.email ?? '')
      }
    }

    done = users.length < perPage || authEmailMap.size >= userIdSet.size
    page += 1
  }

  const rows = adminUsers
    .map((row) => {
      const profile = profileMap.get(row.user_id)
      const email = profile?.email?.trim() || authEmailMap.get(row.user_id)?.trim() || '—'
      return {
        ...row,
        full_name: profile?.display_name ?? 'Sin nombre',
        avatar_url: profile?.avatar_url ?? null,
        email,
        status: 'active',
        last_login: null as string | null,
      }
    })
    .filter((row) => {
      if (!search) return true
      return row.full_name.toLowerCase().includes(search) || row.email.toLowerCase().includes(search)
    })

  return rows.slice(from, to + 1)
})
