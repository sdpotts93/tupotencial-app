<template>
  <div>
    <div class="page-header">
      <h1 class="page-header__title">Hoy - Planificacion diaria</h1>
      <div class="page-header__actions">
        <UiButton v-if="activeTab !== 'all'" variant="outline" size="sm" @click="viewMode = viewMode === 'calendar' ? 'list' : 'calendar'">
          {{ viewMode === 'calendar' ? 'Ver lista' : 'Ver calendario' }}
        </UiButton>
      </div>
    </div>

    <UiTabs v-model="activeTab" :tabs="weekTabs" />

    <!-- Weekly views (Esta semana / Proxima semana) -->
    <template v-if="activeTab !== 'all'">
      <!-- Calendar View -->
      <div v-if="viewMode === 'calendar'" class="hoy-calendar">
        <div class="hoy-calendar__grid">
          <div
            v-for="day in calendarDays"
            :key="day.date"
            :class="['hoy-calendar__day', { 'hoy-calendar__day--today': day.isToday, 'hoy-calendar__day--has-content': day.items > 0 }]"
            @click="goToDate(day.date)"
          >
            <span class="hoy-calendar__day-name eyebrow">{{ day.dayName }}</span>
            <span class="hoy-calendar__day-number">{{ day.dayNumber }}</span>
            <span v-if="day.items > 0" class="hoy-calendar__day-count">{{ day.items }} elementos</span>
            <span v-else class="hoy-calendar__day-empty">Sin plan</span>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div v-else class="hoy-list">
        <UiDataTable fill :columns="columns" :rows="filteredPlans" @row-click="goToDateFromRow">
          <template #toolbar>
            <UiInput
              v-model="search"
              placeholder="Buscar por tema..."
              style="min-width: 200px;"
            >
              <template #suffix><Icon name="lucide:search" size="18" /></template>
            </UiInput>
          </template>

          <template #cell-date="{ value }">
            <strong>{{ formatDate(value) }}</strong>
          </template>

          <template #cell-status="{ value }">
            <UiTag :variant="value === 'published' ? 'success' : value === 'scheduled' ? 'info' : 'warning'">
              {{ statusLabel(value) }}
            </UiTag>
          </template>

          <template #cell-items_count="{ value }">
            {{ value }} elementos
          </template>

          <template #actions="{ row }">
            <UiButton variant="soft" size="sm" :to="`/admin/hoy/${row.date}`">
              <template #icon><Icon name="lucide:pencil" size="16" /></template>
              Editar
            </UiButton>
          </template>
        </UiDataTable>
      </div>
    </template>

    <!-- Full Year View (Todos los planes) -->
    <div v-else class="hoy-year">
      <div v-for="month in yearMonths" :key="month.key" class="hoy-year__month">
        <h3 class="hoy-year__month-name">{{ month.name }}</h3>
        <div class="hoy-year__weekdays">
          <span v-for="d in dayNamesShort" :key="d" class="hoy-year__weekday">{{ d }}</span>
        </div>
        <div class="hoy-year__grid">
          <div v-for="n in month.startOffset" :key="'spacer-' + n" class="hoy-year__spacer" />
          <div
            v-for="day in month.days"
            :key="day.date"
            :class="['hoy-year__day', { 'hoy-year__day--today': day.isToday, 'hoy-year__day--has-content': day.hasContent }]"
            @click="goToDate(day.date)"
          >
            <span class="hoy-year__day-number">{{ day.dayNumber }}</span>
            <span v-if="day.hasContent" class="hoy-year__day-dot" />
          </div>
        </div>
      </div>
    </div>

    <!-- Defaults (shown when a day has no specific plan) -->
    <section class="hoy-config-section">
      <h2 class="section-title">Valores predeterminados</h2>
      <p class="section-description">Valores que se muestran en la app cuando un dia no tiene plan configurado. La frase, accion y badge por defecto.</p>

      <UiCard variant="outlined">
        <div class="form-section">
          <span class="eyebrow">Frase del dia</span>
          <UiTextarea
            v-model="defaults.phrase_text"
            label="Frase"
            placeholder="Frase motivacional por defecto..."
            :rows="2"
          />
          <UiSelect
            v-model="defaults.phrase_author"
            label="Quien dice la frase"
            :options="defaultAuthorOptions"
          />
        </div>
      </UiCard>

      <UiCard variant="outlined" style="margin-top: var(--space-4);">
        <div class="form-section">
          <span class="eyebrow">Accion del dia</span>
          <UiSelect
            v-model="defaults.action_type"
            label="Tipo"
            :options="defaultActionTypeOptions"
          />

          <UiSelect
            v-if="defaults.action_type === 'contenido'"
            v-model="defaults.content_id"
            label="Contenido"
            :options="defaultContentOptions"
            placeholder="Selecciona contenido"
          />

          <UiSelect
            v-if="defaults.action_type === 'formulario'"
            v-model="defaults.form_id"
            label="Formulario"
            :options="defaultFormOptions"
            placeholder="Selecciona formulario"
          />

        </div>
      </UiCard>

      <UiCard variant="outlined" style="margin-top: var(--space-4);">
        <div class="form-section">
          <span class="eyebrow">Badge</span>
          <UiInput
            v-model="defaults.badge_title"
            label="Titulo del badge"
            placeholder="Ej: Dia completado"
          />
          <UiInput
            v-model="defaults.badge_subtitle"
            label="Subtitulo del badge"
            placeholder="Ej: Sigue asi, vas genial"
          />
        </div>
      </UiCard>
    </section>

    <!-- Contenido Reciente Configuration -->
    <section class="hoy-config-section">
      <h2 class="section-title">Contenido reciente</h2>
      <p class="section-description">Configura que contenido se muestra en la seccion "Contenido Reciente" de la pantalla Hoy.</p>

      <UiCard variant="outlined">
        <div class="form-section">
          <UiSelect
            v-model="recentContentMode"
            label="Modo de seleccion"
            :options="recentContentModeOptions"
          />

          <div v-if="recentContentMode === 'manual'" class="manual-content">
            <div ref="searchWrapperRef" class="manual-content__search-wrapper">
              <UiInput
                v-model="contentSearch"
                placeholder="Buscar contenido para agregar..."
                @focus="contentDropdownOpen = true"
              >
                <template #suffix><Icon name="lucide:search" size="18" /></template>
              </UiInput>

              <div v-if="contentDropdownOpen && contentSearch && filteredContentResults.length" class="manual-content__results">
                <button
                  v-for="item in filteredContentResults"
                  :key="item.id"
                  class="manual-content__result-item"
                  @click="addManualContent(item)"
                >
                  <Icon :name="contentTypeIcon(item.type)" size="16" />
                  <span>{{ item.title }}</span>
                  <span class="manual-content__result-duration">{{ item.duration }}</span>
                </button>
              </div>
            </div>

            <div class="manual-content__selected">
              <span class="eyebrow">Contenido seleccionado ({{ selectedContent.length }})</span>
              <div v-for="(item, index) in selectedContent" :key="item.id" class="manual-content__item">
                <Icon :name="contentTypeIcon(item.type)" size="16" />
                <span class="manual-content__item-title">{{ item.title }}</span>
                <span class="manual-content__item-duration">{{ item.duration }}</span>
                <UiButton variant="ghost" size="sm" @click="removeManualContent(index)">
                  <template #icon><Icon name="lucide:x" size="14" /></template>
                </UiButton>
              </div>
              <p v-if="!selectedContent.length" class="manual-content__empty">No hay contenido seleccionado. Busca y agrega contenido arriba.</p>
            </div>
          </div>

          <p v-else class="meta-hint">
            <Icon name="lucide:info" size="14" style="vertical-align: -2px;" />
            Se mostrara automaticamente el contenido mas reciente publicado en la biblioteca.
          </p>
        </div>
      </UiCard>
    </section>

    <!-- Explora otras secciones Configuration -->
    <section class="hoy-config-section">
      <h2 class="section-title">Explora otras secciones</h2>
      <p class="section-description">Administra las secciones que aparecen en "Explora otras secciones" en la pantalla Hoy. Agrega, quita y elige cual es la destacada.</p>

      <UiCard variant="outlined">
        <div class="form-section">
          <div v-for="(section, index) in exploreSections" :key="section.id" class="toggle-row">
            <div class="toggle-row__info">
              <div class="toggle-row__icon-name">
                <Icon :name="section.icon" size="18" />
                <span class="toggle-row__label">{{ section.title }}</span>
              </div>
              <span class="toggle-row__description">{{ section.meta }}</span>
            </div>
            <div class="toggle-row__controls">
              <UiButton
                :variant="section.featured ? 'primary-outline' : 'ghost'"
                size="sm"
                @click="setFeaturedSection(section.id)"
              >
                <template #icon><Icon name="lucide:star" size="14" /></template>
                {{ section.featured ? 'Destacada' : 'Destacar' }}
              </UiButton>
              <UiButton variant="ghost" size="sm" @click="removeExploreSection(index)">
                <template #icon><Icon name="lucide:trash-2" size="14" /></template>
              </UiButton>
            </div>
          </div>

          <p v-if="!exploreSections.length" class="manual-content__empty">No hay secciones activas. Agrega una abajo.</p>

          <!-- Add from available sections -->
          <div v-if="availableSectionsToAdd.length" class="explore-add">
            <span class="eyebrow">Agregar seccion</span>
            <div class="explore-add__row">
              <UiSelect v-model="sectionToAdd" :options="availableSectionsToAdd" placeholder="Selecciona una seccion..." />
              <UiButton variant="outline" size="sm" :disabled="!sectionToAdd" @click="addExploreSection">
                <template #icon><Icon name="lucide:plus" size="14" /></template>
                Agregar
              </UiButton>
            </div>
          </div>
        </div>
      </UiCard>
    </section>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const router = useRouter()
