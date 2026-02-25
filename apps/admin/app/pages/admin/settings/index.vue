<template>
  <div>
    <div class="page-header">
      <h1 class="page-header__title">Configuracion</h1>
      <div class="page-header__actions">
        <UiButton size="sm" @click="handleSave">Guardar cambios</UiButton>
      </div>
    </div>

    <UiTabs v-model="activeTab" :tabs="tabs" />

    <!-- General Settings -->
    <div v-if="activeTab === 'general'" class="tab-content">
      <div class="settings-grid">
        <UiCard variant="outlined">
          <div class="form-section">
            <h3 class="section-title">Informacion de la aplicacion</h3>
            <UiInput
              v-model="settings.app_name"
              label="Nombre de la aplicacion"
            />
            <UiTextarea
              v-model="settings.app_description"
              label="Descripcion"
              :rows="3"
            />
            <UiInput
              v-model="settings.support_email"
              label="Correo de soporte"
              type="email"
            />
            <UiInput
              v-model="settings.support_phone"
              label="Telefono de soporte"
            />
          </div>
        </UiCard>

        <UiCard variant="outlined">
          <div class="form-section">
            <h3 class="section-title">Redes sociales</h3>
            <UiInput
              v-model="settings.instagram_url"
              label="Instagram"
              placeholder="https://instagram.com/tupotencial"
            />
            <UiInput
              v-model="settings.facebook_url"
              label="Facebook"
              placeholder="https://facebook.com/tupotencial"
            />
            <UiInput
              v-model="settings.tiktok_url"
              label="TikTok"
              placeholder="https://tiktok.com/@tupotencial"
            />
            <UiInput
              v-model="settings.website_url"
              label="Sitio web"
              placeholder="https://tupotencial.app"
            />
          </div>
        </UiCard>
      </div>
    </div>

    <!-- Notifications Settings -->
    <div v-if="activeTab === 'notifications'" class="tab-content">
      <div class="settings-grid">
        <UiCard variant="outlined">
          <div class="form-section">
            <h3 class="section-title">Notificaciones push</h3>
            <div class="toggle-row">
              <div>
                <span class="toggle-row__label">Check-in matutino</span>
                <span class="toggle-row__description">Recordatorio diario para el check-in de la manana</span>
              </div>
              <UiSelect
                v-model="notifications.morning_checkin"
                :options="toggleOptions"
                style="width: 120px;"
              />
            </div>
            <div class="toggle-row">
              <div>
                <span class="toggle-row__label">Contenido nuevo</span>
                <span class="toggle-row__description">Notificar cuando se publica contenido nuevo</span>
              </div>
              <UiSelect
                v-model="notifications.new_content"
                :options="toggleOptions"
                style="width: 120px;"
              />
            </div>
            <div class="toggle-row">
              <div>
                <span class="toggle-row__label">Recordatorio de programa</span>
                <span class="toggle-row__description">Recordar a usuarios que completen su dia del programa</span>
              </div>
              <UiSelect
                v-model="notifications.program_reminder"
                :options="toggleOptions"
                style="width: 120px;"
              />
            </div>
            <div class="toggle-row">
              <div>
                <span class="toggle-row__label">Eventos proximos</span>
                <span class="toggle-row__description">Alertar sobre eventos que estan por comenzar</span>
              </div>
              <UiSelect
                v-model="notifications.upcoming_events"
                :options="toggleOptions"
                style="width: 120px;"
              />
            </div>
            <div class="toggle-row">
              <div>
                <span class="toggle-row__label">Racha en riesgo</span>
                <span class="toggle-row__description">Avisar cuando el usuario puede perder su racha</span>
              </div>
              <UiSelect
                v-model="notifications.streak_at_risk"
                :options="toggleOptions"
                style="width: 120px;"
              />
            </div>
          </div>
        </UiCard>

        <UiCard variant="outlined">
          <div class="form-section">
            <h3 class="section-title">Hora de notificaciones</h3>
            <UiInput
              v-model="notifications.morning_time"
              label="Hora del check-in matutino"
              type="time"
            />
            <UiInput
              v-model="notifications.evening_time"
              label="Hora del recordatorio vespertino"
              type="time"
            />
            <UiInput
              v-model="notifications.event_reminder_minutes"
              label="Minutos antes del evento"
              type="number"
              hint="Tiempo de anticipacion para el recordatorio de eventos"
            />
          </div>
        </UiCard>
      </div>
    </div>

    <!-- Plans Settings -->
    <div v-if="activeTab === 'plans'" class="tab-content">
      <div class="plans-grid">
        <UiCard v-for="plan in plans" :key="plan.key" variant="outlined">
          <div class="form-section">
            <div class="plan-header">
              <h3 class="section-title">{{ plan.name }}</h3>
              <UiTag :variant="plan.variant as any">{{ plan.users }} usuarios</UiTag>
            </div>
            <UiInput
              v-model="plan.price_monthly"
              label="Precio mensual (MXN)"
              type="number"
            />
            <UiInput
              v-model="plan.price_yearly"
              label="Precio anual (MXN)"
              type="number"
            />
            <UiTextarea
              v-model="plan.features"
              label="Caracteristicas incluidas"
              :rows="4"
              hint="Una caracteristica por linea"
            />
            <UiSelect
              v-model="plan.is_active"
              label="Estado"
              :options="[{ value: 'true', label: 'Activo' }, { value: 'false', label: 'Inactivo' }]"
            />
          </div>
        </UiCard>
      </div>
    </div>

    <!-- Maintenance Settings -->
    <div v-if="activeTab === 'maintenance'" class="tab-content">
      <div class="settings-grid">
        <UiCard variant="outlined">
          <div class="form-section">
            <h3 class="section-title">Modo mantenimiento</h3>
            <UiSelect
              v-model="maintenance.enabled"
              label="Activar modo mantenimiento"
              :options="toggleOptions"
            />
            <UiTextarea
              v-model="maintenance.message"
              label="Mensaje de mantenimiento"
              :rows="3"
              hint="Mensaje que veran los usuarios durante el mantenimiento"
            />
          </div>
        </UiCard>

        <UiCard variant="outlined">
          <div class="form-section">
            <h3 class="section-title">Cache y rendimiento</h3>
            <UiButton variant="outline" size="sm" @click="clearCache">Limpiar cache del CDN</UiButton>
            <UiButton variant="outline" size="sm" @click="reindexContent">Reindexar contenido</UiButton>
            <UiButton variant="outline" size="sm" @click="generateSitemap">Regenerar sitemap</UiButton>
          </div>
        </UiCard>

        <UiCard variant="outlined">
          <div class="form-section">
            <h3 class="section-title">Datos y exportacion</h3>
            <UiButton variant="outline" size="sm" @click="exportAllData">Exportar todos los datos</UiButton>
            <UiButton variant="outline" size="sm" @click="downloadReport">Descargar reporte mensual</UiButton>
            <p class="meta-label">Ultima exportacion: 20 feb 2026, 10:00 AM</p>
          </div>
        </UiCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const activeTab = ref('general')

