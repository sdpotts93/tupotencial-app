// ---------------------------------------------------------------------------
// Mock data: addons & addon_purchases
// Matches simplified addons schema (one-time Stripe purchases)
// ---------------------------------------------------------------------------

export interface MockAddon {
  id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  price: number; // cents MXN
  plan: 'todos' | 'core';
  grants_core_months: number | null;
  stripe_price_id: string | null;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface MockAddonPurchase {
  id: string;
  addon_id: string;
  user_id: string;
  stripe_session_id: string | null;
  amount: number;
  created_at: string;
}

// ---- Add-ons ---------------------------------------------------------------
export const mockAddons: MockAddon[] = [
  {
    id: 'mock-uuid-addon-001',
    title: 'Mentoría grupal mensual',
    description:
      'Sesión grupal de mentoría de 90 minutos una vez al mes con Carlotta o Gabriel. Máximo 15 participantes por sesión.',
    cover_url: '/images/lib-4.jpg',
    price: 149900,
    plan: 'core',
    grants_core_months: null,
    stripe_price_id: null,
    status: 'active',
    created_at: '2026-01-01T10:00:00.000Z',
  },
  {
    id: 'mock-uuid-addon-002',
    title: 'Módulo VIP: Liderazgo avanzado',
    description:
      '12 lecciones exclusivas de liderazgo avanzado + material descargable y ejercicios prácticos.',
    cover_url: '/images/lib-8.jpg',
    price: 79900,
    plan: 'core',
    grants_core_months: null,
    stripe_price_id: null,
    status: 'active',
    created_at: '2026-01-01T10:05:00.000Z',
  },
  {
    id: 'mock-uuid-addon-003',
    title: 'Bootcamp: Liderazgo Interior',
    description:
      'Acceso completo al bootcamp intensivo de 14 días. Incluye sesiones en vivo, materiales exclusivos y certificado.',
    cover_url: '/images/lib-6.jpg',
    price: 299900,
    plan: 'todos',
    grants_core_months: 3,
    stripe_price_id: null,
    status: 'active',
    created_at: '2026-02-01T08:00:00.000Z',
  },
  {
    id: 'mock-uuid-addon-004',
    title: 'Sesión 1:1 con coach certificado',
    description:
      'Una sesión individual de 60 minutos con un coach certificado de Tu Potencial. Personalizada a tus necesidades.',
    cover_url: '/images/lib-3.jpg',
    price: 249900,
    plan: 'todos',
    grants_core_months: 1,
    stripe_price_id: null,
    status: 'active',
    created_at: '2026-02-10T09:00:00.000Z',
  },
  {
    id: 'mock-uuid-addon-005',
    title: 'Retiro presencial: Reconexión (marzo 2026)',
    description:
      'Retiro de fin de semana en Valle de Bravo. Incluye hospedaje, alimentación, sesiones de meditación y yoga.',
    cover_url: '/images/lib-5.jpg',
    price: 899900,
    plan: 'todos',
    grants_core_months: 3,
    stripe_price_id: null,
    status: 'inactive',
    created_at: '2026-02-15T12:00:00.000Z',
  },
];

// ---- Addon purchases -------------------------------------------------------
export const mockAddonPurchases: MockAddonPurchase[] = [
  {
    id: 'mock-uuid-ap-001',
    addon_id: 'mock-uuid-addon-002',
    user_id: 'mock-uuid-user-001',
    stripe_session_id: null,
    amount: 79900,
    created_at: '2026-01-15T10:00:00.000Z',
  },
  {
    id: 'mock-uuid-ap-002',
    addon_id: 'mock-uuid-addon-003',
    user_id: 'mock-uuid-user-003',
    stripe_session_id: null,
    amount: 299900,
    created_at: '2026-02-20T11:00:00.000Z',
  },
  {
    id: 'mock-uuid-ap-003',
    addon_id: 'mock-uuid-addon-001',
    user_id: 'mock-uuid-user-001',
    stripe_session_id: null,
    amount: 149900,
    created_at: '2026-02-25T14:30:00.000Z',
  },
];
