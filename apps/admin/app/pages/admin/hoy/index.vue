<template>
  <div>
    <div class="page-header">
      <h1 class="page-header__title">Hoy - Planificación diaria</h1>
      <div class="page-header__actions">
        <UiButton v-if="activeTab !== 'all'" variant="outline" size="sm" @click="viewMode = viewMode === 'calendar' ? 'list' : 'calendar'">
          {{ viewMode === 'calendar' ? 'Ver solo días con plan' : 'Ver calendario' }}
        </UiButton>
      </div>
    </div>

    <!-- Skeleton loader -->
    <template v-if="status === 'pending' || status === 'idle'">
      <div class="hoy-skeleton">
        <div class="hoy-skeleton__tabs">
          <UiSkeleton variant="rect" width="120px" height="36px" radius="var(--radius-md)" />
          <UiSkeleton variant="rect" width="120px" height="36px" radius="var(--radius-md)" />
          <UiSkeleton variant="rect" width="120px" height="36px" radius="var(--radius-md)" />
        </div>
        <div class="hoy-skeleton__calendar">
          <div v-for="i in 7" :key="i" class="hoy-skeleton__day">
            <UiSkeleton variant="text" width="32px" height="12px" />
            <UiSkeleton variant="text" width="24px" height="24px" />
            <UiSkeleton variant="text" width="64px" height="12px" />
          </div>
        </div>
        <div class="hoy-skeleton__config">
          <UiSkeleton variant="text" width="200px" height="20px" />
          <UiSkeleton variant="text" width="300px" height="14px" />
          <UiSkeleton variant="rect" width="100%" height="120px" radius="var(--radius-lg)" />
        </div>
      </div>
    </template>

    <!-- Error state -->
    <template v-else-if="status === 'error'">
      <UiErrorState title="No pudimos cargar la planificación" @retry="refresh()" />
    </template>

    <template v-else>
    <UiTabs v-model="activeTab" :tabs="weekTabs" />

    <!-- Weekly views (Esta semana / Próxima semana) -->
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
        <UiDataTable fill :columns="columns" :rows="dailyPlans" @row-click="goToDateFromRow" @retry="refresh()">
          <template #toolbar>
            <UiInput
              v-model="searchInput"
              placeholder="Buscar por fecha..."
              style="min-width: 200px;"
            >
              <template #suffix><Icon name="lucide:search" size="18" /></template>
            </UiInput>
          </template>

          <template #cell-date="{ value }">
            <strong>{{ formatDate(value) }}</strong>
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
      <p class="section-description">Valores que se muestran en la app cuando un día no tiene plan configurado. La frase, acción y badge por defecto.</p>

      <UiCard variant="outlined">
        <div class="form-section">
          <span class="eyebrow">Frase del día</span>
          <UiTextarea
            v-model="defaults.phrase_text"
            label="Frase"
            placeholder="Frase motivacional por defecto..."
            :rows="2"
            required
            :error="defaultErrors.phrase_text"
          />
          <UiSelect
            v-model="defaults.phrase_author"
            label="Quién dice la frase"
            :options="defaultAuthorOptions"
            required
            :error="defaultErrors.phrase_author"
          />
        </div>
      </UiCard>

      <UiCard variant="outlined" style="margin-top: var(--space-4);">
        <div class="form-section">
          <span class="eyebrow">Acción del día</span>
          <UiSelect
            v-model="defaults.action_type"
            label="Tipo"
            :options="defaultActionTypeOptions"
            required
            :error="defaultErrors.action_type"
          />

          <UiSelect
            v-if="defaults.action_type === 'contenido'"
            v-model="defaults.content_id"
            label="Contenido"
            :options="defaultContentOptions"
            placeholder="Selecciona contenido"
            required
            :error="defaultErrors.content_id"
          />

          <UiSelect
            v-if="defaults.action_type === 'formulario'"
            v-model="defaults.form_id"
            label="Formulario"
            :options="defaultFormOptions"
            placeholder="Selecciona formulario"
            required
            :error="defaultErrors.form_id"
          />

          <div class="featured-img-field">
            <span class="eyebrow">Portada de acción del día</span>
            <div
              class="img-card__dropzone"
              :class="{ 'img-card__dropzone--active': isDraggingFeatured }"
              @dragover.prevent="isDraggingFeatured = true"
              @dragleave="isDraggingFeatured = false"
              @drop.prevent="handleFeaturedDrop"
              @click="featuredInput?.click()"
            >
              <input
                ref="featuredInput"
                type="file"
                accept="image/*"
                class="img-card__input"
                @change="handleFeaturedFileChange"
              />
              <template v-if="featuredPreview || (!featuredCleared && defaults.featured_img_url)">
                <img
                  :src="featuredPreview || defaults.featured_img_url"
                  alt="Portada acción del día"
                  class="img-card__preview"
                />
                <button class="img-card__remove" @click.stop="clearFeatured">Eliminar</button>
              </template>
              <div v-else class="img-card__placeholder">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                </svg>
                <p class="img-card__hint">Arrastra o selecciona</p>
              </div>
            </div>
          </div>

        </div>
      </UiCard>

      <UiCard variant="outlined" style="margin-top: var(--space-4);">
        <div class="form-section">
          <span class="eyebrow">Badge</span>
          <UiInput
            v-model="defaults.badge_title"
            label="Título del badge"
            placeholder="Ej: Día completado"
            required
            :error="defaultErrors.badge_title"
          />
          <UiInput
            v-model="defaults.badge_subtitle"
            label="Subtítulo del badge"
            placeholder="Ej: Sigue así, vas genial"
            required
            :error="defaultErrors.badge_subtitle"
          />
        </div>
      </UiCard>
    </section>

    <!-- Contenido Reciente Configuration -->
    <section class="hoy-config-section">
      <h2 class="section-title">Contenido reciente</h2>
      <p class="section-description">Configura qué contenido se muestra en la sección "Contenido Reciente" de la pantalla Hoy.</p>

      <UiCard variant="outlined">
        <div class="form-section">
          <UiSelect
            v-model="recentContentMode"
            label="Modo de selección"
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
            Se mostrarán automáticamente los 5 contenidos más recientes publicados en la biblioteca.
          </p>
        </div>
      </UiCard>
    </section>

    <!-- Explora otras secciones Configuration -->
    <section class="hoy-config-section">
      <h2 class="section-title">Explora otras secciones</h2>
      <p class="section-description">Administra las secciones que aparecen en "Explora otras secciones" en la pantalla Hoy. Agrega, quita y elige cuál es la destacada.</p>

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
            <span class="eyebrow">Agregar sección</span>
            <div class="explore-add__row">
              <UiSelect v-model="sectionToAdd" :options="availableSectionsToAdd" placeholder="Selecciona una sección..." />
              <UiButton variant="outline" size="sm" :disabled="!sectionToAdd" @click="addExploreSection">
                <template #icon><Icon name="lucide:plus" size="14" /></template>
                Agregar
              </UiButton>
            </div>
          </div>
        </div>
      </UiCard>
    </section>

    <div class="page-actions">
      <UiButton variant="primary-outline" size="sm" :loading="savingConfig" @click="handleSaveConfig">Guardar configuración</UiButton>
    </div>
    </template>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const client = useSupabaseClient()