const search = ref('')
const viewMode = ref<'calendar' | 'list'>(
  (typeof localStorage !== 'undefined' && localStorage.getItem('hoy-view-mode') as 'calendar' | 'list') || 'calendar',
)
watch(viewMode, (v) => localStorage.setItem('hoy-view-mode', v))
const activeTab = ref('current')

const weekTabs = [
  { value: 'current', label: 'Esta semana' },
  { value: 'next', label: 'Proxima semana' },
  { value: 'all', label: 'Todos los planes' },
]

const columns = [
  { key: 'date', label: 'Fecha' },
  { key: 'theme', label: 'Tema del dia' },
  { key: 'items_count', label: 'Elementos' },
  { key: 'status', label: 'Estado' },
]

const calendarDays = ref([
  { date: '2026-03-09', dayName: 'Lun', dayNumber: 9, items: 5, isToday: true },
  { date: '2026-03-10', dayName: 'Mar', dayNumber: 10, items: 4, isToday: false },
  { date: '2026-03-11', dayName: 'Mie', dayNumber: 11, items: 3, isToday: false },
  { date: '2026-03-12', dayName: 'Jue', dayNumber: 12, items: 4, isToday: false },
  { date: '2026-03-13', dayName: 'Vie', dayNumber: 13, items: 2, isToday: false },
  { date: '2026-03-14', dayName: 'Sab', dayNumber: 14, items: 1, isToday: false },
  { date: '2026-03-15', dayName: 'Dom', dayNumber: 15, items: 0, isToday: false },
])

