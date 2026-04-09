import { getRouterParam } from 'h3'
import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const uid = user?.sub
  if (!uid) throw createError({ statusCode: 401, message: 'No autenticado' })

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'Administrador inválido' })

  const serviceClient = serverSupabaseServiceRole(event)
  const { data: actingAdmin } = await serviceClient
    .from('admin_users')
    .select('role')
    .eq('user_id', uid)
    .single()

  if (!actingAdmin || actingAdmin.role !== 'admin') {
    throw createError({ statusCode: 403, message: 'Sin permisos' })
  }

  const { data: targetAdmin, error: targetError } = await serviceClient
    .from('admin_users')
    .select('id, user_id')
    .eq('id', id)
    .single()

  if (targetError) {
    throw createError({ statusCode: 500, message: targetError.message })
  }

  if (!targetAdmin) {
    throw createError({ statusCode: 404, message: 'Administrador no encontrado' })
  }

  if (targetAdmin.user_id === uid) {
    throw createError({ statusCode: 400, message: 'No puedes eliminar tu propio acceso de administrador' })
  }

  const { error } = await serviceClient
    .from('admin_users')
    .delete()
    .eq('id', id)

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  return { success: true }
})