const router = useRouter()
const { input: searchInput, debounced: search } = useDebouncedRef('')
const viewMode = ref<'calendar' | 'list'>(
  (typeof localStorage !== 'undefined' && localStorage.getItem('hoy-view-mode') as 'calendar' | 'list') || 'calendar',
)
watch(viewMode, (v) => localStorage.setItem('hoy-view-mode', v))
const activeTab = ref('current')

const weekTabs = [
  { value: 'current', label: 'Esta semana' },
  { value: 'next', label: 'Próxima semana' },
  { value: 'all', label: 'Todos los planes' },
]

const columns = [
  { key: 'date', label: 'Fecha' },
]

// ── Fetch daily plans from Supabase (filtered by active tab & search) ──
const { data: plans, refresh, status: fetchStatus } = useAsyncData('admin-daily-plans', async () => {
  let query = client.from('daily_plans').select('*')

  if (activeTab.value === 'all') {
    const year = new Date().getFullYear()
    query = query.gte('date', `${year}-01-01`).lte('date', `${year}-12-31`)
  } else {
    const weekOffset = activeTab.value === 'next' ? 1 : 0
    const monday = getWeekMonday(weekOffset)
    const sunday = new Date(monday)
    sunday.setDate(monday.getDate() + 6)
    query = query.gte('date', toDateStr(monday)).lte('date', toDateStr(sunday))
  }

  if (search.value) {
    query = query.ilike('date', `%${search.value}%`)
  }

  const { data } = await query.order('date', { ascending: false })
  return data ?? []
}, { watch: [activeTab, search], lazy: true })

const hasLoadedOnce = ref(false)
const status = computed(() => {
  if (!hasLoadedOnce.value) return fetchStatus.value
  // After first load, don't flash skeleton on re-fetches
  return fetchStatus.value === 'pending' ? 'success' : fetchStatus.value
})
watch(fetchStatus, (val) => {
  if (val === 'success' || val === 'error') hasLoadedOnce.value = true
})