const dailyPlans = ref([
  { id: 'dp-001', date: '2026-03-09', theme: 'Bienestar emocional', items_count: 4, status: 'published' },
  { id: 'dp-002', date: '2026-03-10', theme: 'Nutricion consciente', items_count: 3, status: 'scheduled' },
  { id: 'dp-003', date: '2026-03-11', theme: 'Movimiento y energia', items_count: 4, status: 'scheduled' },
  { id: 'dp-004', date: '2026-03-12', theme: 'Descanso y recuperacion', items_count: 2, status: 'draft' },
  { id: 'dp-005', date: '2026-03-13', theme: 'Conexion social', items_count: 1, status: 'draft' },
  { id: 'dp-006', date: '2026-03-14', theme: 'Productividad y enfoque', items_count: 5, status: 'published' },
])

const filteredPlans = computed(() => {
  if (!search.value) return dailyPlans.value
  const q = search.value.toLowerCase()
  return dailyPlans.value.filter(r => r.theme.toLowerCase().includes(q))
})

// ── Tab switching: swap mock data for weekly views ──
watch(activeTab, (tab) => {
  if (tab === 'current') {
    calendarDays.value = [
      { date: '2026-03-09', dayName: 'Lun', dayNumber: 9, items: 5, isToday: true },
      { date: '2026-03-10', dayName: 'Mar', dayNumber: 10, items: 4, isToday: false },
      { date: '2026-03-11', dayName: 'Mie', dayNumber: 11, items: 3, isToday: false },
      { date: '2026-03-12', dayName: 'Jue', dayNumber: 12, items: 4, isToday: false },
      { date: '2026-03-13', dayName: 'Vie', dayNumber: 13, items: 2, isToday: false },
      { date: '2026-03-14', dayName: 'Sab', dayNumber: 14, items: 1, isToday: false },
      { date: '2026-03-15', dayName: 'Dom', dayNumber: 15, items: 0, isToday: false },
    ]
  } else if (tab === 'next') {
    calendarDays.value = [
      { date: '2026-03-16', dayName: 'Lun', dayNumber: 16, items: 0, isToday: false },
      { date: '2026-03-17', dayName: 'Mar', dayNumber: 17, items: 0, isToday: false },
      { date: '2026-03-18', dayName: 'Mie', dayNumber: 18, items: 0, isToday: false },
      { date: '2026-03-19', dayName: 'Jue', dayNumber: 19, items: 0, isToday: false },
      { date: '2026-03-20', dayName: 'Vie', dayNumber: 20, items: 0, isToday: false },
      { date: '2026-03-21', dayName: 'Sab', dayNumber: 21, items: 0, isToday: false },
      { date: '2026-03-22', dayName: 'Dom', dayNumber: 22, items: 0, isToday: false },
    ]
  }
})

