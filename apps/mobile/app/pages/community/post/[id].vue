<template>
  <div class="screen">
    <UiTopNav title="Publicación" show-back @back="navigateTo('/community')" />
    <div class="screen__content">
      <!-- Post -->
      <article class="post-detail">
        <div class="post-detail__header">
          <div class="post-detail__avatar"><span>TP</span></div>
          <div>
            <span class="post-detail__author">Tu Potencial</span>
            <span class="post-detail__time">Hace 2 horas</span>
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
.post-detail {
  background: var(--color-surface);
  color: var(--color-text);
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
  width: 40px; height: 40px; border-radius: 50%; background: var(--color-primary);
  display: flex; align-items: center; justify-content: center;
  color: var(--color-primary-contrast); font-size: var(--text-xs); font-weight: var(--weight-semibold);
}

.post-detail__author { font-weight: var(--weight-semibold); font-size: var(--text-sm); display: block; }
.post-detail__time { font-size: var(--text-xs); color: var(--color-muted); }

.post-detail__title {
  font-family: var(--font-title);
  font-size: var(--title-sm);
  margin-bottom: var(--space-3);
}

.post-detail__body {
  font-size: var(--text-base);
  color: var(--color-text-secondary);
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
  width: 32px; height: 32px; border-radius: 50%; background: var(--color-surface-alt);
  display: flex; align-items: center; justify-content: center;
  font-size: var(--text-xs); font-weight: var(--weight-semibold); color: var(--color-text-secondary);
  flex-shrink: 0;
}

.comment__content { flex: 1; }
.comment__author { font-size: var(--text-sm); font-weight: var(--weight-semibold); }
.comment__body { font-size: var(--text-sm); color: var(--color-text-secondary); margin-top: 2px; line-height: var(--leading-normal); }
.comment__time { font-size: var(--text-xs); color: var(--color-muted); margin-top: 4px; display: block; }

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
