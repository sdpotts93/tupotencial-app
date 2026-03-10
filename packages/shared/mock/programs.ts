// ---------------------------------------------------------------------------
// Mock data: programs, program_days, program_day_items, program_enrollments,
//            program_checkins
// Matches Supabase schema section 6.3 (Programs / Challenges / Bootcamps)
// ---------------------------------------------------------------------------

export interface MockProgram {
  id: string;
  type: 'program' | 'reto' | 'bootcamp';
  title: string;
  description: string | null;
  status: 'draft' | 'published' | 'archived';
  community_segment: 'gabriel' | 'carlotta' | 'conjunta' | null;
  entitlement_key: string | null;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
  created_by: string | null;
  created_at: string;
}

export interface MockProgramDay {
  id: string;
  program_id: string;
  day_index: number;
  title: string | null;
  description: string | null;
}

export interface MockProgramDayItem {
  id: string;
  program_day_id: string;
  content_item_id: string;
  position: number;
}

export interface MockProgramEnrollment {
  id: string;
  program_id: string;
  user_id: string;
  status: 'active' | 'completed' | 'cancelled';
  enrolled_at: string;
}

export interface MockProgramCheckin {
  id: string;
  program_id: string;
  user_id: string;
  day_index: number;
  payload: Record<string, unknown>;
  created_at: string;
}

// ---- Programs --------------------------------------------------------------
export const mockPrograms: MockProgram[] = [
  {
    id: 'mock-uuid-prog-001',
    type: 'reto',
    title: 'Reto 7 días de gratitud',
    description:
      'Durante 7 días consecutivos, cultivarás el hábito de la gratitud con ejercicios prácticos que transformarán tu perspectiva y tu energía.',
    status: 'published',
    community_segment: null,
    entitlement_key: null,
    is_active: true,
    start_date: null,
    end_date: null,
    created_by: 'mock-uuid-user-001',
    created_at: '2026-01-05T10:00:00.000Z',
  },
  {
    id: 'mock-uuid-prog-002',
    type: 'program',
    title: 'Programa de 30 días: Despertar consciente',
    description:
      'Un viaje de 30 días para construir una rutina matutina poderosa. Cada día incluye meditación, movimiento y reflexión guiada.',
    status: 'published',
    community_segment: 'carlotta',
    entitlement_key: null,
    is_active: true,
    start_date: '2026-02-01',
    end_date: '2026-03-02',
    created_by: 'mock-uuid-user-001',
    created_at: '2026-01-20T08:00:00.000Z',
  },
  {
    id: 'mock-uuid-prog-003',
    type: 'bootcamp',
    title: 'Bootcamp: Liderazgo interior',
    description:
      'Un bootcamp intensivo de 14 días para desarrollar tu liderazgo desde adentro. Incluye sesiones en vivo, ejercicios prácticos y comunidad de apoyo.',
    status: 'published',
    community_segment: 'gabriel',
    entitlement_key: 'bootcamp_liderazgo',
    is_active: true,
    start_date: '2026-03-01',
    end_date: '2026-03-14',
    created_by: 'mock-uuid-user-002',
    created_at: '2026-02-10T14:00:00.000Z',
  },
  {
    id: 'mock-uuid-prog-004',
    type: 'reto',
    title: 'Reto 15 días: Desconexión digital',
    description:
      'Recupera tu atención y tu tiempo. Durante 15 días te guiaremos para crear una relación más sana con la tecnología.',
    status: 'published',
    community_segment: 'conjunta',
    entitlement_key: null,
    is_active: true,
    start_date: null,
    end_date: null,
    created_by: 'mock-uuid-user-001',
    created_at: '2026-02-01T09:00:00.000Z',
  },
  {
    id: 'mock-uuid-prog-005',
    type: 'program',
    title: 'Programa de 21 días: Manejo del estrés',
    description:
      'Aprende técnicas comprobadas para gestionar el estrés y convertirlo en tu aliado. Meditaciones, respiraciones y micro-hábitos.',
    status: 'draft',
    community_segment: null,
    entitlement_key: null,
    is_active: false,
    start_date: null,
    end_date: null,
    created_by: 'mock-uuid-user-002',
    created_at: '2026-02-18T11:00:00.000Z',
  },
];

// ---- Program days ----------------------------------------------------------
// Only creating days for the first two programs to keep the mock manageable.