// ── Year view for "Todos los planes" ──
const MONTH_NAMES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const dayNamesShort = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom']

const datesWithContent = new Set([
  '2026-01-05', '2026-01-12', '2026-01-19',
  '2026-02-02', '2026-02-09', '2026-02-16', '2026-02-23',
  '2026-03-02', '2026-03-09', '2026-03-10', '2026-03-11',
  '2026-03-12', '2026-03-13', '2026-03-14',
])

const yearMonths = computed(() => {
  const year = 2026
  const today = new Date().toISOString().slice(0, 10)
  return MONTH_NAMES_ES.map((name, monthIndex) => {
    const firstDay = new Date(year, monthIndex, 1)
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate()
    let startDow = firstDay.getDay()
    startDow = startDow === 0 ? 6 : startDow - 1
    const days = []
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      days.push({
        date: dateStr,
        dayNumber: d,
        isToday: dateStr === today,
        hasContent: datesWithContent.has(dateStr),
      })
    }
    return { key: `${year}-${monthIndex}`, name: `${name} ${year}`, startOffset: startDow, days }
  })
})

// ── Defaults config ──
const defaults = reactive({
  phrase_text: 'Cada dia es una nueva oportunidad para cuidar de ti.',
  phrase_author: 'gabriel',
  action_type: 'talk_to_ai',
  content_id: '',
  form_id: '',
  badge_title: 'Dia completado',
  badge_subtitle: 'Sigue asi, vas genial',
})

const defaultAuthorOptions = [
  { value: 'gabriel', label: 'Gabriel' },
  { value: 'carlotta', label: 'Carlotta' },
]

const defaultActionTypeOptions = [
  { value: 'talk_to_ai', label: 'Habla con tu Coach IA' },
  { value: 'contenido', label: 'Contenido' },
  { value: 'formulario', label: 'Formulario' },
]

