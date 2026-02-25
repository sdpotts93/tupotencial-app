// ---------------------------------------------------------------------------
// Mock data: addons, addon_entitlements, user_entitlements
// Matches Supabase schema section 6.8 (Add-ons / VIP — entitlements)
// ---------------------------------------------------------------------------

export interface MockAddon {
  id: string;
  title: string;
  description: string | null;
  stripe_price_id: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface MockAddonEntitlement {
  id: string;
  addon_id: string;
  entitlement_key: string;
}

export interface MockUserEntitlement {
  id: string;
  user_id: string;
  entitlement_key: string;
  source: 'subscription' | 'addon' | 'admin';
  source_ref: string | null;
  created_at: string;
}

// ---- Add-ons ---------------------------------------------------------------
export const mockAddons: MockAddon[] = [
  {
    id: 'mock-uuid-addon-001',
    title: 'Mentoría grupal mensual',
    description:
      'Sesión grupal de mentoría de 90 minutos una vez al mes con Carlotta o Gabriel. Máximo 15 participantes por sesión. Incluye ejercicios prácticos, espacio para preguntas y plan de acción personalizado.',
    stripe_price_id: 'price_mock_mentoria_grupal',
    status: 'active',
    created_at: '2026-01-01T10:00:00.000Z',
  },
  {
    id: 'mock-uuid-addon-002',
    title: 'Acceso VIP: Contenido exclusivo',
    description:
      'Desbloquea contenido premium que no está disponible en la membresía Core. Incluye masterclasses extendidas, meditaciones avanzadas y material bonus de los programas.',
    stripe_price_id: 'price_mock_vip_content',
    status: 'active',
    created_at: '2026-01-01T10:05:00.000Z',
  },
  {
    id: 'mock-uuid-addon-003',
    title: 'Bootcamp: Liderazgo Interior (acceso completo)',
    description:
      'Acceso completo al bootcamp intensivo de 14 días. Incluye sesiones en vivo, materiales exclusivos, acceso al grupo privado del bootcamp y certificado de participación.',
    stripe_price_id: 'price_mock_bootcamp_liderazgo',
    status: 'active',
    created_at: '2026-02-01T08:00:00.000Z',
  },
  {
    id: 'mock-uuid-addon-004',
    title: 'Sesión 1:1 con coach certificado',
    description:
      'Una sesión individual de 60 minutos con un coach certificado de Tu Potencial. Personalizada a tus necesidades y objetivos.',
    stripe_price_id: 'price_mock_coaching_1on1',
    status: 'active',
    created_at: '2026-02-10T09:00:00.000Z',
  },
  {
    id: 'mock-uuid-addon-005',
    title: 'Retiro presencial: Reconexión (marzo 2026)',
    description:
      'Retiro de fin de semana en Valle de Bravo. Incluye hospedaje, alimentación, sesiones de meditación, yoga y dinámicas de grupo con Carlotta y Gabriel.',
    stripe_price_id: 'price_mock_retiro_marzo',
    status: 'inactive',
    created_at: '2026-02-15T12:00:00.000Z',
  },
];

// ---- Addon entitlements (which keys each addon grants) ---------------------
export const mockAddonEntitlements: MockAddonEntitlement[] = [
  { id: 'mock-uuid-ae-001', addon_id: 'mock-uuid-addon-001', entitlement_key: 'mentoria_grupal' },
  { id: 'mock-uuid-ae-002', addon_id: 'mock-uuid-addon-002', entitlement_key: 'vip' },
  { id: 'mock-uuid-ae-003', addon_id: 'mock-uuid-addon-003', entitlement_key: 'bootcamp_liderazgo' },
  { id: 'mock-uuid-ae-004', addon_id: 'mock-uuid-addon-004', entitlement_key: 'coaching_1on1' },
  { id: 'mock-uuid-ae-005', addon_id: 'mock-uuid-addon-005', entitlement_key: 'retiro_marzo_2026' },
];

// ---- User entitlements (what the current users have) -----------------------
export const mockUserEntitlements: MockUserEntitlement[] = [
  // Mariana (user-001): Core subscriber + VIP + Mentoring
  {
    id: 'mock-uuid-ue-001',
    user_id: 'mock-uuid-user-001',
    entitlement_key: 'core',
    source: 'subscription',
    source_ref: 'sub_mock_mariana_001',
    created_at: '2025-11-10T08:05:00.000Z',
  },
  {
    id: 'mock-uuid-ue-002',
    user_id: 'mock-uuid-user-001',
    entitlement_key: 'vip',
    source: 'addon',
    source_ref: 'pi_mock_mariana_vip',
    created_at: '2026-01-15T10:00:00.000Z',
  },
  {
    id: 'mock-uuid-ue-003',
    user_id: 'mock-uuid-user-001',
    entitlement_key: 'mentoria_grupal',
    source: 'addon',
    source_ref: 'pi_mock_mariana_mentoria',
    created_at: '2026-02-01T09:00:00.000Z',
  },

  // Diego (user-002): Core subscriber
  {
    id: 'mock-uuid-ue-004',
    user_id: 'mock-uuid-user-002',
    entitlement_key: 'core',
    source: 'subscription',
    source_ref: 'sub_mock_diego_001',
    created_at: '2025-12-01T14:35:00.000Z',
  },

  // Sofia (user-003): Core subscriber + Bootcamp
  {
    id: 'mock-uuid-ue-005',
    user_id: 'mock-uuid-user-003',
    entitlement_key: 'core',
    source: 'subscription',
    source_ref: 'sub_mock_sofia_001',
    created_at: '2026-01-05T09:20:00.000Z',
  },
  {
    id: 'mock-uuid-ue-006',
    user_id: 'mock-uuid-user-003',
    entitlement_key: 'bootcamp_liderazgo',
    source: 'addon',
    source_ref: 'pi_mock_sofia_bootcamp',
    created_at: '2026-02-20T11:00:00.000Z',
  },

  // Carlos (user-004): Free tier only (no entitlements beyond base)

  // Valentina (user-005): Core subscriber + admin-granted coaching
  {
    id: 'mock-uuid-ue-007',
    user_id: 'mock-uuid-user-005',
    entitlement_key: 'core',
    source: 'subscription',
    source_ref: 'sub_mock_valentina_001',
    created_at: '2026-02-01T07:05:00.000Z',
  },
  {
    id: 'mock-uuid-ue-008',
    user_id: 'mock-uuid-user-005',
    entitlement_key: 'coaching_1on1',
    source: 'admin',
    source_ref: 'Cortesía — prueba interna',
    created_at: '2026-02-15T10:00:00.000Z',
  },
];
