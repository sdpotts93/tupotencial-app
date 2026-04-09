import { getRouterParam, readBody } from 'h3'
import { serverSupabaseServiceRole, serverSupabaseUser } from '#supabase/server'

const allowedRoles = new Set(['admin', 'editor', 'read_only'])

export default defineEventHandler(async (event) => {
  const user = await serverSupabaseUser(event)
  const uid = user?.sub
  if (!uid) throw createError({ statusCode: 401, message: 'No autenticado' })

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'Administrador inválido' })

  const body = await readBody<{ role?: string }>(event)
  const role = body.role?.trim()
  if (!role || !allowedRoles.has(role)) {
    throw createError({ statusCode: 400, message: 'Rol inválido' })
  }

  const serviceClient = serverSupabaseServiceRole(event)
  const { data: adminRow } = await serviceClient
    .from('admin_users')
    .select('role')
    .eq('user_id', uid)
    .single()

  if (!adminRow || adminRow.role !== 'admin') {
    throw createError({ statusCode: 403, message: 'Sin permisos' })
  }

  const { data: updatedRow, error } = await serviceClient
    .from('admin_users')
    .update({ role })
    .eq('id', id)
    .select('id')
    .single()

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  if (!updatedRow) {
    throw createError({ statusCode: 404, message: 'Administrador no encontrado' })
  }

  return { success: true }
})
