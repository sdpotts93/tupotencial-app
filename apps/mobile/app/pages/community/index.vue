<template>
  <div class="screen">
    <div class="screen__content">
      <header class="community__header">
        <h1 class="community__header-title">Comunidad</h1>
      </header>

      <p class="community__subtitle">El espacio donde compartir avances, sostener el proceso y crecer con otros que viven con intención.</p>

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
        <article v-for="post in filteredPosts" :key="post.id" class="post">
          <div class="post__header">
            <img :src="post.avatar" alt="" class="post__avatar" />
            <div class="post__meta">
              <span class="post__author">{{ post.author }}</span>
              <span class="post__time">{{ post.timeAgo }}</span>
            </div>
          </div>

          <NuxtLink :to="`/community/post/${post.id}`" class="post__body-link">
            <h3 v-if="post.title" class="post__title">{{ post.title }}</h3>
            <p class="post__body">{{ post.body }}</p>
          </NuxtLink>

          <div class="post__actions">
            <button class="post__action" @click="toggleReaction(post.id)">
              <svg width="18" height="18" viewBox="0 0 24 24" :fill="post.liked ? 'var(--color-danger)' : 'none'" :stroke="post.liked ? 'var(--color-danger)' : 'currentColor'" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
              <span>{{ post.reactions }}</span>
            </button>
            <NuxtLink :to="`/community/post/${post.id}`" class="post__action">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              <span>{{ post.comments }}</span>
            </NuxtLink>
          </div>
        </article>
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
  color: rgba(255, 255, 255, 0.5);
  margin: 0 0 var(--space-6);
  line-height: var(--leading-normal);
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
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.6);
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: var(--weight-medium);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: background var(--transition-fast), color var(--transition-fast);
}
.community__pill:not(.community__pill--active):hover { background: rgba(255, 255, 255, 0.15); }

.community__pill--active {
  background: white;
  color: var(--color-dark);
}

.community__feed {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.post {
  background: rgba(255, 255, 255, 0.08);
  color: white;
  border-radius: var(--radius-xl);
  padding: var(--space-5);
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
  color: rgba(255, 255, 255, 0.5);
}

.post__body-link { text-decoration: none; color: inherit; }
.post__body-link:hover { text-decoration: none; }

.post__title {
  font-family: var(--font-body);
  font-size: var(--text-md);
  font-weight: var(--weight-semibold);
  margin-bottom: var(--space-2);
}

.post__body {
  font-size: var(--text-base);
  color: rgba(255, 255, 255, 0.7);
  line-height: var(--leading-relaxed);
}

.post__actions {
  display: flex;
  gap: var(--space-5);
  margin-top: var(--space-4);
  padding-top: var(--space-3);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.post__action {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  background: none;
  border: none;
  cursor: pointer;
  font-size: var(--text-sm);
  color: rgba(255, 255, 255, 0.6);
  text-decoration: none;
}
.post__action:hover { color: rgba(255, 255, 255, 0.8); }
</style>
