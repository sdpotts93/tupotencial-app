// ---------------------------------------------------------------------------
// Mock data: content_categories, content_items, content_item_categories
// Matches Supabase schema section 6.2 (Content library)
// ---------------------------------------------------------------------------

export interface MockContentCategory {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  status: 'active' | 'hidden';
  position: number;
}

export interface MockContentItem {
  id: string;
  type: 'video' | 'text' | 'link' | 'audio';
  title: string;
  subtitle: string | null;
  description: string | null;
  body: string | null;
  media_url: string | null;
  external_url: string | null;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  status: 'draft' | 'scheduled' | 'published' | 'archived';
  published_at: string | null;
  available_from: string | null;
  available_to: string | null;
  community_segment: 'gabriel' | 'carlotta' | 'conjunta' | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
}

export interface MockContentItemCategory {
  id: string;
  content_item_id: string;
  category_id: string;
  position: number;
}

// ---- Categories ------------------------------------------------------------
export const mockContentCategories: MockContentCategory[] = [
  {
    id: 'mock-uuid-cat-001',
    title: 'Meditaciones',
    slug: 'meditaciones',
    description: 'Meditaciones guiadas para encontrar tu centro y cultivar la calma interior.',
    status: 'active',
    position: 0,
  },
  {
    id: 'mock-uuid-cat-002',
    title: 'Rutinas de mañana',
    slug: 'rutinas-de-manana',
    description: 'Comienza cada día con intención. Rutinas diseñadas para activar cuerpo y mente.',
    status: 'active',
    position: 1,
  },
  {
    id: 'mock-uuid-cat-003',
    title: 'Mindfulness',
    slug: 'mindfulness',
    description: 'Prácticas de atención plena para vivir el presente con mayor consciencia.',
    status: 'active',
    position: 2,
  },
  {
    id: 'mock-uuid-cat-004',
    title: 'Crecimiento personal',
    slug: 'crecimiento-personal',
    description: 'Herramientas y reflexiones para tu desarrollo integral como ser humano.',
    status: 'active',
    position: 3,
  },
  {
    id: 'mock-uuid-cat-005',
    title: 'Respiración',
    slug: 'respiracion',
    description: 'Técnicas de respiración consciente para regular tu energía y emociones.',
    status: 'active',
    position: 4,
  },
  {
    id: 'mock-uuid-cat-006',
    title: 'Journaling',
    slug: 'journaling',
    description: 'Ejercicios de escritura reflexiva para conocerte mejor.',
    status: 'hidden',
    position: 5,
  },
];