const defaultContentOptions = [
  { value: 'cnt-001', label: '5 pasos para el bienestar emocional' },
  { value: 'cnt-002', label: 'Meditacion guiada para la manana' },
  { value: 'cnt-003', label: 'Nutricion consciente: guia basica' },
  { value: 'cnt-004', label: 'Rutina de yoga para principiantes' },
  { value: 'cnt-005', label: 'Higiene del sueno: consejos practicos' },
  { value: 'cnt-006', label: 'Como manejar el estres laboral' },
  { value: 'cnt-007', label: 'Ejercicios de respiracion 4-7-8' },
  { value: 'cnt-008', label: 'Alimentacion para la energia diaria' },
]

const defaultFormOptions = [
  { value: 'frm-001', label: 'Evaluacion inicial de bienestar' },
  { value: 'frm-002', label: 'Check-in semanal' },
  { value: 'frm-003', label: 'Encuesta de satisfaccion del programa' },
  { value: 'frm-004', label: 'Registro de habitos diarios' },
  { value: 'frm-005', label: 'Evaluacion de progreso mensual' },
]

watch(() => defaults.action_type, () => {
  defaults.content_id = ''
  defaults.form_id = ''
})

// ── Contenido Reciente config ──
const searchWrapperRef = ref<HTMLElement | null>(null)
const contentDropdownOpen = ref(false)

function onClickOutside(e: MouseEvent) {
  if (searchWrapperRef.value && !searchWrapperRef.value.contains(e.target as Node)) {
    contentDropdownOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', onClickOutside))
onUnmounted(() => document.removeEventListener('click', onClickOutside))

const recentContentMode = ref<'automatic' | 'manual'>('automatic')

const recentContentModeOptions = [
  { value: 'automatic', label: 'Automatico (contenido mas reciente)' },
  { value: 'manual', label: 'Manual (seleccionar contenido)' },
]

const contentSearch = ref('')

const allContentItems = ref([
  { id: 'cnt-001', type: 'video', title: '5 pasos para el bienestar emocional', duration: '15 min' },
  { id: 'cnt-002', type: 'audio', title: 'Meditacion guiada para la manana', duration: '10 min' },
  { id: 'cnt-003', type: 'video', title: 'Nutricion consciente: guia basica', duration: '20 min' },
  { id: 'cnt-004', type: 'video', title: 'Rutina de yoga para principiantes', duration: '25 min' },
  { id: 'cnt-005', type: 'audio', title: 'Higiene del sueno: consejos practicos', duration: '12 min' },
  { id: 'cnt-006', type: 'video', title: 'Como manejar el estres laboral', duration: '18 min' },
  { id: 'cnt-007', type: 'audio', title: 'Ejercicios de respiracion 4-7-8', duration: '8 min' },
  { id: 'cnt-008', type: 'video', title: 'Alimentacion para la energia diaria', duration: '14 min' },
])

const selectedContent = ref([
  { id: 'cnt-001', type: 'video', title: '5 pasos para el bienestar emocional', duration: '15 min' },
  { id: 'cnt-002', type: 'audio', title: 'Meditacion guiada para la manana', duration: '10 min' },
])

watch(contentSearch, () => { contentDropdownOpen.value = true })

const filteredContentResults = computed(() => {
  if (!contentSearch.value) return []
  const q = contentSearch.value.toLowerCase()
  const selectedIds = new Set(selectedContent.value.map(c => c.id))
  return allContentItems.value.filter(
    item => item.title.toLowerCase().includes(q) && !selectedIds.has(item.id),
  )
})

function contentTypeIcon(type: string) {
  const map: Record<string, string> = { video: 'lucide:video', audio: 'lucide:headphones', text: 'lucide:file-text' }
  return map[type] ?? 'lucide:file'
}

function addManualContent(item: typeof allContentItems.value[number]) {
  selectedContent.value.push({ ...item })
  contentSearch.value = ''
}

function removeManualContent(index: number) {
  selectedContent.value.splice(index, 1)
}

// ── Explora Otras Secciones config ──
interface AppSection { id: string; title: string; meta: string; icon: string; route: string }

const allAppSections: AppSection[] = [
  { id: 'ai-coach', title: 'Mi Coach IA', meta: 'Conversaciones guiadas para tu crecimiento', icon: 'lucide:bot', route: '/cuenta/ia' },
  { id: 'eventos', title: 'Eventos', meta: 'Talleres en vivo y grabaciones', icon: 'lucide:calendar', route: '/cuenta/eventos' },
  { id: 'vip', title: 'VIP', meta: 'Contenido exclusivo y beneficios', icon: 'lucide:star', route: '/cuenta/complementos' },
  { id: 'biblioteca', title: 'Biblioteca', meta: 'Todo el contenido disponible', icon: 'lucide:book', route: '/cuenta/biblioteca' },
  { id: 'comunidad', title: 'Comunidad', meta: 'Comparte con otros miembros', icon: 'lucide:users', route: '/cuenta/comunidad' },
  { id: 'beneficios', title: 'Beneficios', meta: 'Descuentos y alianzas exclusivas', icon: 'lucide:tag', route: '/cuenta/beneficios' },
  { id: 'retos', title: 'Programas', meta: 'Programas y retos activos', icon: 'lucide:flag', route: '/cuenta/retos' },
]

const exploreSections = ref<(AppSection & { featured: boolean })[]>([
  { ...allAppSections[0]!, featured: true },
  { ...allAppSections[1]!, featured: false },
  { ...allAppSections[2]!, featured: false },
])

const sectionToAdd = ref('')

const availableSectionsToAdd = computed(() => {
  const activeIds = new Set(exploreSections.value.map(s => s.id))
  return allAppSections
    .filter(s => !activeIds.has(s.id))
    .map(s => ({ value: s.id, label: s.title }))
})

function setFeaturedSection(id: string) {
  exploreSections.value.forEach(s => { s.featured = s.id === id })
}

function removeExploreSection(index: number) {
  const wasFeatured = exploreSections.value[index]?.featured
  exploreSections.value.splice(index, 1)
  if (wasFeatured && exploreSections.value[0]) {
    exploreSections.value[0].featured = true
  }
}

function addExploreSection() {
  const source = allAppSections.find(s => s.id === sectionToAdd.value)
  if (!source) return
  exploreSections.value.push({
    ...source,
    featured: exploreSections.value.length === 0,
  })
  sectionToAdd.value = ''
}

// ── Shared helpers ──
function formatDate(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })
}

