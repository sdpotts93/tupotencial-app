<template>
  <div class="screen">
    <div class="screen__content">
      <header class="pdetail__header">
        <button class="pdetail__back" aria-label="Volver" @click="$router.back()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <h1 class="pdetail__header-title">Publicación</h1>
      </header>

      <!-- Post -->
      <article class="post-detail">
        <div class="post-detail__header">
          <img :src="post.avatar" alt="" class="post-detail__avatar" />
          <div>
            <span class="post-detail__author">{{ post.author }}</span>
            <span class="post-detail__time">{{ post.timeAgo }}</span>
          </div>
        </div>
        <h1 v-if="post.title" class="post-detail__title">{{ post.title }}</h1>
        <p class="post-detail__body">{{ post.body }}</p>
      </article>

      <!-- Comments -->
      <section class="post-detail__comments">
        <p class="eyebrow">COMENTARIOS ({{ comments.length }})</p>
        <div class="post-detail__comment-list">
          <div v-for="comment in comments" :key="comment.id" class="comment">
            <div class="comment__avatar"><span>{{ comment.initials }}</span></div>
            <div class="comment__content">
              <span class="comment__author">{{ comment.author }}</span>
              <p class="comment__body">{{ comment.body }}</p>
              <span class="comment__time">{{ comment.timeAgo }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- Add comment -->
      <div class="post-detail__add">
        <UiInput v-model="newComment" placeholder="Escribe un comentario..." />
        <UiButton size="sm" :disabled="!newComment.trim()">Enviar</UiButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'blank' })

const post = ref({
  author: 'Gabriel',
  avatar: '/images/gabriel.png',
  timeAgo: 'Hace 2 horas',
  title: 'Bienvenidos a la comunidad',
  body: 'Este es un espacio seguro para compartir tu camino de crecimiento. Cuéntanos: ¿qué te motivó a empezar?',
})

const comments = ref([
  { id: 'c1', author: 'Ana López', initials: 'AL', body: '¡Me encanta esta iniciativa! Llevo una semana y ya siento la diferencia.', timeAgo: 'Hace 1 hora' },
  { id: 'c2', author: 'Carlos Ruiz', initials: 'CR', body: 'Empecé porque quería mejorar mi rutina matutina. Ahora no puedo vivir sin mi check-in diario.', timeAgo: 'Hace 45 min' },
])

const newComment = ref('')
</script>

<style scoped>
/* ─── Header (matches retos/library) ─── */
.pdetail__header {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: var(--space-6);
}

.pdetail__header-title {
  font-family: var(--font-eyebrow);
  font-size: 12px;
  text-transform: uppercase;
}

.pdetail__back {
  position: absolute;
  left: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--color-text-inverse);
  cursor: pointer;
  border-radius: var(--radius-md);
  -webkit-tap-highlight-color: transparent;
}
.pdetail__back:hover { background: rgba(255, 255, 255, 0.1); }

.post-detail {
  background: rgba(255, 255, 255, 0.08);
  color: white;
  border-radius: var(--radius-xl);
  padding: var(--space-5);
  margin-bottom: var(--space-6);
}

.post-detail__header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.post-detail__avatar {
  width: 40px; height: 40px; border-radius: 50%; object-fit: cover; flex-shrink: 0;
}

.post-detail__author { font-weight: var(--weight-semibold); font-size: var(--text-sm); display: block; }
.post-detail__time { font-size: var(--text-xs); color: rgba(255, 255, 255, 0.5); }

.post-detail__title {
  font-family: var(--font-title);
  font-size: var(--title-sm);
  margin-bottom: var(--space-3);
}

.post-detail__body {
  font-size: var(--text-base);
  color: rgba(255, 255, 255, 0.7);
  line-height: var(--leading-relaxed);
}

.post-detail__comments > .eyebrow { margin-bottom: var(--space-4); }

.post-detail__comment-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.comment {
  display: flex;
  gap: var(--space-3);
}

.comment__avatar {
  width: 32px; height: 32px; border-radius: 50%; background: rgba(255, 255, 255, 0.15);
  display: flex; align-items: center; justify-content: center;
  font-size: var(--text-xs); font-weight: var(--weight-semibold); color: rgba(255, 255, 255, 0.7);
  flex-shrink: 0;
}

.comment__content { flex: 1; }
.comment__author { font-size: var(--text-sm); font-weight: var(--weight-semibold); }
.comment__body { font-size: var(--text-sm); color: rgba(255, 255, 255, 0.7); margin-top: 2px; line-height: var(--leading-normal); }
.comment__time { font-size: var(--text-xs); color: rgba(255, 255, 255, 0.5); margin-top: 4px; display: block; }

.post-detail__add {
  display: flex;
  gap: var(--space-3);
  align-items: flex-end;
  position: sticky;
  bottom: calc(var(--bottom-nav-height) + var(--space-3));
  padding: var(--space-3) 0;
  background: var(--color-bg);
}
</style>
