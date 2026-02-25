<template>
  <div>
    <div class="page-header">
      <h1 class="page-header__title">Roles de administracion</h1>
      <div class="page-header__actions">
        <UiButton size="sm" @click="showInviteModal = true">+ Invitar administrador</UiButton>
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
        <div class="role-card__permissions">
          <span class="eyebrow">Permisos:</span>
          <ul class="role-card__list">
            <li v-for="perm in role.permissions" :key="perm">{{ perm }}</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Admin Users Table -->
    <h2 class="section-title">Administradores</h2>
    <UiDataTable :columns="columns" :rows="adminUsers">
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
        <UiButton v-if="row.role !== 'super_admin'" variant="ghost" size="sm" @click="editAdmin(row)">Editar</UiButton>
      </template>
    </UiDataTable>

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
          <UiButton variant="outline" size="sm" @click="showInviteModal = false">Cancelar</UiButton>
          <UiButton size="sm" @click="sendInvite">Enviar invitacion</UiButton>
        </div>
      </template>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const showInviteModal = ref(false)

const inviteForm = reactive({
  email: '',
  full_name: '',
  role: 'editor',
})

const roles = [
  {
    key: 'super_admin',
    name: 'Super Administrador',
    description: 'Control total del sistema. Puede gestionar roles, configuraciones y todos los recursos.',
    count: 1,
    variant: 'primary',
    permissions: ['Gestion completa del sistema', 'Administracion de roles', 'Configuraciones globales', 'Eliminar datos'],
  },
  {
    key: 'admin',
    name: 'Administrador',
    description: 'Puede gestionar contenido, usuarios y la mayoria de los recursos del sistema.',
    count: 3,
    variant: 'accent',
    permissions: ['Gestionar contenido', 'Gestionar usuarios', 'Gestionar programas', 'Gestionar eventos y beneficios'],
  },
  {
    key: 'editor',
    name: 'Editor',
    description: 'Puede crear y editar contenido, programas y publicaciones de la comunidad.',
    count: 5,
    variant: 'info',
    permissions: ['Crear y editar contenido', 'Gestionar programas', 'Publicar en comunidad', 'Ver estadisticas basicas'],
  },
  {
    key: 'viewer',
    name: 'Solo lectura',
    description: 'Acceso de solo lectura al panel de administracion para monitoreo y reportes.',
    count: 2,
    variant: 'default',
    permissions: ['Ver dashboard', 'Ver contenido', 'Ver usuarios', 'Descargar reportes'],
  },
]

const columns = [
  { key: 'full_name', label: 'Administrador', width: '30%' },
  { key: 'role', label: 'Rol' },
  { key: 'status', label: 'Estado' },
  { key: 'last_login', label: 'Ultimo acceso' },
]

const adminUsers = ref([
  { id: 'adm-001', full_name: 'Ana Garcia', email: 'ana.garcia@tupotencial.app', role: 'super_admin', status: 'active', last_login: '2026-02-24T10:30:00' },
  { id: 'adm-002', full_name: 'Carlos Lopez', email: 'carlos.lopez@tupotencial.app', role: 'admin', status: 'active', last_login: '2026-02-24T09:15:00' },
  { id: 'adm-003', full_name: 'Maria Torres', email: 'maria.torres@tupotencial.app', role: 'admin', status: 'active', last_login: '2026-02-23T16:00:00' },
  { id: 'adm-004', full_name: 'Luis Mendoza', email: 'luis.mendoza@tupotencial.app', role: 'admin', status: 'active', last_login: '2026-02-22T14:30:00' },
  { id: 'adm-005', full_name: 'Patricia Ruiz', email: 'patricia.ruiz@tupotencial.app', role: 'editor', status: 'active', last_login: '2026-02-24T08:00:00' },
  { id: 'adm-006', full_name: 'Jorge Fernandez', email: 'jorge.f@tupotencial.app', role: 'editor', status: 'active', last_login: '2026-02-23T11:00:00' },
  { id: 'adm-007', full_name: 'Diana Salazar', email: 'diana.s@tupotencial.app', role: 'editor', status: 'active', last_login: '2026-02-21T15:00:00' },
  { id: 'adm-008', full_name: 'Ricardo Perez', email: 'ricardo.p@tupotencial.app', role: 'editor', status: 'pending', last_login: null },
  { id: 'adm-009', full_name: 'Isabel Contreras', email: 'isabel.c@tupotencial.app', role: 'editor', status: 'active', last_login: '2026-02-20T09:00:00' },
  { id: 'adm-010', full_name: 'Eduardo Vargas', email: 'eduardo.v@tupotencial.app', role: 'viewer', status: 'active', last_login: '2026-02-24T07:30:00' },
  { id: 'adm-011', full_name: 'Camila Rios', email: 'camila.r@tupotencial.app', role: 'viewer', status: 'active', last_login: '2026-02-19T13:00:00' },
])

const roleOptions = [
  { value: 'admin', label: 'Administrador' },
  { value: 'editor', label: 'Editor' },
  { value: 'viewer', label: 'Solo lectura' },
]

function roleVariant(role: string) {
  const map: Record<string, string> = { super_admin: 'primary', admin: 'accent', editor: 'info', viewer: 'default' }
  return (map[role] ?? 'default') as any
}

function roleLabel(role: string) {
  const map: Record<string, string> = { super_admin: 'Super Admin', admin: 'Administrador', editor: 'Editor', viewer: 'Solo lectura' }
  return map[role] ?? role
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

function editAdmin(row: Record<string, any>) {
  alert(`Editar rol de ${row.full_name} (mock)`)
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
  background: var(--color-surface);
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

.role-card__permissions {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.role-card__list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.role-card__list li {
  font-size: var(--text-xs);
  color: var(--color-text-secondary);
  padding-left: var(--space-4);
  position: relative;
}

.role-card__list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  border-radius: var(--radius-full);
  background: var(--color-success);
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