function statusLabel(status: string) {
  const map: Record<string, string> = { published: 'Publicado', scheduled: 'Programado', draft: 'Borrador' }
  return map[status] ?? status
}

function goToDate(date: string) {
  router.push(`/admin/hoy/${date}`)
}

function goToDateFromRow(row: Record<string, any>) {
  router.push(`/admin/hoy/${row.date}`)
}
</script>

<style scoped>
/* ── Weekly Calendar ── */
.hoy-calendar {
  margin-top: var(--space-6);
}

.hoy-calendar__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--space-3);
}

.hoy-calendar__day {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
  min-height: 120px;
}

.hoy-calendar__day--today {
  border-color: var(--color-primary);
  background: rgba(40, 55, 74, 0.03);
}

.hoy-calendar__day--has-content {
  border-left: 3px solid var(--color-success);
}

.hoy-calendar__day-name {
  font-size: var(--eyebrow-sm);
}

.hoy-calendar__day-number {
  font-family: var(--font-title);
  font-size: var(--title-sm);
  color: var(--color-text);
}

.hoy-calendar__day-count {
  font-size: var(--text-xs);
  color: var(--color-success);
  font-weight: var(--weight-medium);
}

.hoy-calendar__day-empty {
  font-size: var(--text-xs);
  color: var(--color-muted);
}

.hoy-list {
  margin-top: var(--space-6);
}

/* ── Year View ── */
.hoy-year {
  margin-top: var(--space-6);
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.hoy-year__month {
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-5);
}