// ── Helper: get Monday of a given week offset (0 = current, 1 = next) ──
function getWeekMonday(offset: number): Date {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 0 ? -6 : 1 - day // Monday
  const monday = new Date(now)
  monday.setDate(now.getDate() + diff + offset * 7)
  monday.setHours(0, 0, 0, 0)
  return monday
}

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const DAY_NAMES_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

// ── Build calendar days for the selected week tab ──
const calendarDays = computed(() => {
  const weekOffset = activeTab.value === 'next' ? 1 : 0
  const monday = getWeekMonday(weekOffset)
  const todayStr = toDateStr(new Date())
  const days = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    const dateStr = toDateStr(d)
    const plansForDay = (plans.value ?? []).filter(p => p.date === dateStr)
    days.push({
      date: dateStr,
      dayName: DAY_NAMES_ES[d.getDay()]!,
      dayNumber: d.getDate(),
      items: plansForDay.length,
      isToday: dateStr === todayStr,
    })
  }
  return days
})

// ── Map plans into table-friendly rows (for list view) ──
const dailyPlans = computed(() => {
  return (plans.value ?? []).map(p => ({ id: p.id, date: p.date }))
})

// ── Year view for "Todos los planes" ──
const MONTH_NAMES_ES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

const dayNamesShort = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

const datesWithContent = computed(() => {
  return new Set((plans.value ?? []).map(p => p.date))
})

const yearMonths = computed(() => {
  const year = new Date().getFullYear()
  const _n = new Date()
  const today = `${_n.getFullYear()}-${String(_n.getMonth() + 1).padStart(2, '0')}-${String(_n.getDate()).padStart(2, '0')}`
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
        hasContent: datesWithContent.value.has(dateStr),
      })
    }
    return { key: `${year}-${monthIndex}`, name: `${name} ${year}`, startOffset: startDow, days }
  })
})

// ── Save all config ──
const savingConfig = ref(false)
const toast = useToast()
const defaultErrors = reactive({
  phrase_text: '',
  phrase_author: '',
  action_type: '',
  content_id: '',
  form_id: '',
  badge_title: '',
  badge_subtitle: '',
})

async function handleSaveConfig() {
  // Reset errors
  defaultErrors.phrase_text = ''
  defaultErrors.phrase_author = ''
  defaultErrors.action_type = ''
  defaultErrors.content_id = ''
  defaultErrors.form_id = ''
  defaultErrors.badge_title = ''
  defaultErrors.badge_subtitle = ''

  // Validate defaults
  let valid = true
  if (!defaults.phrase_text?.trim()) { defaultErrors.phrase_text = 'La frase es obligatoria'; valid = false }
  if (!defaults.phrase_author) { defaultErrors.phrase_author = 'El autor es obligatorio'; valid = false }
  if (!defaults.action_type) { defaultErrors.action_type = 'El tipo es obligatorio'; valid = false }
  if (defaults.action_type === 'contenido' && !defaults.content_id) { defaultErrors.content_id = 'El contenido es obligatorio'; valid = false }
  if (defaults.action_type === 'formulario' && !defaults.form_id) { defaultErrors.form_id = 'El formulario es obligatorio'; valid = false }
  if (!defaults.badge_title?.trim()) { defaultErrors.badge_title = 'El título es obligatorio'; valid = false }
  if (!defaults.badge_subtitle?.trim()) { defaultErrors.badge_subtitle = 'El subtítulo es obligatorio'; valid = false }
  if (!valid) return

  savingConfig.value = true
  try {
    // Upload featured image if changed
    if (featuredFile.value) {
      defaults.featured_img_url = await uploadFeaturedImg(featuredFile.value)
      featuredFile.value = null
      featuredPreview.value = ''
    } else if (featuredCleared.value) {
      defaults.featured_img_url = ''
      featuredCleared.value = false
    }

    const now = new Date().toISOString()
    const { error } = await client.from('app_settings').upsert([
      { key: 'hoy_defaults', value: { ...defaults }, updated_at: now },
      {
        key: 'hoy_recent_content',
        value: {
          mode: recentContentMode.value,
          selected_ids: selectedContent.value.map(c => c.id),
        },
        updated_at: now,
      },
      {
        key: 'hoy_explore_sections',
        value: {
          sections: exploreSections.value.map(s => ({ id: s.id, featured: s.featured })),
        },
        updated_at: now,
      },
    ])
    if (error) throw error
    toast.show('Configuración guardada correctamente', 'success')
  } catch {
    toast.show('Error al guardar la configuración', 'error')
  } finally {
    savingConfig.value = false
  }
}

