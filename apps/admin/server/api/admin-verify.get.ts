// Verifies the current user is an admin and returns their profile data.
// Used by useAdminAuth().restore() during SSR, where the plugin-scoped
// Supabase client doesn't have the request's auth context.
import { serverSupabaseClient, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const uid = user?.sub
  const email = user?.email ?? ''
  if (!uid) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }

  const client = await serverSupabaseClient(event)

  const { data: adminRow } = await client
    .from('admin_users')
    .select('role')
    .eq('user_id', uid)
    .single()

  if (!adminRow) {
    throw createError({ statusCode: 403, statusMessage: 'Not an admin' })
  }

  const { data: profile } = await client
    .from('profiles')
    .select('display_name, avatar_url')
    .eq('id', uid)
    .single()

  return {
    uid,
    email,
    role: adminRow.role,
    display_name: profile?.display_name ?? null,
    avatar_url: profile?.avatar_url ?? null,
  }
})
