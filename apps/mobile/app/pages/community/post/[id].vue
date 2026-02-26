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
        <div class="post-detail__stats">
          <button class="post-detail__like" @click="toggleLike">
            <svg class="icon-t" width="16" height="16" viewBox="0 0 24 24" :fill="post.liked ? 'var(--color-danger)' : 'none'" :stroke="post.liked ? 'var(--color-danger)' : 'currentColor'" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
            {{ post.reactions }}
          </button>
        </div>
      </article>

      <!-- Comments -->
      <section class="post-detail__comments">
        <p class="eyebrow">COMENTARIOS ({{ comments.length }})</p>
        <div class="post-detail__comment-list">
          <div v-for="comment in comments" :key="comment.id" class="comment">
            <div class="comment__avatar"><span>{{ comment.initials }}</span></div>
            <div class="comment__content">
              <div class="comment__top">
                <span class="comment__author">{{ comment.author }}</span>
                <span class="comment__dot">&middot;</span>
                <span class="comment__time">{{ comment.timeAgo }}</span>
              </div>
              <p class="comment__body">{{ comment.body }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>

    <!-- Fixed input bar -->
    <div class="post-detail__add safe-bottom">
      <div class="post-detail__add-inner">
        <input
          v-model="newComment"
          class="post-detail__input"
          placeholder="Escribe un comentario..."
        />
        <button class="post-detail__send" :disabled="!newComment.trim()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
        </button>
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
  reactions: 24,
  liked: false,
})

function toggleLike() {
  post.value.liked = !post.value.liked
  post.value.reactions += post.value.liked ? 1 : -1
}

const comments = ref([
  { id: 'c1', author: 'Ana López', initials: 'AL', body: '¡Me encanta esta iniciativa! Llevo una semana y ya siento la diferencia.', timeAgo: 'Hace 1 hora' },
  { id: 'c2', author: 'Carlos Ruiz', initials: 'CR', body: 'Empecé porque quería mejorar mi rutina matutina. Ahora no puedo vivir sin mi check-in diario.', timeAgo: 'Hace 45 min' },
  { id: 'c3', author: 'María Torres', initials: 'MT', body: 'Gracias por crear este espacio. Se siente bien saber que no estoy sola en este camino.', timeAgo: 'Hace 30 min' },
  { id: 'c4', author: 'Diego Herrera', initials: 'DH', body: 'Lo que me motivó fue sentir que necesitaba un cambio real, no solo de hábitos sino de mentalidad.', timeAgo: 'Hace 20 min' },
])

const newComment = ref('')
</script>

<style scoped>
.screen__content { padding-bottom: 80px; }

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
.pdetail__back:hover { background: rgba(0, 0, 0, 0.06); }

.post-detail {
  background: rgba(0, 0, 0, 0.04);
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
  width: 40px; height: 40px; border-radius: 50%; object-fit: cover; flex-shrink: 0;
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

.post-detail__stats {
  display: flex;
  gap: var(--space-4);
  margin-top: var(--space-4);
  padding-top: var(--space-3);
  border-top: 1px solid rgba(0, 0, 0, 0.04);
}

.post-detail__like {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-sm);
  color: var(--color-muted);
  background: none;
  border: none;
  cursor: pointer;
  font-family: var(--font-body);
  -webkit-tap-highlight-color: transparent;
}
.post-detail__like:hover { color: var(--color-text-secondary); }

.post-detail__comments > .eyebrow { margin-bottom: var(--space-4); }

.post-detail__comment-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding-bottom: var(--space-6);
}

/* ─── Comment (Reddit-style) ─── */
.comment {
  display: flex;
  gap: var(--space-3);
  padding: var(--space-3) 0;
}

.comment__avatar {
  width: 28px; height: 28px; border-radius: 50%; background: rgba(0, 0, 0, 0.06);
  display: flex; align-items: center; justify-content: center;
  font-size: 10px; font-weight: var(--weight-semibold); color: var(--color-muted);
  flex-shrink: 0;
}

.comment__content { flex: 1; min-width: 0; }

.comment__top {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  margin-bottom: 2px;
}

.comment__author { font-size: var(--text-xs); font-weight: var(--weight-semibold); color: var(--color-text); }
.comment__dot { font-size: var(--text-xs); color: var(--color-muted); }
.comment__time { font-size: var(--text-xs); color: var(--color-muted); }

.comment__body {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  line-height: var(--leading-normal);
}

/* ─── Fixed input bar ─── */
.post-detail__add {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: var(--z-sticky, 10);
  background: var(--color-surface-alt);
  border-top: 1px solid rgba(0, 0, 0, 0.04);
  padding: var(--space-3) var(--space-5);
}

.post-detail__add-inner {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.post-detail__input {
  flex: 1;
  background: rgba(0, 0, 0, 0.04);
  border: none;
  border-radius: var(--radius-full);
  padding: var(--space-3) var(--space-4);
  font-size: var(--text-md);
  font-family: var(--font-body);
  color: var(--color-text);
  outline: none;
}
.post-detail__input::placeholder { color: var(--color-muted); }
.post-detail__input:focus { background: rgba(0, 0, 0, 0.06); }

.post-detail__send {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: none;
  border-radius: 50%;
  color: var(--color-dark);
  cursor: pointer;
  flex-shrink: 0;
  -webkit-tap-highlight-color: transparent;
}
.post-detail__send:disabled {
  opacity: 0.3;
  cursor: default;
}
</style>