const tabs = [
  { value: 'general', label: 'General' },
  { value: 'notifications', label: 'Notificaciones' },
  { value: 'plans', label: 'Planes' },
  { value: 'maintenance', label: 'Mantenimiento' },
]

const toggleOptions = [
  { value: 'true', label: 'Activo' },
  { value: 'false', label: 'Inactivo' },
]

const settings = reactive({
  app_name: 'Tu Potencial',
  app_description: 'Tu companero de bienestar integral. Contenido, programas y comunidad para vivir una vida mas plena y saludable.',
  support_email: 'soporte@tupotencial.app',
  support_phone: '+52 55 1234 5678',
  instagram_url: 'https://instagram.com/tupotencial',
  facebook_url: 'https://facebook.com/tupotencial',
  tiktok_url: 'https://tiktok.com/@tupotencial',
  website_url: 'https://tupotencial.app',
})

const notifications = reactive({
  morning_checkin: 'true',
  new_content: 'true',
  program_reminder: 'true',
  upcoming_events: 'true',
  streak_at_risk: 'true',
  morning_time: '07:00',
  evening_time: '20:00',
  event_reminder_minutes: '30',
})

const plans = ref([
  {
    key: 'free',
    name: 'Plan Gratuito',
    variant: 'default',
    users: '4,644',
    price_monthly: '0',
    price_yearly: '0',
    features: 'Contenido basico\nCheck-in diario\n1 programa gratuito\nComunidad (solo lectura)',
    is_active: 'true',
  },
  {
    key: 'premium',
    name: 'Plan Premium',
    variant: 'accent',
    users: '6,870',
    price_monthly: '149',
    price_yearly: '1,490',
    features: 'Todo el contenido\nCheck-in diario con insights\nTodos los programas\nComunidad completa\nEventos exclusivos\nBeneficios y descuentos',
    is_active: 'true',
  },
  {
    key: 'enterprise',
    name: 'Plan Empresarial',
    variant: 'primary',
    users: '1,333',
    price_monthly: '89',
    price_yearly: '890',
    features: 'Todo lo de Premium\nDashboard empresarial\nReportes de bienestar\nContenido personalizado\nSoporte prioritario\nIntegraciones HR',
    is_active: 'true',
  },
])

const maintenance = reactive({
  enabled: 'false',
  message: 'Estamos realizando mejoras en la plataforma. Estaremos de vuelta pronto.',
})

function handleSave() {
  alert('Configuracion guardada (mock)')
}

function clearCache() {
  alert('Cache del CDN limpiado (mock)')
}

function reindexContent() {
  alert('Reindexacion de contenido iniciada (mock)')
}

function generateSitemap() {
  alert('Sitemap regenerado (mock)')
}

function exportAllData() {
  alert('Exportacion de datos iniciada (mock)')
}

function downloadReport() {
  alert('Descarga de reporte iniciada (mock)')
}
</script>

<style scoped>
.tab-content {
  margin-top: var(--space-6);
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: var(--space-4);
}

.plans-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--space-4);
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  padding: var(--space-5);
}

.section-title {
  font-family: var(--font-body);
  font-size: var(--text-md);
  font-weight: var(--weight-semibold);
  color: var(--color-text);
}

.plan-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--color-border-light);
}

.toggle-row:last-of-type {
  border-bottom: none;
}

.toggle-row__label {
  display: block;
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-text);
}

.toggle-row__description {
  display: block;
  font-size: var(--text-xs);
  color: var(--color-muted);
  margin-top: var(--space-1);
}

.meta-label {
  font-size: var(--text-xs);
  color: var(--color-muted);
  margin-top: var(--space-2);
}

@media (max-width: 768px) {
  .settings-grid,
  .plans-grid {
    grid-template-columns: 1fr;
  }
}
</style>
