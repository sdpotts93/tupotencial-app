// ---------------------------------------------------------------------------
// Mock data: daily_plans, daily_checkins, user_streaks
// Matches Supabase schema section 6.4 ("Today" — daily experience)
// ---------------------------------------------------------------------------

export interface MockDailyPlan {
  id: string;
  date: string;
  community_segment: 'gabriel' | 'carlotta' | 'conjunta' | null;
  title: string | null;
  message: string | null;
  primary_action_type: 'content' | 'program_day' | 'custom' | 'ai_prompt';
  primary_action_ref: string | null;
  primary_action_payload: Record<string, unknown>;
  badge_share_text: string | null;
  status: 'scheduled' | 'published' | 'archived';
  created_by: string | null;
}

export interface MockDailyCheckin {
  id: string;
  date: string;
  user_id: string;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface MockUserStreak {
  user_id: string;
  current_streak: number;
  best_streak: number;
  last_checkin_date: string | null;
  updated_at: string;
}

// ---- Daily plans -----------------------------------------------------------
// Today = 2026-02-24, plus a few past dates

export const mockDailyPlans: MockDailyPlan[] = [
  // --- Today (2026-02-24) ---
  {
    id: 'mock-uuid-dp-001',
    date: '2026-02-24',
    community_segment: null, // global
    title: 'Tu momento de hoy',
    message:
      'Buenos días. Hoy te invitamos a pausar, respirar y reconectarte contigo. Completa la meditación matutina y registra tu check-in.',
    primary_action_type: 'content',
    primary_action_ref: 'mock-uuid-ci-001', // Meditación matutina: Gratitud y presencia
    primary_action_payload: {},
    badge_share_text: 'Hoy pause, respire y me reconecte conmigo. #TuPotencial',
    status: 'published',
    created_by: 'mock-uuid-user-001',
  },
  {
    id: 'mock-uuid-dp-002',
    date: '2026-02-24',
    community_segment: 'carlotta',
    title: 'Carlotta: Despertar con intención',
    message:
      'Hola, comunidad Carlotta. Hoy tu reto es dedicar 5 minutos a la rutina energizante antes de revisar tu teléfono. ¿Te atreves?',
    primary_action_type: 'content',
    primary_action_ref: 'mock-uuid-ci-002', // Rutina energizante de 5 minutos
    primary_action_payload: {},
    badge_share_text: 'Hoy desperte con intencion y energia. #Carlotta #TuPotencial',
    status: 'published',
    created_by: 'mock-uuid-user-001',
  },
  {
    id: 'mock-uuid-dp-003',
    date: '2026-02-24',
    community_segment: 'gabriel',
    title: 'Gabriel: Respira y lidera',
    message:
      'Comunidad Gabriel, el liderazgo empieza por dentro. Hoy practica la respiración 4-7-8 antes de tu primera junta o actividad importante.',
    primary_action_type: 'content',
    primary_action_ref: 'mock-uuid-ci-003', // Respiración 4-7-8
    primary_action_payload: {},
    badge_share_text: 'Hoy respire con intencion antes de liderar. #Gabriel #TuPotencial',
    status: 'published',
    created_by: 'mock-uuid-user-002',
  },

  // --- Yesterday (2026-02-23) ---
  {
    id: 'mock-uuid-dp-004',
    date: '2026-02-23',
    community_segment: null,
    title: 'Domingo de reflexión',
    message:
      'Es domingo. Un buen día para hacer una pausa más larga. Te dejamos un ejercicio de journaling para cerrar la semana con claridad.',
    primary_action_type: 'content',
    primary_action_ref: 'mock-uuid-ci-006', // Las 5 preguntas
    primary_action_payload: {},
    badge_share_text: null,
    status: 'published',
    created_by: 'mock-uuid-user-001',
  },

  // --- 2 days ago (2026-02-22) ---
  {
    id: 'mock-uuid-dp-005',
    date: '2026-02-22',
    community_segment: null,
    title: 'Sábado de visualización',
    message:
      'Cierra los ojos por 15 minutos y visualiza tu mejor versión. ¿Cómo se ve? ¿Qué siente? ¿Qué hace diferente?',
    primary_action_type: 'content',
    primary_action_ref: 'mock-uuid-ci-005', // Visualización guiada
    primary_action_payload: {},
    badge_share_text: 'Hoy visualice mi mejor version. #TuPotencial',
    status: 'published',
    created_by: 'mock-uuid-user-001',
  },

  // --- 3 days ago (2026-02-21) --- with custom action
  {
    id: 'mock-uuid-dp-006',
    date: '2026-02-21',
    community_segment: null,
    title: 'Viernes: Micro-hábito del día',
    message:
      'Hoy tu único reto es: en algún momento del día, detente por 60 segundos y observa tu respiración sin cambiarla. Solo observa.',
    primary_action_type: 'custom',
    primary_action_ref: null,
    primary_action_payload: {
      label: 'Observar mi respiración por 60 segundos',
      type: 'simple_check',
      prompt: '¿Completaste tu momento de observación hoy?',
    },
    badge_share_text: 'Hoy observe mi respiracion por 60 segundos. Pequeños momentos, grandes cambios. #TuPotencial',
    status: 'published',
    created_by: 'mock-uuid-user-002',
  },

  // --- Scheduled for tomorrow (draft) ---
  {
    id: 'mock-uuid-dp-007',
    date: '2026-02-25',
    community_segment: null,
    title: 'Martes: Nuevo comienzo',
    message:
      'Cada día es una nueva oportunidad. Hoy comienza con la meditación nocturna... pero por la mañana. Experimenta cómo se siente soltar antes de empezar.',
    primary_action_type: 'content',
    primary_action_ref: 'mock-uuid-ci-004', // Meditación nocturna (used as morning experiment)
    primary_action_payload: {},
    badge_share_text: null,
    status: 'scheduled',
    created_by: 'mock-uuid-user-001',
  },
];

// ---- Daily check-ins -------------------------------------------------------
export const mockDailyCheckins: MockDailyCheckin[] = [
  // Current user check-ins (past few days)
  {
    id: 'mock-uuid-dc-001',
    date: '2026-02-21',
    user_id: 'mock-uuid-user-001',
    payload: {
      completed: true,
      reflection: 'Lo hice durante mi descanso del trabajo. Me di cuenta de que estaba conteniendo la respiración.',
    },
    created_at: '2026-02-21T15:30:00.000Z',
  },
  {
    id: 'mock-uuid-dc-002',
    date: '2026-02-22',
    user_id: 'mock-uuid-user-001',
    payload: {
      completed: true,
      reflection: 'Me vi siendo más paciente con mi familia. Esa es mi mejor versión.',
    },
    created_at: '2026-02-22T08:15:00.000Z',
  },
  {
    id: 'mock-uuid-dc-003',
    date: '2026-02-23',
    user_id: 'mock-uuid-user-001',
    payload: {
      completed: true,
      journal_entries: [
        'Agradezco este tiempo para mí.',
        'Quiero soltar la necesidad de control.',
        'Hoy quiero ser más amable conmigo.',
      ],
    },
    created_at: '2026-02-23T09:00:00.000Z',
  },

  // Other users
  {
    id: 'mock-uuid-dc-004',
    date: '2026-02-23',
    user_id: 'mock-uuid-user-002',
    payload: { completed: true, mood: 'tranquilo' },
    created_at: '2026-02-23T10:30:00.000Z',
  },
  {
    id: 'mock-uuid-dc-005',
    date: '2026-02-24',
    user_id: 'mock-uuid-user-003',
    payload: { completed: true, reflection: 'La meditación me ayudó a centrarme antes del día.' },
    created_at: '2026-02-24T07:45:00.000Z',
  },
];

// ---- User streaks ----------------------------------------------------------
export const mockUserStreaks: MockUserStreak[] = [
  {
    user_id: 'mock-uuid-user-001',
    current_streak: 3,
    best_streak: 12,
    last_checkin_date: '2026-02-23',
    updated_at: '2026-02-23T09:00:00.000Z',
  },
  {
    user_id: 'mock-uuid-user-002',
    current_streak: 1,
    best_streak: 7,
    last_checkin_date: '2026-02-23',
    updated_at: '2026-02-23T10:30:00.000Z',
  },
  {
    user_id: 'mock-uuid-user-003',
    current_streak: 5,
    best_streak: 5,
    last_checkin_date: '2026-02-24',
    updated_at: '2026-02-24T07:45:00.000Z',
  },
  {
    user_id: 'mock-uuid-user-004',
    current_streak: 0,
    best_streak: 3,
    last_checkin_date: '2026-02-10',
    updated_at: '2026-02-10T08:00:00.000Z',
  },
  {
    user_id: 'mock-uuid-user-005',
    current_streak: 0,
    best_streak: 0,
    last_checkin_date: null,
    updated_at: '2026-02-01T07:00:00.000Z',
  },
];