// ── Load saved config from app_settings ──
const { data: savedConfig, refresh: refreshSavedConfig } = useAsyncData('hoy-config', async () => {
  const { data } = await client
    .from('app_settings')
    .select('key, value')
    .in('key', ['hoy_defaults', 'hoy_recent_content', 'hoy_explore_sections'])
  const map: Record<string, any> = {}
  for (const row of data ?? []) {
    map[row.key] = row.value
  }
  return map
}, { lazy: true, server: false, default: () => ({}) })

function formatDuration(seconds: number | null) {
  if (!seconds) return ''
  return `${Math.round(seconds / 60)} min`
}

const { data: adminHoyOptions, refresh: refreshAdminHoyOptions } = useAsyncData('admin-hoy-options', async () => {
  const [{ data: contentItems }, { data: forms }] = await Promise.all([
    client
      .from('content_items')
      .select('id, title, type, duration_seconds, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false }),
    client
      .from('forms')
      .select('id, title')
      .eq('status', 'active')
      .order('created_at', { ascending: false }),
  ])

  return {
    contentItems: (contentItems ?? []).map(item => ({
      id: item.id,
      type: item.type,
      title: item.title,
      duration: formatDuration(item.duration_seconds),
    })),
    forms: forms ?? [],
  }
}, {
  lazy: true,
  server: false,
  default: () => ({ contentItems: [], forms: [] }),
})

// ── Defaults config (loaded from DB, seed guarantees values exist) ──
const defaults = reactive({
  phrase_text: '',
  phrase_author: '',
  action_type: '',
  content_id: '',
  form_id: '',
  badge_title: '',
  badge_subtitle: '',
  featured_img_url: '',
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

const defaultContentOptions = computed(() =>
  adminHoyOptions.value.contentItems.map(item => ({ value: item.id, label: item.title })),
)

const defaultFormOptions = computed(() =>
  adminHoyOptions.value.forms.map(form => ({ value: form.id, label: form.title })),
)

watch(() => defaults.action_type, (nextType, oldType) => {
  if (!oldType || nextType === oldType) return
  defaults.content_id = ''
  defaults.form_id = ''
})

// ── Featured image (portada acción del día) ──
const isDraggingFeatured = ref(false)
const featuredInput = ref<HTMLInputElement | null>(null)
const featuredFile = ref<File | null>(null)
const featuredPreview = ref('')
const featuredCleared = ref(false)

function setFeaturedFile(file: File) {
  featuredFile.value = file
  featuredPreview.value = URL.createObjectURL(file)
  featuredCleared.value = false
}

function handleFeaturedFileChange(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  setFeaturedFile(file)
}

function handleFeaturedDrop(event: DragEvent) {
  isDraggingFeatured.value = false
  const file = event.dataTransfer?.files[0]
  if (!file || !file.type.startsWith('image/')) return
  setFeaturedFile(file)
}

function clearFeatured() {
  featuredFile.value = null
  featuredPreview.value = ''
  featuredCleared.value = true
  if (featuredInput.value) featuredInput.value.value = ''
}

async function uploadFeaturedImg(file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `hoy/featured-${Date.now()}.${ext}`
  const { error } = await client.storage.from('content-covers').upload(path, file, { upsert: true })
  if (error) throw error
  const { data: urlData } = client.storage.from('content-covers').getPublicUrl(path)
  return urlData.publicUrl
}

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
  { value: 'automatic', label: 'Automático (contenido más reciente)' },
  { value: 'manual', label: 'Manual (seleccionar contenido)' },
]

const contentSearch = ref('')

const allContentItems = computed(() => adminHoyOptions.value.contentItems)

const selectedContent = ref<typeof allContentItems.value>([])

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
  { id: 'suscripcion', title: 'Suscripción', meta: 'Tu plan y opciones de upgrade', icon: 'lucide:wallet', route: '/cuenta/suscripcion' },
  { id: 'vip', title: 'VIP', meta: 'Contenido exclusivo y beneficios', icon: 'lucide:star', route: '/cuenta/complementos' },
  { id: 'biblioteca', title: 'Biblioteca', meta: 'Todo el contenido disponible', icon: 'lucide:book', route: '/cuenta/biblioteca' },
  { id: 'comunidad', title: 'Comunidad', meta: 'Comparte con otros miembros', icon: 'lucide:users', route: '/cuenta/comunidad' },
  { id: 'beneficios', title: 'Beneficios', meta: 'Descuentos y alianzas exclusivas', icon: 'lucide:tag', route: '/cuenta/beneficios' },
  { id: 'retos', title: 'Programas', meta: 'Programas y retos activos', icon: 'lucide:flag', route: '/cuenta/retos' },
]

const exploreSections = ref<(AppSection & { featured: boolean })[]>([])

const hasHydratedHoyConfig = ref(false)
const hasHydratedSelectedContent = ref(false)

function mapExploreSections(sections: { id: string; featured: boolean }[] = []) {
  return sections
    .map(section => {
      const source = allAppSections.find(appSection => appSection.id === section.id)
      return source ? { ...source, featured: section.featured } : null
    })
    .filter((section): section is AppSection & { featured: boolean } => section !== null)
}

watch(() => savedConfig.value?.hoy_defaults, (hoyDefaults) => {
  if (hasHydratedHoyConfig.value || !hoyDefaults) return

  defaults.phrase_text = hoyDefaults.phrase_text ?? ''
  defaults.phrase_author = hoyDefaults.phrase_author ?? ''
  defaults.action_type = hoyDefaults.action_type ?? ''
  defaults.content_id = hoyDefaults.content_id ?? ''
  defaults.form_id = hoyDefaults.form_id ?? ''
  defaults.badge_title = hoyDefaults.badge_title ?? ''
  defaults.badge_subtitle = hoyDefaults.badge_subtitle ?? ''
  defaults.featured_img_url = hoyDefaults.featured_img_url ?? ''

  recentContentMode.value = savedConfig.value?.hoy_recent_content?.mode ?? 'automatic'
  exploreSections.value = mapExploreSections(savedConfig.value?.hoy_explore_sections?.sections ?? [])
  hasHydratedHoyConfig.value = true
}, { immediate: true })

watch([savedConfig, allContentItems], ([config, contentItems]) => {
  if (hasHydratedSelectedContent.value || !config) return

  const selectedIds = new Set(config.hoy_recent_content?.selected_ids ?? [])
  if (selectedIds.size > 0 && contentItems.length === 0) return

  selectedContent.value = contentItems.filter(item => selectedIds.has(item.id))
  hasHydratedSelectedContent.value = true
}, { immediate: true })

onMounted(() => {
  if (!savedConfig.value || Object.keys(savedConfig.value).length === 0) {
    refreshSavedConfig()
  }

  if (adminHoyOptions.value.contentItems.length === 0 && adminHoyOptions.value.forms.length === 0) {
    refreshAdminHoyOptions()
  }
})

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


function goToDate(date: string) {
  router.push(`/admin/hoy/${date}`)
}

function goToDateFromRow(row: Record<string, any>) {
  router.push(`/admin/hoy/${row.date}`)
}
</script>

<style scoped>
/* ── Skeleton ── */
.hoy-skeleton {
  display: flex;
  flex-direction: column;
  gap: var(--space-6);
  margin-top: var(--space-4);
}

.hoy-skeleton__tabs {
  display: flex;
  gap: var(--space-3);
}

.hoy-skeleton__calendar {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: var(--space-3);
}

.hoy-skeleton__day {
  background: var(--color-desktop-card, var(--color-white));
  border: 1px solid var(--color-desktop-border, var(--color-border-light));
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  min-height: 120px;
}

.hoy-skeleton__config {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  padding-top: var(--space-6);
  border-top: 1px solid var(--color-border);
}

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

/* ── Featured Image Uploader ── */
.featured-img-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.img-card__dropzone {
  position: relative;
  border: 2px dashed var(--color-border-light);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  min-height: 180px;
  cursor: pointer;
  transition: border-color var(--transition-fast), background var(--transition-fast);
}

.img-card__dropzone--active {
  border-color: var(--color-primary);
  background: rgba(var(--tint-rgb), 0.04);
}

.img-card__input {
  position: absolute;
  inset: 0;
  opacity: 0;
  pointer-events: none;
}

.img-card__preview {
  width: 100%;
  max-height: 200px;
  object-fit: contain;
  border-radius: var(--radius-sm);
}

.img-card__placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  color: var(--color-muted);
}

.img-card__hint {
  font-size: var(--text-xs);
  color: var(--color-muted);
}

.img-card__remove {
  background: none;
  border: none;
  color: var(--color-danger);
  font-size: var(--text-xs);
  cursor: pointer;
  padding: var(--space-1) var(--space-2);
}

@media (hover: hover) {
  .img-card__dropzone:hover {
    border-color: var(--color-text-secondary);
  }
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
  .hoy-skeleton__calendar {
    grid-template-columns: repeat(2, 1fr);
  }

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
