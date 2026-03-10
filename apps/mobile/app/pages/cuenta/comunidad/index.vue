<template>
  <div class="screen">
    <div class="screen__content">
      <header class="community__header">
        <h1 class="community__header-title">Comunidad</h1>
      </header>

      <p class="community__subtitle">El espacio donde compartir avances, sostener el proceso y crecer con otros que viven con intención.</p>

      <div class="community__desktop-wrapper">
        <!-- Main feed column -->
        <div class="community__main">
          <!-- Filter pills -->
          <div class="community__pills">
            <button
              v-for="f in filters"
              :key="f.value"
              :class="['community__pill', { 'community__pill--active': activeFilter === f.value }]"
              @click="activeFilter = f.value"
            >
              {{ f.label }}
            </button>
          </div>

          <!-- Community feed -->
          <div class="community__feed">
            <article v-for="post in filteredPosts" :key="post.id" class="post" @click="navigateTo(`/cuenta/comunidad/publicacion/${post.id}`)">
              <div class="post__header">
                <img :src="post.avatar" alt="" class="post__avatar" />
                <div class="post__meta">
                  <span class="post__author">{{ post.author }}</span>
                  <span class="post__time">{{ post.timeAgo }}</span>
                </div>
              </div>

              <h3 v-if="post.title" class="post__title">{{ post.title }}</h3>
              <p class="post__body">{{ post.body }}</p>

              <div class="post__actions">
                <button class="post__action" @click.stop="toggleReaction(post.id)">
                  <svg width="18" height="18" viewBox="0 0 24 24" :fill="post.liked ? 'var(--color-danger)' : 'none'" :stroke="post.liked ? 'var(--color-danger)' : 'currentColor'" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                  <span>{{ post.reactions }}</span>
                </button>
                <span class="post__action">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                  <span>{{ post.comments }}</span>
                </span>
              </div>
            </article>
          </div>
        </div>

        <!-- Desktop right sidebar -->
        <aside class="community__sidebar">
          <div class="sidebar__section">
            <h3 class="sidebar__title">Atajos</h3>
            <div class="sidebar__cards">
              <NuxtLink
                v-for="shortcut in shortcuts"
                :key="shortcut.to"
                :to="shortcut.to"
                class="shortcut-card"
              >
                <span class="shortcut-card__icon" v-html="shortcut.icon" />
                <div class="shortcut-card__text">
                  <span class="shortcut-card__label">{{ shortcut.label }}</span>
                  <span class="shortcut-card__desc">{{ shortcut.description }}</span>
                </div>
              </NuxtLink>
            </div>
          </div>

          <div class="sidebar__section">
            <h3 class="sidebar__title">Recientes</h3>
            <div class="sidebar__recent">
              <NuxtLink
                v-for="post in recentPosts"
                :key="post.id"
                :to="`/cuenta/comunidad/publicacion/${post.id}`"
                class="recent-post"
              >
                <span class="recent-post__reactions">{{ post.reactions }}</span>
                <div class="recent-post__text">
                  <span class="recent-post__title">{{ post.title || post.body.slice(0, 60) + '...' }}</span>
                  <span class="recent-post__meta">{{ post.comments }} comentarios · {{ post.timeAgo }}</span>
                </div>
              </NuxtLink>
            </div>
          </div>
        </aside>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const activeFilter = ref('all')

const filters = [
  { value: 'all', label: 'Todos' },
  { value: 'Gabriel', label: 'Gabriel' },
  { value: 'Carlotta', label: 'Carlotta' },
]

const shortcuts = [
  {
    label: 'Biblioteca',
    description: 'Meditaciones, audios y más',
    to: '/cuenta/biblioteca',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>',
  },
  {
    label: 'Programas',
    description: 'Retos y programas activos',
    to: '/cuenta/retos',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>',
  },
  {
    label: 'Coach IA',
    description: 'Tu coach personal inteligente',
    to: '/cuenta/ia',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><line x1="8" y1="16" x2="8" y2="16"/><line x1="16" y1="16" x2="16" y2="16"/></svg>',
  },
  {
    label: 'Eventos',
    description: 'Próximos eventos en vivo',
    to: '/cuenta/eventos',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  },
  {
    label: 'VIP',
    description: 'Contenido exclusivo premium',
    to: '/cuenta/complementos',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
  },
  {
    label: 'Beneficios',
    description: 'Descuentos y alianzas',
    to: '/cuenta/beneficios',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>',
  },
]

