// ---------------------------------------------------------------------------
// Mock data: posts, post_comments, post_reactions
// Matches Supabase schema section 6.5 (Community — feed/comments/reactions)
// ---------------------------------------------------------------------------

export interface MockPost {
  id: string;
  author_user_id: string | null;
  is_official: boolean;
  community_segment: 'gabriel' | 'carlotta' | 'conjunta' | null;
  title: string | null;
  body: string;
  media_url: string | null;
  status: 'draft' | 'published' | 'hidden';
  created_at: string;
}

export interface MockPostComment {
  id: string;
  post_id: string;
  user_id: string;
  body: string;
  status: 'published' | 'hidden';
  created_at: string;
}

export interface MockPostReaction {
  id: string;
  post_id: string;
  user_id: string;
  reaction: 'like' | 'fire' | 'clap' | 'heart';
  created_at: string;
}

// ---- Posts -----------------------------------------------------------------
export const mockPosts: MockPost[] = [
  {
    id: 'mock-uuid-post-001',
    author_user_id: null,
    is_official: true,
    community_segment: null,
    title: 'Bienvenidos a la comunidad Tu Potencial',
    body: 'Este es un espacio seguro para crecer juntos. Comparte tus experiencias, aprendizajes y reflexiones. Recuerda: todos estamos en un camino de transformación. No hay respuestas correctas ni incorrectas, solo honestidad y apoyo mutuo.\n\n¡Nos da mucho gusto tenerte aquí!',
    media_url: null,
    status: 'published',
    created_at: '2026-01-01T12:00:00.000Z',
  },
  {
    id: 'mock-uuid-post-002',
    author_user_id: 'mock-uuid-user-003',
    is_official: false,
    community_segment: 'conjunta',
    title: null,
    body: 'Llevo 5 días seguidos haciendo mi check-in matutino y no puedo creer la diferencia. Me siento más centrada y con más energía para enfrentar el día. ¿A alguien más le ha pasado que al principio cuesta pero luego se vuelve algo que necesitas?',
    media_url: null,
    status: 'published',
    created_at: '2026-02-20T14:30:00.000Z',
  },
  {
    id: 'mock-uuid-post-003',
    author_user_id: 'mock-uuid-user-002',
    is_official: false,
    community_segment: 'gabriel',
    title: 'Mi experiencia con la respiración 4-7-8',
    body: 'Acabo de terminar el ejercicio de respiración 4-7-8 y quiero compartir algo: la primera vez que lo intenté me pareció raro, como que no "sentía" nada. Pero hoy, en la tercera vez, algo hizo clic. Sentí cómo mi cuerpo se relajó de verdad por primera vez en semanas. Si estás empezando y no sientes mucho, dale tiempo. Vale la pena.',
    media_url: null,
    status: 'published',
    created_at: '2026-02-21T09:15:00.000Z',
  },
  {
    id: 'mock-uuid-post-004',
    author_user_id: null,
    is_official: true,
    community_segment: 'carlotta',
    title: 'Nuevo reto: 7 días de gratitud',
    body: '¡Comunidad Carlotta! Estamos lanzando el Reto de 7 días de gratitud. Cada día recibirás un ejercicio diferente para cultivar el agradecimiento en tu vida. Es gratuito, es corto, y puede cambiar tu perspectiva.\n\nInscríbete desde la sección de Retos. ¡Empezamos el lunes!',
    media_url: 'https://picsum.photos/seed/gratitude-challenge/800/400',
    status: 'published',
    created_at: '2026-02-22T08:00:00.000Z',
  },
  {
    id: 'mock-uuid-post-005',
    author_user_id: 'mock-uuid-user-005',
    is_official: false,
    community_segment: 'carlotta',
    title: null,
    body: 'Hoy creé mi espacio sagrado en casa siguiendo la guía de la biblioteca. Solo un rincón con un cojín, una vela y mi cuaderno. Pero se siente diferente. Es MÍO. Ya quiero hacer mi práctica de mañana ahí.',
    media_url: 'https://picsum.photos/seed/sacred-space-photo/800/600',
    status: 'published',
    created_at: '2026-02-23T16:45:00.000Z',
  },
  {
    id: 'mock-uuid-post-006',
    author_user_id: 'mock-uuid-user-004',
    is_official: false,
    community_segment: null,
    title: 'Pregunta para la comunidad',
    body: '¿Alguien más siente que le cuesta mantener la constancia? Empiezo muy motivado pero a la semana ya se me olvidó. ¿Qué trucos les han funcionado para no perder el hábito?',
    media_url: null,
    status: 'published',
    created_at: '2026-02-24T10:00:00.000Z',
  },
  {
    id: 'mock-uuid-post-007',
    author_user_id: 'mock-uuid-user-001',
    is_official: false,
    community_segment: null,
    title: null,
    body: 'Hoy descubrí que la meditación nocturna también funciona increíble por la mañana. Soltar antes de empezar el día es una sensación diferente pero muy poderosa. ¿Alguien más ha experimentado con cambiar el horario de las prácticas?',
    media_url: null,
    status: 'draft',
    created_at: '2026-02-24T07:00:00.000Z',
  },
];

