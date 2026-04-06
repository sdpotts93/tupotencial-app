<template>
  <div class="page--fill">
    <div class="page-header">
      <h1 class="page-header__title">Roles de administración</h1>
      <div class="page-header__actions">
        <UiButton v-if="canManageRoles" variant="primary-outline" size="sm" @click="showInviteModal = true">+ Invitar administrador</UiButton>
      </div>
    </div>

    <!-- Roles Overview -->
    <div class="roles-grid">
      <div v-for="role in roles" :key="role.key" class="role-card">
        <div class="role-card__header">
          <h3 class="role-card__title">{{ role.name }}</h3>
          <UiTag size="sm" :variant="role.variant as any">{{ role.count }} miembros</UiTag>
        </div>
        <p class="role-card__description">{{ role.description }}</p>
      </div>
    </div>

    <!-- Admin Users Table -->
    <h2 class="section-title">Administradores</h2>

    <!-- Skeleton loader -->
    <template v-if="status === 'pending'">
      <div class="table-skeleton">
        <div class="table-skeleton__toolbar">
          <UiSkeleton variant="rect" width="200px" height="36px" radius="var(--radius-md)" />
        </div>
        <div class="table-skeleton__rows">
          <div v-for="i in 4" :key="i" class="table-skeleton__row">
            <div style="display: flex; align-items: center; gap: var(--space-2);">
              <UiSkeleton variant="rect" width="32px" height="32px" radius="var(--radius-full)" />
              <div style="display: flex; flex-direction: column; gap: var(--space-1);">
                <UiSkeleton variant="text" width="120px" height="14px" />
                <UiSkeleton variant="text" width="150px" height="12px" />
              </div>
            </div>
            <UiSkeleton variant="rect" width="80px" height="22px" radius="var(--radius-full)" />
            <UiSkeleton variant="rect" width="60px" height="22px" radius="var(--radius-full)" />
            <UiSkeleton variant="text" width="80px" height="14px" />
            <UiSkeleton variant="rect" width="80px" height="30px" radius="var(--radius-md)" />
          </div>
        </div>
      </div>
    </template>

    <!-- Error state -->
    <template v-else-if="status === 'error'">
      <div class="table-error">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 20 20" class="table-error__icon"><path fill="currentColor" d="m12.876 8.17l.952 1.089a5.5 5.5 0 0 0-.966.414l-.295-.337l-.585.936a5.5 5.5 0 0 0-1.76 2.676a.5.5 0 0 1-.684-.256L7.495 7.79L6.26 10.696A.5.5 0 0 1 5.8 11H2.5a.5.5 0 0 1 0-1h2.97l1.57-3.696a.5.5 0 0 1 .922.004l2.127 5.106l1.987-3.179a.5.5 0 0 1 .8-.064m3.848-3.858a4.42 4.42 0 0 1 .978 4.702A2 2 0 0 0 17.5 9h-.889a3.415 3.415 0 0 0-.598-3.984A3.306 3.306 0 0 0 11.3 5l-.951.963a.5.5 0 0 1-.711 0l-.96-.97a3.3 3.3 0 0 0-4.706-.016C2.899 6.061 2.713 7.711 3.42 9H2.5q-.09 0-.18.01a4.4 4.4 0 0 1 .941-4.736a4.3 4.3 0 0 1 6.127.016l.605.61l.596-.603l.109-.106a4.306 4.306 0 0 1 6.026.121M4.856 12l4.784 4.847a.5.5 0 0 0 .712-.703l-4.146-4.2Q6.011 12 5.8 12zM20 14.5a4.5 4.5 0 1 1-9 0a4.5 4.5 0 0 1 9 0M15.5 12a.5.5 0 0 0-.5.5v2a.5.5 0 0 0 1 0v-2a.5.5 0 0 0-.5-.5m0 5.125a.625.625 0 1 0 0-1.25a.625.625 0 0 0 0 1.25"/></svg>
        <h2 class="table-error__title">No pudimos cargar los administradores</h2>
        <p class="table-error__desc">Hubo un problema al conectar. Revisa tu conexión e intenta de nuevo.</p>
        <UiButton variant="primary-outline" size="sm" @click="refresh()">Reintentar</UiButton>
      </div>
    </template>

    <UiDataTable v-else fill :columns="columns" :rows="filteredAdmins" :has-more="hasMore" :loading="searchPending || loading" :loading-more="loadingMore" @load-more="loadMore">
      <template #toolbar>
        <UiInput
          v-model="searchInput"
          placeholder="Buscar por nombre o correo..."
          style="min-width: 200px;"
        >
          <template #suffix><Icon name="lucide:search" size="18" /></template>
        </UiInput>
      </template>

      <template #cell-full_name="{ value, row }">
        <div class="admin-cell">
          <div class="admin-cell__avatar">{{ value?.charAt(0) ?? 'A' }}</div>
          <div>
            <span class="admin-cell__name">{{ value }}</span>
            <span class="admin-cell__email">{{ row.email }}</span>
          </div>
        </div>
      </template>

      <template #cell-role="{ value }">
        <UiTag :variant="roleVariant(value)">{{ roleLabel(value) }}</UiTag>
      </template>

      <template #cell-status="{ value }">
        <UiTag :variant="value === 'active' ? 'success' : 'warning'">
          {{ value === 'active' ? 'Activo' : 'Pendiente' }}
        </UiTag>
      </template>

      <template #cell-last_login="{ value }">
        {{ value ? formatDate(value) : 'Nunca' }}
      </template>

      <template #actions="{ row }">
        <UiButton v-if="canManageRoles" variant="soft" size="sm" @click="editAdmin(row)">
          <template #icon><Icon name="lucide:pencil" size="16" /></template>
          Editar
        </UiButton>
        <UiButton v-if="canManageRoles" variant="danger-ghost" size="sm" @click="deleteAdmin(row)">
          <template #icon><Icon name="lucide:trash-2" size="16" /></template>
          Eliminar
        </UiButton>
      </template>
    </UiDataTable>

    <!-- Edit Modal -->
    <UiModal v-model="showEditModal" title="Editar administrador" variant="center" :show-handle="false">
      <div class="modal-form">
        <UiInput
          :model-value="editForm.full_name"
          label="Nombre completo"
          disabled
        />
        <UiInput
          :model-value="editForm.email"
          label="Correo electrónico"
          disabled
        />
        <UiSelect
          v-model="editForm.role"
          label="Rol"
          :options="roleOptions"
        />
      </div>
      <p v-if="formError" class="form-error">{{ formError }}</p>
      <template #footer>
        <div class="modal-actions">
          <UiButton variant="soft" size="sm" @click="showEditModal = false">Cancelar</UiButton>
          <UiButton variant="primary-outline" size="sm" :loading="editSaving" @click="saveEdit">Guardar</UiButton>
        </div>
      </template>
    </UiModal>

    <!-- Invite Modal -->
    <UiModal v-model="showInviteModal" title="Invitar administrador" variant="center" :show-handle="false">
      <div class="modal-form">
        <UiInput
          v-model="inviteForm.email"
          label="Correo electrónico"
          type="text"
          placeholder="nuevo@admin.com"
        />
        <UiInput
          v-model="inviteForm.full_name"
          label="Nombre completo"
          placeholder="Nombre del administrador"
        />
        <UiSelect
          v-model="inviteForm.role"
          label="Rol"
          :options="roleOptions"
        />
      </div>
      <p v-if="inviteError" class="invite-error">{{ inviteError }}</p>
      <p v-if="formError" class="form-error">{{ formError }}</p>
      <template #footer>
        <div class="modal-actions">
          <UiButton variant="soft" size="sm" @click="showInviteModal = false">Cancelar</UiButton>
          <UiButton variant="primary-outline" size="sm" :loading="inviteLoading" @click="sendInvite">
            Enviar invitación
          </UiButton>
        </div>
      </template>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const client = useSupabaseClient()