export const mockProgramDays: MockProgramDay[] = [
  // Reto 7 días de gratitud (prog-001) — 7 days
  {
    id: 'mock-uuid-pd-001',
    program_id: 'mock-uuid-prog-001',
    day_index: 1,
    title: 'Día 1: Abre los ojos con gratitud',
    description: 'Antes de levantarte, piensa en 3 cosas por las que estás agradecido/a.',
  },
  {
    id: 'mock-uuid-pd-002',
    program_id: 'mock-uuid-prog-001',
    day_index: 2,
    title: 'Día 2: Carta de agradecimiento',
    description: 'Escribe una breve carta de agradecimiento a alguien importante en tu vida.',
  },
  {
    id: 'mock-uuid-pd-003',
    program_id: 'mock-uuid-prog-001',
    day_index: 3,
    title: 'Día 3: Gratitud por lo difícil',
    description: 'Encuentra algo positivo en una situación reciente que te retó.',
  },
  {
    id: 'mock-uuid-pd-004',
    program_id: 'mock-uuid-prog-001',
    day_index: 4,
    title: 'Día 4: Gratitud sensorial',
    description: 'Agradece algo que puedes ver, oír, tocar, oler y saborear.',
  },
  {
    id: 'mock-uuid-pd-005',
    program_id: 'mock-uuid-prog-001',
    day_index: 5,
    title: 'Día 5: Gratitud hacia ti',
    description: 'Reconoce tres cualidades tuyas que aprecias. Mereces tu propia gratitud.',
  },
  {
    id: 'mock-uuid-pd-006',
    program_id: 'mock-uuid-prog-001',
    day_index: 6,
    title: 'Día 6: Gratitud en movimiento',
    description: 'Durante una caminata de 10 minutos, nombra en silencio cosas que agradeces.',
  },
  {
    id: 'mock-uuid-pd-007',
    program_id: 'mock-uuid-prog-001',
    day_index: 7,
    title: 'Día 7: Ritual de gratitud',
    description: 'Crea tu propio ritual de gratitud que puedas mantener más allá del reto.',
  },

  // Programa de 30 días: Despertar consciente (prog-002) — first 5 days as sample
  {
    id: 'mock-uuid-pd-008',
    program_id: 'mock-uuid-prog-002',
    day_index: 1,
    title: 'Día 1: Tu primer despertar consciente',
    description: 'Hoy estableces la base: respirar, agradecer y moverte con intención.',
  },
  {
    id: 'mock-uuid-pd-009',
    program_id: 'mock-uuid-prog-002',
    day_index: 2,
    title: 'Día 2: Meditación de 5 minutos',
    description: 'Introduce una meditación corta a tu mañana. Solo 5 minutos bastan para empezar.',
  },
  {
    id: 'mock-uuid-pd-010',
    program_id: 'mock-uuid-prog-002',
    day_index: 3,
    title: 'Día 3: Journaling matutino',
    description: 'Escribe 3 intenciones para el día y 1 cosa que quieres soltar.',
  },
  {
    id: 'mock-uuid-pd-011',
    program_id: 'mock-uuid-prog-002',
    day_index: 4,
    title: 'Día 4: Movimiento consciente',
    description: 'Activa tu cuerpo con 5 minutos de estiramientos y respiración.',
  },
  {
    id: 'mock-uuid-pd-012',
    program_id: 'mock-uuid-prog-002',
    day_index: 5,
    title: 'Día 5: Revisión de la semana',
    description: 'Reflexiona sobre los primeros días. ¿Qué has notado diferente?',
  },

  // Bootcamp: Liderazgo interior (prog-003) — first 3 days
  {
    id: 'mock-uuid-pd-013',
    program_id: 'mock-uuid-prog-003',
    day_index: 1,
    title: 'Día 1: ¿Quién eres como líder?',
    description: 'Autoevaluación profunda de tu estilo de liderazgo y tus valores.',
  },
  {
    id: 'mock-uuid-pd-014',
    program_id: 'mock-uuid-prog-003',
    day_index: 2,
    title: 'Día 2: Liderazgo desde la vulnerabilidad',
    description: 'Aprende por qué los líderes más fuertes son los que se atreven a ser vulnerables.',
  },
  {
    id: 'mock-uuid-pd-015',
    program_id: 'mock-uuid-prog-003',
    day_index: 3,
    title: 'Día 3: Comunicación auténtica',
    description: 'Herramientas prácticas para comunicarte con claridad, empatía y poder.',
  },
];