// ---- Comments --------------------------------------------------------------
export const mockPostComments: MockPostComment[] = [
  {
    id: 'mock-uuid-comment-001',
    post_id: 'mock-uuid-post-002',
    user_id: 'mock-uuid-user-001',
    body: '¡Qué increíble, Sofía! A mí me pasó exactamente lo mismo. Los primeros 3 días fueron difíciles pero ahora es lo primero que hago al despertar. ¡Sigue así!',
    status: 'published',
    created_at: '2026-02-20T15:00:00.000Z',
  },
  {
    id: 'mock-uuid-comment-002',
    post_id: 'mock-uuid-post-002',
    user_id: 'mock-uuid-user-005',
    body: 'Yo apenas llevo 2 días pero leer esto me motiva mucho. Gracias por compartir.',
    status: 'published',
    created_at: '2026-02-20T16:30:00.000Z',
  },
  {
    id: 'mock-uuid-comment-003',
    post_id: 'mock-uuid-post-003',
    user_id: 'mock-uuid-user-004',
    body: 'Totalmente de acuerdo. La primera vez pensé "esto no es para mí" pero después de una semana ya no puedo dejar de hacerlo. La clave es la paciencia.',
    status: 'published',
    created_at: '2026-02-21T10:00:00.000Z',
  },
  {
    id: 'mock-uuid-comment-004',
    post_id: 'mock-uuid-post-005',
    user_id: 'mock-uuid-user-001',
    body: '¡Se ve hermoso! Yo también seguí esa guía y me encanta mi rincón. El truco de las 3 respiraciones antes de empezar es clave.',
    status: 'published',
    created_at: '2026-02-23T17:15:00.000Z',
  },
  {
    id: 'mock-uuid-comment-005',
    post_id: 'mock-uuid-post-006',
    user_id: 'mock-uuid-user-003',
    body: 'A mí lo que me funciona es asociar el hábito con algo que ya hago. Por ejemplo: medito justo después de lavarme los dientes. Así mi cerebro ya lo tiene como parte de la rutina.',
    status: 'published',
    created_at: '2026-02-24T10:30:00.000Z',
  },
  {
    id: 'mock-uuid-comment-006',
    post_id: 'mock-uuid-post-006',
    user_id: 'mock-uuid-user-002',
    body: 'Las rachas ayudan mucho. Cuando ves que llevas 5 días seguidos, no quieres romperla. También el apoyo de esta comunidad hace la diferencia.',
    status: 'published',
    created_at: '2026-02-24T11:15:00.000Z',
  },
  {
    id: 'mock-uuid-comment-007',
    post_id: 'mock-uuid-post-006',
    user_id: 'mock-uuid-user-005',
    body: 'Yo pongo alarma y lo hago aunque sea 2 minutos. La clave no es la duración sino la constancia. ¡Ánimo, Carlos!',
    status: 'published',
    created_at: '2026-02-24T12:00:00.000Z',
  },
];

