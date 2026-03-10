// ---------------------------------------------------------------------------
// Mock data: benefits, benefit_clicks
// Matches Supabase schema section 6.7 (Benefits — plan-gated URL shares)
// ---------------------------------------------------------------------------

export interface MockBenefit {
  id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  url: string;
  utm_template: string | null;
  code: string | null;
  plan: 'free' | 'core';
  status: 'active' | 'inactive';
  position: number;
  created_at: string;
}

export interface MockBenefitClick {
  id: string;
  benefit_id: string;
  user_id: string | null;
  meta: Record<string, unknown>;
  created_at: string;
}

// ---- Benefits --------------------------------------------------------------
export const mockBenefits: MockBenefit[] = [
  {
    id: 'mock-uuid-benefit-001',
    title: 'Descuento en retiros',
    description:
      '20% de descuento en todos los retiros presenciales organizados por Tu Potencial. Aplica para retiros en México durante 2026. Presenta tu código al momento de la reservación.',
    cover_url: 'https://images.tupotencial.app/benefits/retiros.jpg',
    url: 'https://tupotencial.app/retiros',
    utm_template: 'utm_source=app&utm_medium=benefits&utm_campaign=retiros_2026',
    code: 'RETIRO20',
    plan: 'core',
    status: 'active',
    position: 0,
    created_at: '2026-01-10T10:00:00.000Z',
  },
  {
    id: 'mock-uuid-benefit-002',
    title: 'Acceso a comunidad VIP',
    description:
      'Únete al grupo privado de WhatsApp donde compartimos contenido exclusivo, prácticas extra y la posibilidad de interactuar directamente con Carlotta y Gabriel.',
    cover_url: 'https://images.tupotencial.app/benefits/comunidad-vip.jpg',
    url: 'https://chat.whatsapp.com/placeholder-vip-community',
    utm_template: null,
    code: null,
    plan: 'core',
    status: 'active',
    position: 1,
    created_at: '2026-01-10T10:05:00.000Z',
  },
  {
    id: 'mock-uuid-benefit-003',
    title: '15% en tienda de bienestar',
    description:
      'Descuento exclusivo del 15% en la tienda en línea de nuestro aliado Bienestar MX. Incluye inciensos, cojines de meditación, aceites esenciales y más.',
    cover_url: 'https://images.tupotencial.app/benefits/bienestar-mx.jpg',
    url: 'https://bienestar-mx.example.com/tienda',
    utm_template: 'utm_source=tupotencial&utm_medium=partner&utm_campaign=bienestar_mx',
    code: 'TUPOTENCIAL15',
    plan: 'free',
    status: 'active',
    position: 2,
    created_at: '2026-01-15T08:00:00.000Z',
  },
  {
    id: 'mock-uuid-benefit-004',
    title: 'Clase gratuita de yoga restaurativo',
    description:
      'Accede a una clase presencial gratuita de yoga restaurativo en cualquier sucursal de Yoga Flow CDMX. Válido una vez por miembro. Menciona que eres miembro de Tu Potencial.',
    cover_url: 'https://images.tupotencial.app/benefits/yogaflow.jpg',
    url: 'https://yogaflow.example.com/clase-gratis',
    utm_template: 'utm_source=tupotencial&utm_medium=partner&utm_campaign=yogaflow_free',
    code: 'TPYOGA',
    plan: 'free',
    status: 'active',
    position: 3,
    created_at: '2026-02-01T09:00:00.000Z',
  },
  {
    id: 'mock-uuid-benefit-005',
    title: 'Plantillas de journaling descargables',
    description:
      'Descarga gratis nuestro kit de 12 plantillas de journaling en PDF. Incluye plantillas para gratitud, reflexión semanal, intenciones y más.',
    cover_url: 'https://images.tupotencial.app/benefits/journaling.jpg',
    url: 'https://tupotencial.app/recursos/plantillas-journaling',
    utm_template: 'utm_source=app&utm_medium=benefits&utm_campaign=journaling_templates',
    code: null,
    plan: 'core',
    status: 'active',
    position: 4,
    created_at: '2026-02-10T12:00:00.000Z',
  },
  {
    id: 'mock-uuid-benefit-006',
    title: 'Descuento en sesiones 1:1 con coach',
    description:
      'Próximamente: 30% de descuento en sesiones individuales de coaching con coaches certificados de Tu Potencial.',
    cover_url: null,
    url: 'https://tupotencial.app/coaching',
    utm_template: null,
    code: null,
    plan: 'core',
    status: 'inactive',
    position: 5,
    created_at: '2026-02-20T14:00:00.000Z',
  },
];

// ---- Benefit clicks --------------------------------------------------------
export const mockBenefitClicks: MockBenefitClick[] = [
  {
    id: 'mock-uuid-bclick-001',
    benefit_id: 'mock-uuid-benefit-001',
    user_id: 'mock-uuid-user-001',
    meta: { utm_source: 'app', utm_medium: 'benefits', utm_campaign: 'retiros_2026', platform: 'ios' },
    created_at: '2026-02-15T14:00:00.000Z',
  },
  {
    id: 'mock-uuid-bclick-002',
    benefit_id: 'mock-uuid-benefit-002',
    user_id: 'mock-uuid-user-003',
    meta: { platform: 'android' },
    created_at: '2026-02-18T09:30:00.000Z',
  },
  {
    id: 'mock-uuid-bclick-003',
    benefit_id: 'mock-uuid-benefit-003',
    user_id: 'mock-uuid-user-001',
    meta: { utm_source: 'tupotencial', utm_medium: 'partner', utm_campaign: 'bienestar_mx', platform: 'web' },
    created_at: '2026-02-20T11:00:00.000Z',
  },
  {
    id: 'mock-uuid-bclick-004',
    benefit_id: 'mock-uuid-benefit-005',
    user_id: 'mock-uuid-user-002',
    meta: { utm_source: 'app', utm_medium: 'benefits', utm_campaign: 'journaling_templates', platform: 'ios' },
    created_at: '2026-02-22T16:00:00.000Z',
  },
  {
    id: 'mock-uuid-bclick-005',
    benefit_id: 'mock-uuid-benefit-004',
    user_id: 'mock-uuid-user-005',
    meta: { utm_source: 'tupotencial', utm_medium: 'partner', utm_campaign: 'yogaflow_free', platform: 'android' },
    created_at: '2026-02-23T08:00:00.000Z',
  },
];