const posts = ref([
  {
    id: 'mock-post-001', author: 'Gabriel', avatar: '/images/gabriel.png',
    title: 'Bienvenidos a la comunidad',
    body: 'Este es un espacio seguro para compartir tu camino de crecimiento. Cuéntanos: ¿qué te motivó a empezar?',
    reactions: 24, comments: 8, liked: false, timeAgo: 'Hace 2 horas',
  },
  {
    id: 'mock-post-002', author: 'Carlotta', avatar: '/images/carlotta.png',
    title: null,
    body: 'Hoy quiero compartir una técnica de respiración que me ha ayudado mucho en momentos de estrés. Inhala 4 segundos, retén 4, exhala 6. Repite 5 veces.',
    reactions: 31, comments: 12, liked: true, timeAgo: 'Hace 4 horas',
  },
  {
    id: 'mock-post-003', author: 'Ambos', avatar: '/images/gabriel.png',
    title: '¿Qué tema quieren para el próximo live?',
    body: 'Estamos planeando el siguiente evento en vivo. ¿Qué les gustaría explorar? Déjenos sus ideas en los comentarios.',
    reactions: 18, comments: 15, liked: false, timeAgo: 'Hace 6 horas',
  },
  {
    id: 'mock-post-004', author: 'Gabriel', avatar: '/images/gabriel.png',
    title: 'Reflexión del día',
    body: 'El crecimiento no es lineal. Algunos días sentirás que retrocedes, pero cada paso cuenta. Confía en el proceso.',
    reactions: 42, comments: 7, liked: false, timeAgo: 'Hace 1 día',
  },
  {
    id: 'mock-post-005', author: 'Carlotta', avatar: '/images/carlotta.png',
    title: null,
    body: 'Nuevo contenido en la biblioteca: "Escaneo corporal para dormir mejor". Ideal para quienes luchan con el insomnio. 🌙',
    reactions: 27, comments: 4, liked: false, timeAgo: 'Hace 2 días',
  },
])

const filteredPosts = computed(() => {
  if (activeFilter.value === 'all') return posts.value
  return posts.value.filter(p => p.author === activeFilter.value)
})

const recentPosts = computed(() => posts.value.slice(0, 4))

function toggleReaction(id: string) {
  const post = posts.value.find(p => p.id === id)
  if (post) {
    post.liked = !post.liked
    post.reactions += post.liked ? 1 : -1
  }
}
</script>

<style scoped>
/* ─── Header (matches retos/library) ─── */
.community__header {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: var(--space-6);
}

.community__header-title {
  font-family: var(--font-eyebrow);
  font-size: 12px;
  text-transform: uppercase;
}

.community__subtitle {
  font-size: var(--text-md);
  color: var(--color-muted);
  margin: 0 0 var(--space-6);
  line-height: var(--leading-normal);
}

/* ─── Desktop wrapper (hidden on mobile) ─── */
.community__desktop-wrapper {
  display: contents;
}

/* ─── Right sidebar (hidden on mobile) ─── */
.community__sidebar {
  display: none;
}

/* ─── Filter pills ─── */
.community__pills {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-5);
}

.community__pill {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-full);
  border: none;
  background: rgba(var(--tint-rgb), 0.06);
  color: var(--color-muted);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: background var(--transition-fast), color var(--transition-fast);
}
.community__pill:not(.community__pill--active):hover { background: rgba(var(--tint-rgb), 0.08); }

.community__pill--active {
  background: var(--color-dark);
  color: var(--color-white);
}

.community__feed {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.post {
  background: rgba(var(--tint-rgb), 0.04);
  color: var(--color-text);
  border-radius: var(--radius-xl);
  padding: var(--space-5);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}

.post__header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}

.post__avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.post__meta { flex: 1; display: flex; flex-direction: column; }

.post__author {
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
}

.post__time {
  font-size: var(--text-xs);
  color: var(--color-muted);
}