const toast = useToast()
const { canManageRoles } = useAdminAuth()

const showInviteModal = ref(false)
const showEditModal = ref(false)
const { input: searchInput, debounced: search, pending: searchPending } = useDebouncedRef('')
const editingId = ref<string | null>(null)

const editSaving = ref(false)
const formError = ref('')

const editForm = reactive({
  full_name: '',
  email: '',
  role: 'editor',
})

const inviteForm = reactive({
  email: '',
  full_name: '',
  role: 'editor',
})

// ── Fetch admin users from Supabase ──
const { rows: adminUsers, hasMore, loading, loadingMore, loadMore, refresh, status } = await useInfiniteTable(
  'admin-roles',
  async ({ from, to }) => {
    const { data: admins } = await client
      .from('admin_users')
      .select('*')
      .range(from, to)
      .order('created_at', { ascending: false })

    const userIds = (admins ?? []).map(a => a.user_id)
    if (!userIds.length) return []

    let profilesQuery = client.from('profiles').select('id, display_name, avatar_url').in('id', userIds)
    if (search.value) {
      profilesQuery = profilesQuery.ilike('display_name', `%${search.value}%`)
    }
    const { data: profiles } = await profilesQuery

    const profileMap = new Map((profiles ?? []).map(p => [p.id, p]))

    // When searching, only keep admins whose profile matched
    const filtered = search.value
      ? (admins ?? []).filter(a => profileMap.has(a.user_id))
      : (admins ?? [])

    return filtered.map(a => {
      const profile = profileMap.get(a.user_id)
      return {
        ...a,
        full_name: profile?.display_name ?? 'Sin nombre',
        avatar_url: profile?.avatar_url ?? null,
        email: '\u2014',
        status: 'active',
        last_login: null as string | null,
      }
    })
  },
  [search],
)

