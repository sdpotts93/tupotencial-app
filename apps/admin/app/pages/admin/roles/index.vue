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

    <UiDataTable fill :columns="columns" :rows="filteredAdmins" :has-more="hasMore" :loading="searchPending || loading || status === 'pending'" :loading-more="loadingMore" :error="status === 'error'" error-title="No pudimos cargar los administradores" @load-more="loadMore" @retry="refresh()">
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
    <UiModal v-model="showEditModal" title="Editar administrador">
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
    <UiModal v-model="showInviteModal" title="Invitar administrador">
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
const requestFetch = useRequestFetch()
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
    return await requestFetch('/api/admin/admin-users', {
      query: {
        from,
        to,
        search: search.value || undefined,
      },
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
    await $fetch(`/api/admin/admin-users/${editingId.value}`, {
      method: 'PATCH',
      body: { role: editForm.role },
    })
    toast.show('Cambios guardados', 'success')
    showEditModal.value = false
    await refresh()
  } catch (err: any) {
    formError.value = err?.data?.message || 'Error al guardar. Intenta de nuevo.'
    toast.show('Error al guardar', 'error')
  } finally {
    editSaving.value = false
  }
}

const confirm = useConfirm()

async function deleteAdmin(row: Record<string, any>) {
  if (await confirm({ message: `¿Seguro que deseas eliminar a ${row.full_name}?` })) {
    try {
      await $fetch(`/api/admin/admin-users/${row.id}`, {
        method: 'DELETE',
      })
      toast.show('Administrador eliminado', 'success')
      await refresh()
    } catch (err: any) {
      formError.value = err?.data?.message || ''
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

</style>