// ---- Reactions -------------------------------------------------------------
export const mockPostReactions: MockPostReaction[] = [
  // Post 001 - Welcome (lots of love)
  { id: 'mock-uuid-react-001', post_id: 'mock-uuid-post-001', user_id: 'mock-uuid-user-001', reaction: 'heart', created_at: '2026-01-01T12:30:00.000Z' },
  { id: 'mock-uuid-react-002', post_id: 'mock-uuid-post-001', user_id: 'mock-uuid-user-002', reaction: 'heart', created_at: '2026-01-01T13:00:00.000Z' },
  { id: 'mock-uuid-react-003', post_id: 'mock-uuid-post-001', user_id: 'mock-uuid-user-003', reaction: 'clap', created_at: '2026-01-05T09:20:00.000Z' },
  { id: 'mock-uuid-react-004', post_id: 'mock-uuid-post-001', user_id: 'mock-uuid-user-004', reaction: 'like', created_at: '2026-01-20T12:00:00.000Z' },
  { id: 'mock-uuid-react-005', post_id: 'mock-uuid-post-001', user_id: 'mock-uuid-user-005', reaction: 'heart', created_at: '2026-02-01T07:05:00.000Z' },

  // Post 002 - Sofia's streak
  { id: 'mock-uuid-react-006', post_id: 'mock-uuid-post-002', user_id: 'mock-uuid-user-001', reaction: 'fire', created_at: '2026-02-20T14:45:00.000Z' },
  { id: 'mock-uuid-react-007', post_id: 'mock-uuid-post-002', user_id: 'mock-uuid-user-002', reaction: 'clap', created_at: '2026-02-20T15:30:00.000Z' },
  { id: 'mock-uuid-react-008', post_id: 'mock-uuid-post-002', user_id: 'mock-uuid-user-005', reaction: 'heart', created_at: '2026-02-20T16:35:00.000Z' },

  // Post 003 - Diego's breathing experience
  { id: 'mock-uuid-react-009', post_id: 'mock-uuid-post-003', user_id: 'mock-uuid-user-001', reaction: 'like', created_at: '2026-02-21T09:30:00.000Z' },
  { id: 'mock-uuid-react-010', post_id: 'mock-uuid-post-003', user_id: 'mock-uuid-user-004', reaction: 'fire', created_at: '2026-02-21T10:05:00.000Z' },

  // Post 004 - Gratitude challenge
  { id: 'mock-uuid-react-011', post_id: 'mock-uuid-post-004', user_id: 'mock-uuid-user-005', reaction: 'fire', created_at: '2026-02-22T08:30:00.000Z' },
  { id: 'mock-uuid-react-012', post_id: 'mock-uuid-post-004', user_id: 'mock-uuid-user-001', reaction: 'clap', created_at: '2026-02-22T09:00:00.000Z' },
  { id: 'mock-uuid-react-013', post_id: 'mock-uuid-post-004', user_id: 'mock-uuid-user-003', reaction: 'heart', created_at: '2026-02-22T10:00:00.000Z' },

  // Post 005 - Sacred space
  { id: 'mock-uuid-react-014', post_id: 'mock-uuid-post-005', user_id: 'mock-uuid-user-001', reaction: 'heart', created_at: '2026-02-23T17:00:00.000Z' },
  { id: 'mock-uuid-react-015', post_id: 'mock-uuid-post-005', user_id: 'mock-uuid-user-003', reaction: 'fire', created_at: '2026-02-23T18:00:00.000Z' },
  { id: 'mock-uuid-react-016', post_id: 'mock-uuid-post-005', user_id: 'mock-uuid-user-002', reaction: 'like', created_at: '2026-02-23T19:00:00.000Z' },

  // Post 006 - Carlos's question
  { id: 'mock-uuid-react-017', post_id: 'mock-uuid-post-006', user_id: 'mock-uuid-user-001', reaction: 'heart', created_at: '2026-02-24T10:10:00.000Z' },
  { id: 'mock-uuid-react-018', post_id: 'mock-uuid-post-006', user_id: 'mock-uuid-user-003', reaction: 'like', created_at: '2026-02-24T10:35:00.000Z' },
];
