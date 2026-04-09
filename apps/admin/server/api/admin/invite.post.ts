import { serverSupabaseUser, serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  // 1. Auth — only logged-in admins can invite
  const user = await serverSupabaseUser(event)
  if (!user) throw createError({ statusCode: 401, message: 'No autenticado' })

  // 2. Service role client for admin operations
  const serviceClient = serverSupabaseServiceRole(event)

  // 3. Verify requester is an admin (role = 'admin')
  const { data: adminRow, error: adminError } = await serviceClient
    .from('admin_users')
    .select('role')
    .eq('user_id', user.sub)
    .single()

  if (!adminRow || adminRow.role !== 'admin') {
    throw createError({ statusCode: 403, message: 'Solo administradores pueden invitar usuarios' })
  }

  // 4. Read invite payload
  const body = await readBody<{
    email: string
    full_name: string
    role: 'admin' | 'editor' | 'read_only'
  }>(event)

  if (!body.email?.trim()) throw createError({ statusCode: 400, message: 'Email requerido' })
  if (!body.full_name?.trim()) throw createError({ statusCode: 400, message: 'Nombre requerido' })

  // 5. Create user via Supabase Auth Admin (sends invite email)
  const { data: inviteData, error: inviteError } = await serviceClient.auth.admin.inviteUserByEmail(
    body.email.trim(),
    {
      data: { display_name: body.full_name.trim() },
      redirectTo: `${event.node.req.headers.origin ?? 'https://admin.tupotencial.com'}/confirm`,
    },
  )

  if (inviteError) {
    if (inviteError.message?.includes('already been registered')) {
      throw createError({ statusCode: 409, message: 'Este correo ya tiene una cuenta registrada' })
    }
    throw createError({ statusCode: 500, message: inviteError.message })
  }

  const newUserId = inviteData.user?.id
  if (!newUserId) throw createError({ statusCode: 500, message: 'No se pudo crear el usuario' })

  // 6. Create profile + admin_users entry
  await serviceClient.from('profiles').upsert({
    id: newUserId,
    display_name: body.full_name.trim(),
    email: body.email.trim().toLowerCase(),
    community_segment: 'conjunta',
  })

  await serviceClient.from('admin_users').insert({
    user_id: newUserId,
    role: body.role,
  })

  return { success: true, userId: newUserId }
})
