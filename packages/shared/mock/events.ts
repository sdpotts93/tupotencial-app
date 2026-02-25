// ---------------------------------------------------------------------------
// Mock data: events
// Matches Supabase schema section 6.6 (Events / Lives — Vimeo + gating)
// ---------------------------------------------------------------------------

export interface MockEvent {
  id: string;
  title: string;
  description: string | null;
  start_at: string;
  end_at: string | null;
  community_segment: 'gabriel' | 'carlotta' | 'conjunta' | null;
  requires_subscription: boolean;
  vimeo_url: string | null;
  vimeo_id: string | null;
  status: 'draft' | 'published' | 'hidden';
  created_at: string;
}

// ---- Events ----------------------------------------------------------------
export const mockEvents: MockEvent[] = [
  // --- Upcoming events ---
  {
    id: 'mock-uuid-event-001',
    title: 'Live semanal: Meditación guiada con Carlotta',
    description:
      'Únete cada miércoles a una meditación guiada en vivo con Carlotta. Este espacio es para pausar, respirar y reconectarte con tu centro. Abierto a toda la comunidad.',
    start_at: '2026-02-25T18:00:00.000Z',
    end_at: '2026-02-25T19:00:00.000Z',
    community_segment: null,
    requires_subscription: true,
    vimeo_url: 'https://vimeo.com/event/placeholder-001',
    vimeo_id: 'placeholder-001',
    status: 'published',
    created_at: '2026-02-18T10:00:00.000Z',
  },
  {
    id: 'mock-uuid-event-002',
    title: 'Taller especial: Manejo de estrés en el trabajo',
    description:
      'Un taller práctico de 90 minutos donde aprenderás técnicas para gestionar el estrés laboral, establecer límites saludables y mantener tu energía a lo largo del día. Incluye ejercicios de respiración, meditación rápida y herramientas de journaling.',
    start_at: '2026-03-01T17:00:00.000Z',
    end_at: '2026-03-01T18:30:00.000Z',
    community_segment: 'gabriel',
    requires_subscription: true,
    vimeo_url: 'https://vimeo.com/event/placeholder-002',
    vimeo_id: 'placeholder-002',
    status: 'published',
    created_at: '2026-02-20T09:00:00.000Z',
  },
  {
    id: 'mock-uuid-event-003',
    title: 'Sesión Q&A: Pregúntale a Carlotta y Gabriel',
    description:
      'Una sesión abierta de preguntas y respuestas con Carlotta y Gabriel. Trae tus dudas sobre las prácticas, los programas, o cualquier tema de bienestar y crecimiento personal. Espacio íntimo, máximo 50 personas.',
    start_at: '2026-03-05T19:00:00.000Z',
    end_at: '2026-03-05T20:00:00.000Z',
    community_segment: null,
    requires_subscription: true,
    vimeo_url: 'https://vimeo.com/event/placeholder-003',
    vimeo_id: 'placeholder-003',
    status: 'published',
    created_at: '2026-02-22T14:00:00.000Z',
  },
  {
    id: 'mock-uuid-event-004',
    title: 'Masterclass: Liderazgo consciente (Bootcamp preview)',
    description:
      'Una muestra del Bootcamp de Liderazgo Interior. En esta masterclass de 60 minutos, Gabriel comparte los fundamentos del liderazgo consciente y por qué la vulnerabilidad es tu mayor fortaleza como líder.',
    start_at: '2026-03-10T18:00:00.000Z',
    end_at: '2026-03-10T19:00:00.000Z',
    community_segment: 'gabriel',
    requires_subscription: false,
    vimeo_url: null,
    vimeo_id: null,
    status: 'draft',
    created_at: '2026-02-24T08:00:00.000Z',
  },

  // --- Past events ---
  {
    id: 'mock-uuid-event-005',
    title: 'Live semanal: Meditación guiada con Carlotta',
    description:
      'Sesión pasada de la meditación semanal guiada. Disponible para ver en replay.',
    start_at: '2026-02-18T18:00:00.000Z',
    end_at: '2026-02-18T19:00:00.000Z',
    community_segment: null,
    requires_subscription: true,
    vimeo_url: 'https://vimeo.com/event/placeholder-005',
    vimeo_id: 'placeholder-005',
    status: 'published',
    created_at: '2026-02-11T10:00:00.000Z',
  },
  {
    id: 'mock-uuid-event-006',
    title: 'Círculo de mujeres: Soltar para avanzar',
    description:
      'Un espacio seguro y sagrado para la comunidad Carlotta. En este círculo hablamos de lo que necesitamos soltar para seguir creciendo. Replay disponible por tiempo limitado.',
    start_at: '2026-02-12T19:00:00.000Z',
    end_at: '2026-02-12T20:30:00.000Z',
    community_segment: 'carlotta',
    requires_subscription: true,
    vimeo_url: 'https://vimeo.com/event/placeholder-006',
    vimeo_id: 'placeholder-006',
    status: 'published',
    created_at: '2026-02-05T11:00:00.000Z',
  },
  {
    id: 'mock-uuid-event-007',
    title: 'Taller: Introducción al journaling consciente',
    description:
      'Un taller práctico donde aprendiste las bases del journaling como herramienta de autoconocimiento. Incluye plantillas descargables.',
    start_at: '2026-02-08T17:00:00.000Z',
    end_at: '2026-02-08T18:30:00.000Z',
    community_segment: null,
    requires_subscription: true,
    vimeo_url: 'https://vimeo.com/event/placeholder-007',
    vimeo_id: 'placeholder-007',
    status: 'published',
    created_at: '2026-02-01T09:00:00.000Z',
  },
];