// ---- Content items ---------------------------------------------------------
export const mockContentItems: MockContentItem[] = [
  // --- Videos ---
  {
    id: 'mock-uuid-ci-001',
    type: 'video',
    title: 'Meditación matutina: Gratitud y presencia',
    subtitle: '10 minutos para empezar tu día con claridad',
    description:
      'Una meditación guiada que te ayudará a conectar con la gratitud y establecer una intención positiva para el día.',
    body: null,
    media_url: 'https://player.vimeo.com/video/000000001',
    external_url: null,
    thumbnail_url: 'https://picsum.photos/seed/meditation1/640/360',
    duration_seconds: 600,
    status: 'published',
    published_at: '2026-01-15T06:00:00.000Z',
    available_from: null,
    available_to: null,
    community_segment: null,
    created_by: 'mock-uuid-user-001',
    updated_by: null,
    created_at: '2026-01-14T20:00:00.000Z',
  },
  {
    id: 'mock-uuid-ci-002',
    type: 'video',
    title: 'Rutina energizante de 5 minutos',
    subtitle: 'Activa tu cuerpo sin salir de casa',
    description:
      'Movimientos suaves y conscientes para despertar tu cuerpo y prepararte para un día productivo.',
    body: null,
    media_url: 'https://player.vimeo.com/video/000000002',
    external_url: null,
    thumbnail_url: 'https://picsum.photos/seed/routine1/640/360',
    duration_seconds: 300,
    status: 'published',
    published_at: '2026-01-20T06:00:00.000Z',
    available_from: null,
    available_to: null,
    community_segment: 'carlotta',
    created_by: 'mock-uuid-user-001',
    updated_by: null,
    created_at: '2026-01-19T18:00:00.000Z',
  },
  {
    id: 'mock-uuid-ci-003',
    type: 'video',
    title: 'Respiración 4-7-8 para calmar la ansiedad',
    subtitle: 'Técnica guiada paso a paso',
    description:
      'Aprende la técnica de respiración 4-7-8 para reducir el estrés y encontrar calma en momentos difíciles.',
    body: null,
    media_url: 'https://player.vimeo.com/video/000000003',
    external_url: null,
    thumbnail_url: 'https://picsum.photos/seed/breathing1/640/360',
    duration_seconds: 480,
    status: 'published',
    published_at: '2026-02-01T06:00:00.000Z',
    available_from: null,
    available_to: null,
    community_segment: 'gabriel',
    created_by: 'mock-uuid-user-002',
    updated_by: null,
    created_at: '2026-01-31T22:00:00.000Z',
  },

  // --- Audio ---
  {
    id: 'mock-uuid-ci-004',
    type: 'audio',
    title: 'Meditación nocturna: Soltar el día',
    subtitle: 'Relajación profunda antes de dormir',
    description:
      'Deja ir las tensiones del día con esta meditación guiada diseñada para ayudarte a descansar mejor.',
    body: null,
    media_url: 'https://cdn.example.com/audio/meditacion-nocturna.mp3',
    external_url: null,
    thumbnail_url: 'https://picsum.photos/seed/night-med/640/360',
    duration_seconds: 900,
    status: 'published',
    published_at: '2026-02-05T06:00:00.000Z',
    available_from: null,
    available_to: null,
    community_segment: null,
    created_by: 'mock-uuid-user-001',
    updated_by: null,
    created_at: '2026-02-04T15:00:00.000Z',
  },
  {
    id: 'mock-uuid-ci-005',
    type: 'audio',
    title: 'Visualización guiada: Tu mejor versión',
    subtitle: '15 minutos de transformación interna',
    description:
      'Cierra los ojos y déjate guiar hacia una imagen vívida de la persona en la que te estás convirtiendo.',
    body: null,
    media_url: 'https://cdn.example.com/audio/visualizacion-mejor-version.mp3',
    external_url: null,
    thumbnail_url: 'https://picsum.photos/seed/visualize/640/360',
    duration_seconds: 900,
    status: 'published',
    published_at: '2026-02-10T06:00:00.000Z',
    available_from: null,
    available_to: null,
    community_segment: 'conjunta',
    created_by: 'mock-uuid-user-002',
    updated_by: null,
    created_at: '2026-02-09T20:00:00.000Z',
  },

  // --- Text ---
  {
    id: 'mock-uuid-ci-006',
    type: 'text',
    title: 'Las 5 preguntas que transforman tu mañana',
    subtitle: 'Un ejercicio de journaling para empezar con intención',
    description:
      'Descubre cómo cinco preguntas simples pueden cambiar la dirección de tu día y de tu vida.',
    body: `# Las 5 preguntas que transforman tu mañana

Cada mañana es una oportunidad de reinicio. Antes de revisar tu teléfono, antes de pensar en la lista de pendientes, regálate cinco minutos con estas preguntas:

## 1. ¿Qué es lo que más agradezco hoy?
Empieza con gratitud. No tiene que ser algo grande: el café caliente, la luz que entra por la ventana, una persona que te importa.

## 2. ¿Cuál es mi intención para hoy?
No un objetivo, no una meta. Una intención: ¿cómo quieres *ser* hoy? Presente, paciente, valiente, amable...

## 3. ¿Qué puedo soltar?
¿Hay algo del día anterior que sigues cargando? Dale permiso de irse.

## 4. ¿Qué acción pequeña me acerca a mi mejor versión?
Solo una. Concreta. Alcanzable hoy.

## 5. ¿Cómo quiero sentirme al final del día?
Visualiza ese momento. Deja que esa imagen guíe tus decisiones.

---

*Escribe tus respuestas en un cuaderno. La magia está en la consistencia.*`,
    media_url: null,
    external_url: null,
    thumbnail_url: 'https://picsum.photos/seed/journaling1/640/360',
    duration_seconds: null,
    status: 'published',
    published_at: '2026-02-12T06:00:00.000Z',
    available_from: null,
    available_to: null,
    community_segment: null,
    created_by: 'mock-uuid-user-001',
    updated_by: 'mock-uuid-user-002',
    created_at: '2026-02-11T16:00:00.000Z',
  },
  {
    id: 'mock-uuid-ci-007',
    type: 'text',
    title: 'Guía rápida: Cómo crear un espacio sagrado en casa',
    subtitle: 'Tu rincón de paz no necesita ser perfecto',
    description:
      'Aprende a diseñar un espacio físico que invite a la calma, la reflexión y la práctica diaria.',
    body: `# Cómo crear un espacio sagrado en casa

No necesitas una habitación entera. Un rincón, una esquina, incluso un cojín en el suelo puede ser suficiente.

## Lo esencial
- **Un lugar fijo**: tu cerebro asociará ese espacio con la práctica.
- **Mínimas distracciones**: lejos del televisor y del escritorio de trabajo.
- **Algo que te inspire**: una vela, una planta, una foto, un objeto que tenga significado para ti.

## Opcional pero recomendado
- Un cojín o tapete cómodo.
- Audífonos si hay ruido.
- Un cuaderno y pluma para journaling.

## El ritual de entrada
Cada vez que te sientes en tu espacio, haz tres respiraciones profundas antes de comenzar cualquier práctica. Eso le dice a tu sistema nervioso: *aquí estoy seguro, aquí me cuido*.

---

*Tu espacio no tiene que ser perfecto. Solo tiene que ser tuyo.*`,
    media_url: null,
    external_url: null,
    thumbnail_url: 'https://picsum.photos/seed/sacred-space/640/360',
    duration_seconds: null,
    status: 'published',
    published_at: '2026-02-14T06:00:00.000Z',
    available_from: null,
    available_to: null,
    community_segment: 'carlotta',
    created_by: 'mock-uuid-user-001',
    updated_by: null,
    created_at: '2026-02-13T12:00:00.000Z',
  },

  // --- Draft / Scheduled items ---
  {
    id: 'mock-uuid-ci-008',
    type: 'video',
    title: 'Masterclass: Inteligencia emocional en la vida diaria',
    subtitle: 'Con Gabriel — Sesión especial',
    description:
      'Una clase profunda sobre cómo reconocer, entender y gestionar tus emociones en el día a día.',
    body: null,
    media_url: 'https://player.vimeo.com/video/000000008',
    external_url: null,
    thumbnail_url: 'https://picsum.photos/seed/masterclass1/640/360',
    duration_seconds: 2700,
    status: 'draft',
    published_at: null,
    available_from: null,
    available_to: null,
    community_segment: 'gabriel',
    created_by: 'mock-uuid-user-002',
    updated_by: null,
    created_at: '2026-02-20T10:00:00.000Z',
  },
  {
    id: 'mock-uuid-ci-009',
    type: 'audio',
    title: 'Body scan: Reconecta con tu cuerpo',
    subtitle: 'Escaneo corporal guiado de 20 minutos',
    description:
      'Recorre cada parte de tu cuerpo con atención plena. Ideal para liberar tensión acumulada.',
    body: null,
    media_url: 'https://cdn.example.com/audio/body-scan.mp3',
    external_url: null,
    thumbnail_url: 'https://picsum.photos/seed/bodyscan/640/360',
    duration_seconds: 1200,
    status: 'scheduled',
    published_at: '2026-03-01T06:00:00.000Z',
    available_from: '2026-03-01T06:00:00.000Z',
    available_to: null,
    community_segment: null,
    created_by: 'mock-uuid-user-001',
    updated_by: null,
    created_at: '2026-02-22T09:00:00.000Z',
  },
  {
    id: 'mock-uuid-ci-010',
    type: 'link',
    title: 'Artículo: La ciencia detrás de los hábitos',
    subtitle: 'Lectura recomendada externa',
    description:
      'Un artículo fascinante sobre cómo se forman los hábitos y cómo puedes diseñar los tuyos de forma consciente.',
    body: null,
    media_url: null,
    external_url: 'https://example.com/articulo-habitos',
    thumbnail_url: 'https://picsum.photos/seed/habits-article/640/360',
    duration_seconds: null,
    status: 'published',
    published_at: '2026-02-18T06:00:00.000Z',
    available_from: null,
    available_to: null,
    community_segment: null,
    created_by: 'mock-uuid-user-002',
    updated_by: null,
    created_at: '2026-02-17T14:00:00.000Z',
  },
];

