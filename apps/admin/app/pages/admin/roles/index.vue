<template>
  <div class="page--fill">
    <div class="page-header">
      <h1 class="page-header__title">Roles de administracion</h1>
      <div class="page-header__actions">
        <UiButton variant="primary-outline" size="sm" @click="showInviteModal = true">+ Invitar administrador</UiButton>
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
    <UiDataTable fill :columns="columns" :rows="filteredAdmins">
      <template #toolbar>
        <UiInput
          v-model="search"
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
        <UiButton variant="soft" size="sm" @click="editAdmin(row)">
          <template #icon><Icon name="lucide:pencil" size="16" /></template>
          Editar
        </UiButton>
        <UiButton variant="danger-ghost" size="sm" @click="deleteAdmin(row)">
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
          label="Correo electronico"
          disabled
        />
        <UiSelect
          v-model="editForm.role"
          label="Rol"
          :options="roleOptions"
        />
      </div>
      <template #footer>
        <div class="modal-actions">
          <UiButton variant="soft" size="sm" @click="showEditModal = false">Cancelar</UiButton>
          <UiButton variant="primary-outline" size="sm" @click="saveEdit">Guardar</UiButton>
        </div>
      </template>
    </UiModal>

    <!-- Invite Modal -->
    <UiModal v-model="showInviteModal" title="Invitar administrador" variant="center" :show-handle="false">
      <div class="modal-form">
        <UiInput
          v-model="inviteForm.email"
          label="Correo electronico"
          type="email"
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
      <template #footer>
        <div class="modal-actions">
          <UiButton variant="soft" size="sm" @click="showInviteModal = false">Cancelar</UiButton>
          <UiButton variant="primary-outline" size="sm" @click="sendInvite">Enviar invitacion</UiButton>
        </div>
      </template>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const showInviteModal = ref(false)
const showEditModal = ref(false)
const search = ref('')
const editingId = ref<string | null>(null)

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

const roles = [
  {
    key: 'admin',
    name: 'Administrador',
    description: 'Acceso completo al sistema incluyendo gestion de usuarios.',
    count: 4,
    variant: 'primary',
  },
  {
    key: 'editor',
    name: 'Editor',
    description: 'Puede crear y editar todo el contenido del sistema.',
    count: 5,
    variant: 'accent',
  },
  {
    key: 'read_only',
    name: 'Solo lectura',
    description: 'Acceso de solo lectura al panel de administracion.',
    count: 2,
    variant: 'default',
  },
]

const columns = [
  { key: 'full_name', label: 'Administrador', width: '30%' },
  { key: 'role', label: 'Rol' },
  { key: 'status', label: 'Estado' },
  { key: 'last_login', label: 'Ultimo acceso' },
]

const adminUsers = ref([
  { id: 'adm-001', full_name: 'Ana Garcia', email: 'ana.garcia@tupotencial.app', role: 'admin', status: 'active', last_login: '2026-02-24T10:30:00' },
  { id: 'adm-002', full_name: 'Carlos Lopez', email: 'carlos.lopez@tupotencial.app', role: 'admin', status: 'active', last_login: '2026-02-24T09:15:00' },
  { id: 'adm-003', full_name: 'Maria Torres', email: 'maria.torres@tupotencial.app', role: 'admin', status: 'active', last_login: '2026-02-23T16:00:00' },
  { id: 'adm-004', full_name: 'Luis Mendoza', email: 'luis.mendoza@tupotencial.app', role: 'admin', status: 'active', last_login: '2026-02-22T14:30:00' },
  { id: 'adm-005', full_name: 'Patricia Ruiz', email: 'patricia.ruiz@tupotencial.app', role: 'editor', status: 'active', last_login: '2026-02-24T08:00:00' },
  { id: 'adm-006', full_name: 'Jorge Fernandez', email: 'jorge.f@tupotencial.app', role: 'editor', status: 'active', last_login: '2026-02-23T11:00:00' },
  { id: 'adm-007', full_name: 'Diana Salazar', email: 'diana.s@tupotencial.app', role: 'editor', status: 'active', last_login: '2026-02-21T15:00:00' },
  { id: 'adm-008', full_name: 'Ricardo Perez', email: 'ricardo.p@tupotencial.app', role: 'editor', status: 'pending', last_login: null },
  { id: 'adm-009', full_name: 'Isabel Contreras', email: 'isabel.c@tupotencial.app', role: 'editor', status: 'active', last_login: '2026-02-20T09:00:00' },
  { id: 'adm-010', full_name: 'Eduardo Vargas', email: 'eduardo.v@tupotencial.app', role: 'read_only', status: 'active', last_login: '2026-02-24T07:30:00' },
  { id: 'adm-011', full_name: 'Camila Rios', email: 'camila.r@tupotencial.app', role: 'read_only', status: 'active', last_login: '2026-02-19T13:00:00' },
])

const filteredAdmins = computed(() => {
  if (!search.value) return adminUsers.value
  const q = search.value.toLowerCase()
  return adminUsers.value.filter(r => r.full_name.toLowerCase().includes(q) || r.email.toLowerCase().includes(q))
})

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

function saveEdit() {
  const user = adminUsers.value.find(u => u.id === editingId.value)
  if (user) user.role = editForm.role
  showEditModal.value = false
}

function sendInvite() {
  alert(`Invitacion enviada a ${inviteForm.email} (mock)`)
  showInviteModal.value = false
  inviteForm.email = ''
  inviteForm.full_name = ''
  inviteForm.role = 'editor'
}
</script>

<style scoped>
.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-8);
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
</style>