// ---- Program day items (link days to content) ------------------------------
export const mockProgramDayItems: MockProgramDayItem[] = [
  // Reto gratitud - Día 1 links to morning meditation
  { id: 'mock-uuid-pdi-001', program_day_id: 'mock-uuid-pd-001', content_item_id: 'mock-uuid-ci-001', position: 0 },
  { id: 'mock-uuid-pdi-002', program_day_id: 'mock-uuid-pd-001', content_item_id: 'mock-uuid-ci-006', position: 1 },

  // Reto gratitud - Día 2
  { id: 'mock-uuid-pdi-003', program_day_id: 'mock-uuid-pd-002', content_item_id: 'mock-uuid-ci-006', position: 0 },

  // Reto gratitud - Día 6
  { id: 'mock-uuid-pdi-004', program_day_id: 'mock-uuid-pd-006', content_item_id: 'mock-uuid-ci-004', position: 0 },

  // Despertar consciente - Día 1
  { id: 'mock-uuid-pdi-005', program_day_id: 'mock-uuid-pd-008', content_item_id: 'mock-uuid-ci-002', position: 0 },
  { id: 'mock-uuid-pdi-006', program_day_id: 'mock-uuid-pd-008', content_item_id: 'mock-uuid-ci-001', position: 1 },

  // Despertar consciente - Día 2
  { id: 'mock-uuid-pdi-007', program_day_id: 'mock-uuid-pd-009', content_item_id: 'mock-uuid-ci-001', position: 0 },

  // Despertar consciente - Día 3
  { id: 'mock-uuid-pdi-008', program_day_id: 'mock-uuid-pd-010', content_item_id: 'mock-uuid-ci-006', position: 0 },

  // Despertar consciente - Día 4
  { id: 'mock-uuid-pdi-009', program_day_id: 'mock-uuid-pd-011', content_item_id: 'mock-uuid-ci-002', position: 0 },

  // Bootcamp - Día 1
  { id: 'mock-uuid-pdi-010', program_day_id: 'mock-uuid-pd-013', content_item_id: 'mock-uuid-ci-005', position: 0 },
  { id: 'mock-uuid-pdi-011', program_day_id: 'mock-uuid-pd-013', content_item_id: 'mock-uuid-ci-006', position: 1 },

  // Bootcamp - Día 2
  { id: 'mock-uuid-pdi-012', program_day_id: 'mock-uuid-pd-014', content_item_id: 'mock-uuid-ci-008', position: 0 },
];

// ---- Enrollments -----------------------------------------------------------
export const mockProgramEnrollments: MockProgramEnrollment[] = [
  {
    id: 'mock-uuid-enroll-001',
    program_id: 'mock-uuid-prog-001',
    user_id: 'mock-uuid-user-001',
    status: 'active',
    enrolled_at: '2026-02-17T08:00:00.000Z',
  },
  {
    id: 'mock-uuid-enroll-002',
    program_id: 'mock-uuid-prog-002',
    user_id: 'mock-uuid-user-001',
    status: 'active',
    enrolled_at: '2026-02-01T07:00:00.000Z',
  },
  {
    id: 'mock-uuid-enroll-003',
    program_id: 'mock-uuid-prog-001',
    user_id: 'mock-uuid-user-003',
    status: 'completed',
    enrolled_at: '2026-01-10T09:00:00.000Z',
  },
  {
    id: 'mock-uuid-enroll-004',
    program_id: 'mock-uuid-prog-003',
    user_id: 'mock-uuid-user-002',
    status: 'active',
    enrolled_at: '2026-02-15T12:00:00.000Z',
  },
  {
    id: 'mock-uuid-enroll-005',
    program_id: 'mock-uuid-prog-004',
    user_id: 'mock-uuid-user-005',
    status: 'cancelled',
    enrolled_at: '2026-02-05T10:00:00.000Z',
  },
];

// ---- Program check-ins -----------------------------------------------------
export const mockProgramCheckins: MockProgramCheckin[] = [
  {
    id: 'mock-uuid-pcheck-001',
    program_id: 'mock-uuid-prog-001',
    user_id: 'mock-uuid-user-001',
    day_index: 1,
    payload: { gratitude_items: ['Mi familia', 'Un buen café', 'Salud'] },
    created_at: '2026-02-17T08:30:00.000Z',
  },
  {
    id: 'mock-uuid-pcheck-002',
    program_id: 'mock-uuid-prog-001',
    user_id: 'mock-uuid-user-001',
    day_index: 2,
    payload: { letter_written: true, recipient: 'Mi mamá' },
    created_at: '2026-02-18T07:45:00.000Z',
  },
  {
    id: 'mock-uuid-pcheck-003',
    program_id: 'mock-uuid-prog-001',
    user_id: 'mock-uuid-user-001',
    day_index: 3,
    payload: { challenge: 'Discusión en el trabajo', positive_takeaway: 'Aprendí a poner límites' },
    created_at: '2026-02-19T08:10:00.000Z',
  },
  {
    id: 'mock-uuid-pcheck-004',
    program_id: 'mock-uuid-prog-002',
    user_id: 'mock-uuid-user-001',
    day_index: 1,
    payload: { completed_meditation: true, completed_movement: true, reflection: 'Me sentí en paz' },
    created_at: '2026-02-01T07:30:00.000Z',
  },
  {
    id: 'mock-uuid-pcheck-005',
    program_id: 'mock-uuid-prog-002',
    user_id: 'mock-uuid-user-001',
    day_index: 2,
    payload: { completed_meditation: true, duration_minutes: 5 },
    created_at: '2026-02-02T07:20:00.000Z',
  },
];