.hoy-year__month-name {
  font-family: var(--font-title);
  font-size: var(--title-sm);
  color: var(--color-text);
  margin-bottom: var(--space-3);
}

.hoy-year__weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.hoy-year__weekday {
  text-align: center;
  font-size: var(--text-xs);
  color: var(--color-muted);
  font-weight: var(--weight-medium);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.hoy-year__grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--space-2);
}

.hoy-year__spacer {
  /* empty cell for alignment */
}

.hoy-year__day {
  background: rgba(var(--tint-rgb), 0.1);
  border: 1px solid transparent;
  border-radius: var(--radius-md);
  padding: var(--space-2);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-1);
  cursor: pointer;
  min-height: 44px;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.hoy-year__day--today {
  border-color: var(--color-primary);
  background: rgba(40, 55, 74, 0.04);
}

.hoy-year__day--has-content {
  border-left: 3px solid var(--color-success);
}

.hoy-year__day-number {
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  color: var(--color-text);
}

.hoy-year__day-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-success);
}

/* ── Config Sections ── */
.hoy-config-section {
  margin-top: var(--space-8);
  padding-top: var(--space-6);
  border-top: 1px solid var(--color-border);
}

.hoy-config-section :deep(.card) {
  overflow: visible;
}

.section-title {
  font-family: var(--font-body);
  font-size: var(--text-lg);
  font-weight: var(--weight-semibold);
}

.section-description {
  font-size: var(--text-sm);
  color: var(--color-muted);
  margin-top: var(--space-1);
  margin-bottom: var(--space-4);
  line-height: var(--leading-normal);
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.meta-hint {
  font-size: var(--text-sm);
  color: var(--color-muted);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

/* ── Manual Content Picker ── */
.manual-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.manual-content__search-wrapper {
  position: relative;
}

.manual-content__results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 10;
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  max-height: 200px;
  overflow-y: auto;
  box-shadow: var(--shadow-2, 0 4px 12px rgba(0, 0, 0, 0.1));
}

.manual-content__result-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  width: 100%;
  border: none;
  background: none;
  cursor: pointer;
  font-size: var(--text-sm);
  color: var(--color-text);
  text-align: left;
}

.manual-content__result-duration {
  margin-left: auto;
  font-size: var(--text-xs);
  color: var(--color-muted);
}

.manual-content__selected {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  margin-top: var(--space-2);
}

.manual-content__item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  background: rgba(var(--tint-rgb), 0.05);
  border-radius: var(--radius-md);
}

.manual-content__item-title {
  font-size: var(--text-sm);
  flex: 1;
}

.manual-content__item-duration {
  font-size: var(--text-xs);
  color: var(--color-muted);
}

.manual-content__empty {
  font-size: var(--text-sm);
  color: var(--color-muted);
  padding: var(--space-4);
  text-align: center;
}

/* ── Toggle Row (Explore sections) ── */
.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--color-border);
}

.toggle-row:last-of-type {
  border-bottom: none;
}

.toggle-row__info {
  flex: 1;
}

.toggle-row__icon-name {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.toggle-row__label {
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

.toggle-row__controls {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

/* ── Explore Add Form ── */
.explore-add {
  margin-top: var(--space-4);
  padding-top: var(--space-4);
}

.explore-add__row {
  display: flex;
  align-items: flex-end;
  gap: var(--space-3);
  margin-top: var(--space-3);
}

.explore-add__row > :first-child {
  flex: 1;
}

@media (hover: hover) {
  .hoy-calendar__day:hover {
    border-color: var(--color-primary);
    box-shadow: var(--shadow-1);
  }

  .hoy-year__day:hover {
    border-color: var(--color-primary);
    box-shadow: var(--shadow-1);
  }

  .manual-content__result-item:hover {
    background: var(--color-surface);
  }
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .hoy-calendar__grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .hoy-year__grid {
    gap: var(--space-1);
  }

  .hoy-year__day {
    padding: var(--space-1);
    min-height: 36px;
  }

  .toggle-row {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2);
  }

  .toggle-row__controls {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