// ---- Content-item <-> category mapping -------------------------------------
export const mockContentItemCategories: MockContentItemCategory[] = [
  // Meditaciones
  { id: 'mock-uuid-cic-001', content_item_id: 'mock-uuid-ci-001', category_id: 'mock-uuid-cat-001', position: 0 },
  { id: 'mock-uuid-cic-002', content_item_id: 'mock-uuid-ci-004', category_id: 'mock-uuid-cat-001', position: 1 },
  { id: 'mock-uuid-cic-003', content_item_id: 'mock-uuid-ci-005', category_id: 'mock-uuid-cat-001', position: 2 },
  { id: 'mock-uuid-cic-004', content_item_id: 'mock-uuid-ci-009', category_id: 'mock-uuid-cat-001', position: 3 },

  // Rutinas de mañana
  { id: 'mock-uuid-cic-005', content_item_id: 'mock-uuid-ci-002', category_id: 'mock-uuid-cat-002', position: 0 },
  { id: 'mock-uuid-cic-006', content_item_id: 'mock-uuid-ci-006', category_id: 'mock-uuid-cat-002', position: 1 },

  // Mindfulness
  { id: 'mock-uuid-cic-007', content_item_id: 'mock-uuid-ci-001', category_id: 'mock-uuid-cat-003', position: 0 },
  { id: 'mock-uuid-cic-008', content_item_id: 'mock-uuid-ci-003', category_id: 'mock-uuid-cat-003', position: 1 },
  { id: 'mock-uuid-cic-009', content_item_id: 'mock-uuid-ci-009', category_id: 'mock-uuid-cat-003', position: 2 },

  // Crecimiento personal
  { id: 'mock-uuid-cic-010', content_item_id: 'mock-uuid-ci-006', category_id: 'mock-uuid-cat-004', position: 0 },
  { id: 'mock-uuid-cic-011', content_item_id: 'mock-uuid-ci-007', category_id: 'mock-uuid-cat-004', position: 1 },
  { id: 'mock-uuid-cic-012', content_item_id: 'mock-uuid-ci-008', category_id: 'mock-uuid-cat-004', position: 2 },
  { id: 'mock-uuid-cic-013', content_item_id: 'mock-uuid-ci-010', category_id: 'mock-uuid-cat-004', position: 3 },

  // Respiración
  { id: 'mock-uuid-cic-014', content_item_id: 'mock-uuid-ci-003', category_id: 'mock-uuid-cat-005', position: 0 },
];
