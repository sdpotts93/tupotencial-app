<template>
  <div class="screen">
    <div class="screen__content">
      <header class="events__header">
        <button class="events__back" aria-label="Volver" @click="$router.back()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h1 class="events__header-title">Eventos y Lives</h1>
      </header>

      <!-- Upcoming -->
      <section class="events__section">
        <p class="eyebrow">PRÓXIMOS</p>
        <div class="events__list">
          <NuxtLink
            v-for="event in upcomingEvents"
            :key="event.id"
            :to="`/cuenta/eventos/${event.id}`"
            class="events__card"
          >
            <div class="events__card-hero">
              <img :src="event.img" alt="" class="events__card-img" />
              <span class="events__card-date">{{ event.dateLabel }}</span>
            </div>
            <div class="events__card-info">
              <span class="events__card-eyebrow">{{ event.timeLabel }}</span>
              <h3 class="events__card-name">{{ event.title }}</h3>
              <p class="events__card-desc">{{ event.description }}</p>
              <div v-if="event.requiresSub" class="events__card-footer">
                <span class="events__tag events__tag--member">Solo miembros</span>
              </div>
            </div>
          </NuxtLink>
        </div>
      </section>

      <!-- Past -->
      <section class="events__section">
        <p class="eyebrow">PASADOS</p>
        <div class="events__past-list">
          <NuxtLink
            v-for="event in pastEvents"
            :key="event.id"
            :to="`/cuenta/eventos/${event.id}`"
            class="events__past-card"
          >
            <img :src="event.img" alt="" class="events__past-img" />
            <div class="events__past-body">
              <span class="events__past-title">{{ event.title }}</span>
              <span class="events__past-meta">GRABACIÓN · {{ event.dateLabel }}</span>
            </div>
            <svg class="events__past-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </NuxtLink>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const upcomingEvents = ref([
  { id: 'mock-event-001', title: 'Live: Meditación grupal', description: 'Sesión guiada de meditación con Carlotta.', dateLabel: '28 Feb', timeLabel: 'JUEVES 19:00 CDMX', img: '/images/lib-4.jpg', requiresSub: true },
  { id: 'mock-event-002', title: 'Q&A: Hábitos de alto rendimiento', description: 'Preguntas y respuestas con Gabriel.', dateLabel: '5 Mar', timeLabel: 'MIÉRCOLES 20:00 CDMX', img: '/images/lib-8.jpg', requiresSub: true },
])

const pastEvents = ref([
  { id: 'mock-event-003', title: 'Live: Respiración y estrés', dateLabel: '15 Feb 2026', img: '/images/lib-2.jpg' },
  { id: 'mock-event-004', title: 'Taller: Diario de gratitud', dateLabel: '8 Feb 2026', img: '/images/lib-6.jpg' },
])
</script>

<style scoped>
/* ─── Header (matches retos) ─── */
.events__header {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: var(--space-6);
}

.events__header-title {
  font-family: var(--font-eyebrow);
  font-size: 12px;
  text-transform: uppercase;
}

.events__back {
  position: absolute;
  left: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--color-dark-lighter);
  cursor: pointer;
  border-radius: var(--radius-md);
  -webkit-tap-highlight-color: transparent;
}
.events__back:hover { background: rgba(var(--tint-rgb), 0.04); }

/* ─── Sections ─── */
.events__section { margin-bottom: var(--space-8); }
.events__section > .eyebrow { margin-bottom: var(--space-3); }

/* ─── Upcoming cards ─── */
.events__list {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.events__card {
  display: flex;
  flex-direction: column;
  width: 100%;
  text-decoration: none;
  color: var(--color-text);
}
.events__card + .events__card {
  border-top: 1px solid rgba(var(--tint-rgb), 0.1);
  padding-top: var(--space-8);
}

.events__card-hero {
  position: relative;
}

.events__card-img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  display: block;
  border-radius: var(--radius-2xl);
}

.events__card-info {
  padding: var(--space-4) var(--space-1) 0;
}

.events__card-date {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
  font-family: var(--font-eyebrow);
  font-size: var(--eyebrow-md);
  font-weight: var(--weight-bold);
  background: rgba(var(--tint-rgb), 0.5);
  color: var(--color-white);
  padding: var(--space-1) var(--space-3);
  border-radius: var(--radius-md);
  backdrop-filter: blur(4px);
}

.events__card-eyebrow {
  display: block;
  font-family: var(--font-eyebrow);
  font-size: var(--eyebrow-sm);
  font-weight: var(--weight-bold);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--color-text);
  margin-bottom: var(--space-3);
}

.events__card-name {
  font-family: var(--font-title);
  font-size: var(--title-md);
  color: var(--color-text);
  margin: 0 0 var(--space-1);
  line-height: var(--leading-snug);
}

.events__card-desc {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: var(--leading-normal);
}

.events__card-footer {
  margin-top: var(--space-3);
}

.events__tag {
  display: inline-flex;
  align-items: center;
  font-family: var(--font-eyebrow);
  font-size: var(--eyebrow-sm);
  font-weight: var(--weight-semibold);
  letter-spacing: 0.04em;
  text-transform: uppercase;
  border-radius: var(--radius-full);
  padding: var(--space-1) var(--space-3);
  white-space: nowrap;
}

.events__tag--member {
  background: var(--color-gold-bg);
  color: var(--color-gold);
}

/* ─── Past events (day__card style) ─── */
.events__past-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.events__past-card {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  width: 100%;
  text-decoration: none;
  color: var(--color-text);
  border-radius: var(--radius-xl);
  padding: var(--space-3) var(--space-4);
  cursor: pointer;
  background: rgba(var(--tint-rgb), 0.04);
  transition: background var(--transition-fast);
}
.events__past-card:hover { background: rgba(var(--tint-rgb), 0.06); }
.events__past-card:active { background: rgba(var(--tint-rgb), 0.08); }

.events__past-img {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-lg);
  object-fit: cover;
  flex-shrink: 0;
}

.events__past-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.events__past-title {
  font-family: var(--font-body);
  font-size: var(--text-base);
  font-weight: var(--weight-semibold);
  line-height: var(--leading-snug);
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.events__past-meta {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: var(--color-muted);
  font-family: var(--font-eyebrow);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.events__past-chevron {
  flex-shrink: 0;
  color: var(--color-muted);
}

/* ─── Desktop SaaS ─── */
@media (min-width: 1024px) {
  .events__header {
    justify-content: flex-start;
  }

  .events__header-title {
    display: none;
  }

  .events__back {
    display: none;
  }

  .events__list {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--space-6);
  }

  .events__card {
    background: var(--color-desktop-card);
    border: 1px solid var(--color-desktop-border);
    border-radius: var(--radius-lg);
    overflow: hidden;
    transition: border-color var(--transition-fast);
  }

  .events__card:hover {
    border-color: var(--color-border);
  }

  .events__card + .events__card {
    border-top: none;
    padding-top: 0;
  }

  .events__card-img {
    border-radius: var(--radius-lg) var(--radius-lg) 0 0;
    aspect-ratio: 16 / 9;
  }

  .events__card-info {
    padding: var(--space-4) var(--space-5);
  }

  .events__past-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-4);
  }

  .events__past-card {
    background: var(--color-desktop-card);
    border: 1px solid var(--color-desktop-border);
    border-radius: var(--radius-lg);
  }

  .events__past-card:hover {
    background: var(--color-desktop-card);
    border-color: var(--color-border);
  }
}
</style>