// ── Computed role summary cards ──
const roles = computed(() => {
  const list = adminUsers.value
  return [
    {
      key: 'admin',
      name: 'Administrador',
      description: 'Acceso completo al sistema incluyendo gestión de usuarios.',
      count: list.filter(u => u.role === 'admin').length,
      variant: 'primary',
    },
    {
      key: 'editor',
      name: 'Editor',
      description: 'Puede crear y editar todo el contenido del sistema.',
      count: list.filter(u => u.role === 'editor').length,
      variant: 'accent',
    },
    {
      key: 'read_only',
      name: 'Solo lectura',
      description: 'Acceso de solo lectura al panel de administración.',
      count: list.filter(u => u.role === 'read_only').length,
      variant: 'default',
    },
  ]
})

const columns = [
  { key: 'full_name', label: 'Administrador', width: '30%' },
  { key: 'role', label: 'Rol' },
  { key: 'status', label: 'Estado' },
  { key: 'last_login', label: 'Último acceso' },
]

const filteredAdmins = computed(() => adminUsers.value)

const roleOptions = [
  { value: 'admin', label: 'Administrador' },
  { value: 'editor', label: 'Editor' },
  { value: 'read_only', label: 'Solo lectura' },
]

function roleVariant(role: string) {
  const map: Record<string, string> = { admin: 'primary', editor: 'accent', read_only: 'default' }
  return (map[role] ?? 'default') as any
}