.post__title {
  font-family: var(--font-body);
  font-size: var(--text-md);
  font-weight: var(--weight-semibold);
  margin-bottom: var(--space-2);
}

.post__body {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
  line-height: var(--leading-relaxed);
}

.post__actions {
  display: flex;
  gap: var(--space-5);
  margin-top: var(--space-4);
  padding-top: var(--space-3);
  border-top: 1px solid rgba(var(--tint-rgb), 0.05);
}

.post__action {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  background: none;
  border: none;
  cursor: pointer;
  font-size: var(--text-sm);
  color: var(--color-muted);
  text-decoration: none;
}
.post__action:hover { color: var(--color-text-secondary); }

/* ─── Desktop SaaS ─── */
@media (min-width: 1024px) {
  .community__header {
    justify-content: flex-start;
  }

  .community__header-title {
    display: none;
  }

  /* Two-column Reddit-style layout */
  .community__desktop-wrapper {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: var(--space-6);
    align-items: start;
  }

  .community__main {
    min-width: 0;
  }

  /* Feed stays single column on desktop */
  .community__feed {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .post {
    background: var(--color-desktop-card);
    border: 1px solid var(--color-desktop-border);
    border-radius: var(--radius-lg);
    transition: border-color var(--transition-fast);
  }

  .post:hover {
    border-color: var(--color-border);
  }

  .community__pill {
    background: var(--color-desktop-card);
    border: 1px solid var(--color-desktop-border);
  }

  .community__pill--active {
    background: var(--color-dark);
    border-color: var(--color-dark);
    color: var(--color-white);
  }

  .community__pill:not(.community__pill--active):hover {
    background: var(--color-desktop-card);
    border-color: var(--color-border);
  }

  /* ─── Right sidebar ─── */
  .community__sidebar {
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
    position: sticky;
    top: calc(var(--topbar-height) + var(--space-5));
  }

  .sidebar__section {
    background: var(--color-desktop-card);
    border: 1px solid var(--color-desktop-border);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }

  .sidebar__title {
    font-family: var(--font-eyebrow);
    font-size: var(--eyebrow-md);
    font-weight: var(--weight-bold);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--color-muted);
    padding: var(--space-4) var(--space-4) var(--space-2);
    margin: 0;
  }

  /* ─── Shortcut cards ─── */
  .sidebar__cards {
    display: flex;
    flex-direction: column;
  }

  .shortcut-card {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    text-decoration: none;
    color: var(--color-text);
    transition: background var(--transition-fast);
  }

  .shortcut-card:hover {
    background: rgba(var(--tint-rgb), 0.03);
    text-decoration: none;
  }

  .shortcut-card__icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: var(--radius-md);
    background: var(--color-desktop-bg);
    flex-shrink: 0;
    color: var(--color-text-secondary);
  }

  .shortcut-card__icon :deep(svg) {
    width: 16px;
    height: 16px;
  }

  .shortcut-card__text {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .shortcut-card__label {
    font-size: var(--text-sm);
    font-weight: var(--weight-semibold);
    line-height: var(--leading-tight);
  }

  .shortcut-card__desc {
    font-size: var(--text-xs);
    color: var(--color-muted);
    line-height: var(--leading-snug);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* ─── Recent posts ─── */
  .sidebar__recent {
    display: flex;
    flex-direction: column;
  }

  .recent-post {
    display: flex;
    align-items: flex-start;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    text-decoration: none;
    color: var(--color-text);
    transition: background var(--transition-fast);
  }

  .recent-post:hover {
    background: rgba(var(--tint-rgb), 0.03);
    text-decoration: none;
  }

  .recent-post__reactions {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: var(--radius-md);
    background: var(--color-desktop-bg);
    flex-shrink: 0;
    font-size: var(--text-xs);
    font-weight: var(--weight-bold);
    color: var(--color-text-secondary);
  }

  .recent-post__text {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .recent-post__title {
    font-size: var(--text-sm);
    font-weight: var(--weight-medium);
    line-height: var(--leading-snug);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .recent-post__meta {
    font-size: var(--text-xs);
    color: var(--color-muted);
    margin-top: 2px;
  }
}
</style>
