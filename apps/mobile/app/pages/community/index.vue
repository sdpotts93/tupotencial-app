<template>
  <div class="screen">
    <div class="screen__content">
      <h1 class="title title--lg">Comunidad</h1>
      <p class="community__subtitle">El espacio donde compartir avances, sostener el proceso y crecer con otros que viven con intención.</p>

      <!-- Community feed (inspired by inspiration-community) -->
      <div class="community__feed">
        <article v-for="post in posts" :key="post.id" class="post">
          <div class="post__header">
            <div class="post__avatar">
              <span>{{ post.authorInitials }}</span>
            </div>
            <div class="post__meta">
              <span class="post__author">{{ post.author }}</span>
              <span class="post__time">{{ post.timeAgo }}</span>
            </div>
            <UiTag v-if="post.isOfficial" variant="primary" size="sm">Oficial</UiTag>
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
            <button class="post__action">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
            </button>
          </div>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const posts = ref([
  {
    id: 'mock-post-001', author: 'Tu Potencial', authorInitials: 'TP', isOfficial: true,
    title: 'Bienvenidos a la comunidad',
    body: 'Este es un espacio seguro para compartir tu camino de crecimiento. Cuéntanos: ¿qué te motivó a empezar?',
    reactions: 24, comments: 8, liked: false, timeAgo: 'Hace 2 horas',
  },
  {
    id: 'mock-post-002', author: 'Ana López', authorInitials: 'AL', isOfficial: false,
    title: null,
    body: 'Hoy completé mi día 7 del reto de gratitud. No puedo creer la diferencia que hace tomarse 5 minutos para agradecer cada mañana. ¡Lo recomiendo mucho!',
    reactions: 15, comments: 3, liked: true, timeAgo: 'Hace 4 horas',
  },
  {
    id: 'mock-post-003', author: 'Carlos Ruiz', authorInitials: 'CR', isOfficial: false,
    title: '¿Alguien más haciendo el programa de 30 días?',
    body: 'Voy en el día 12 de "Despertar consciente" y me encantaría saber si alguien más lo está haciendo para compartir experiencias.',
    reactions: 9, comments: 5, liked: false, timeAgo: 'Hace 6 horas',
  },
])

function toggleReaction(id: string) {
  const post = posts.value.find(p => p.id === id)
  if (post) {
    post.liked = !post.liked
    post.reactions += post.liked ? 1 : -1
  }
}
</script>

<style scoped>
.community__subtitle {
  font-size: var(--text-sm);
  color: var(--color-muted);
  margin: var(--space-2) 0 var(--space-6);
}

.community__feed {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.post {
  background: #ffffff21;
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
  background: var(--color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary-contrast);
  font-size: var(--text-xs);
  font-weight: var(--weight-semibold);
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