function roleLabel(role: string) {
  const map: Record<string, string> = { admin: 'Administrador', editor: 'Editor', read_only: 'Solo lectura' }
  return map[role] ?? role
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function editAdmin(row: Record<string, any>) {
  editingId.value = row.id
  editForm.full_name = row.full_name
  editForm.email = row.email
  editForm.role = row.role
  showEditModal.value = true
}

async function saveEdit() {
  if (!editingId.value) return
  editSaving.value = true
  formError.value = ''
  try {
    await client
      .from('admin_users')
      .update({ role: editForm.role })
      .eq('id', editingId.value)
    toast.show('Cambios guardados', 'success')
    showEditModal.value = false
    await refresh()
  } catch {
    formError.value = 'Error al guardar. Intenta de nuevo.'
    toast.show('Error al guardar', 'error')
  } finally {
    editSaving.value = false
  }
}

const confirm = useConfirm()

async function deleteAdmin(row: Record<string, any>) {
  if (await confirm({ message: `¿Seguro que deseas eliminar a ${row.full_name}?` })) {
    try {
      await client.from('admin_users').delete().eq('id', row.id)
      await refresh()
    } catch {
      toast.show('Error al eliminar', 'error')
    }
  }
}

const inviteLoading = ref(false)
const inviteError = ref('')

async function sendInvite() {
  if (!inviteForm.email.trim() || !inviteForm.full_name.trim()) return
  inviteLoading.value = true
  inviteError.value = ''

  try {
    await $fetch('/api/admin/invite', {
      method: 'POST',
      body: {
        email: inviteForm.email,
        full_name: inviteForm.full_name,
        role: inviteForm.role,
      },
    })
    showInviteModal.value = false
    inviteForm.email = ''
    inviteForm.full_name = ''
    inviteForm.role = 'editor'
    toast.show('Invitación enviada', 'success')
    await refresh()
  } catch (err: any) {
    inviteError.value = err?.data?.message || 'Error al enviar la invitación'
    toast.show('Error al guardar', 'error')
  } finally {
    inviteLoading.value = false
  }
}
</script>

<style scoped>
.roles-grid {
  display: none;
  gap: var(--space-4);
  margin-bottom: var(--space-8);
}

@media (min-width: 1024px) {
  .roles-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  }
}

.role-card {
  background: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
}

.role-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--space-2);
}

.role-card__title {
  font-family: var(--font-body);
  font-size: var(--text-md);
  font-weight: var(--weight-semibold);
}

.role-card__description {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-3);
}

.section-title {
  font-family: var(--font-body);
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
  margin-bottom: var(--space-4);
}

.admin-cell {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.admin-cell__avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background: var(--color-primary);
  color: var(--color-primary-contrast);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  flex-shrink: 0;
}

.admin-cell__name {
  font-weight: var(--weight-medium);
  display: block;
  font-size: var(--text-sm);
}

.admin-cell__email {
  font-size: var(--text-xs);
  color: var(--color-muted);
  display: block;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
}

.invite-error {
  font-size: var(--text-sm);
  color: var(--color-danger);
  margin-top: var(--space-2);
}

.form-error {
  width: 100%;
  font-size: var(--text-sm);
  color: var(--color-danger);
  text-align: center;
  order: -1;
}

.table-skeleton {
  background: var(--color-desktop-card, var(--color-white));
  border: 1px solid var(--color-desktop-border, var(--color-border-light));
  border-radius: var(--radius-lg);
  overflow: hidden;
}

.table-skeleton__toolbar {
  padding: var(--space-4);
  border-bottom: 1px solid var(--color-border-light);
  display: flex;
  gap: var(--space-3);
}

.table-skeleton__row {
  display: grid;
  grid-template-columns: 1fr 100px 80px 100px 100px;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border-light);
  align-items: center;
}

.table-error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: var(--space-10) var(--space-6);
  min-height: 40dvh;
  gap: var(--space-3);
}

.table-error__icon {
  color: var(--color-muted);
  margin-bottom: var(--space-2);
}

.table-error__title {
  font-family: var(--font-title);
  font-size: var(--title-md);
  color: var(--color-text);
  line-height: var(--leading-snug);
}

.table-error__desc {
  font-size: var(--text-sm);
  color: var(--color-muted);
  max-width: 28ch;
  line-height: var(--leading-normal);
}
</style>
