# Plan de Monetización — TuPotencial

**Fecha:** 30 de marzo de 2026
**Estado:** Pendiente de decisión del cliente
**Precio actual:** $399 MXN/mes (Stripe web)

---

## Contexto

TuPotencial es una app de wellness/coaching con suscripción digital. El contenido (videos, audio, artículos, AI coach, comunidad) se consume dentro de la app. Esto clasifica como **contenido digital consumido in-app**, lo que obliga a usar IAP en iOS y Play Billing en Android.

La app tiene un **free tier funcional** (canal diario, contenido limitado), lo que fortalece el modelo.

---

## Recomendación: Solo RevenueCat (nativo + web)

```
App nativa (iOS/Android) → RevenueCat SDK → IAP / Play Billing → Suscripción
Web → RevenueCat Web SDK → Stripe (como procesador) → Suscripción
Webhook único → RevenueCat → Supabase user_entitlements
```

### ¿Por qué solo RevenueCat y no RevenueCat + Stripe por separado?

RevenueCat tiene un **Web SDK** (`@revenuecat/purchases-js`) que usa Stripe como procesador por debajo. Esto significa:

- **1 solo sistema** para manejar suscripciones (nativo + web)
- **1 solo webhook** hacia Supabase
- **1 solo dashboard** para ver todas las suscripciones
- **Entitlements unificados automáticamente** — sin reconciliación manual
- Aún necesitas una cuenta de Stripe, pero solo como procesador — RevenueCat maneja toda la lógica

| | Solo RevenueCat (recomendado) | RevenueCat + Stripe separado |
|---|---|---|
| Webhooks | 1 | 2 |
| Dashboards | 1 | 2 |
| Código de integración | Menor | Mayor |
| Entitlements | Unificados automáticamente | Tú los unificas |
| Cuenta Stripe | Sí (como procesador) | Sí (directamente) |

### Comisiones

| Canal | Comisión | Ingreso neto (sobre $399 MXN) |
|-------|----------|-------------------------------|
| iOS con Small Business Program (< $1M USD/año) | 15% | ~$292 MXN |
| iOS sin Small Business (año 1) | 30% | ~$241 MXN |
| iOS año 2+ del suscriptor | 15% | ~$292 MXN |
| Android (siempre) | 15% | ~$292 MXN |
| Web (Stripe via RevenueCat) | ~3.6% | ~$332 MXN |

### Qué reemplaza del sistema actual

| Hoy (Stripe directo) | Con RevenueCat |
|---|---|
| Stripe checkout (`/create-checkout`) | RevenueCat Web SDK |
| Stripe addon checkout (`/create-addon-checkout`) | RevenueCat Web SDK |
| Stripe webhook worker | Webhook RevenueCat → Supabase |
| Stripe portal (`/create-portal-session`) | RevenueCat Customer Center |
| Sin billing nativo | RevenueCat Capacitor SDK (IAP + Play Billing) |
| Tabla `user_entitlements` | Se queda igual, solo cambia quién escribe |

---

## Datos duros: IAP vs Web (fuentes verificadas)

### Test A/B de RevenueCat + Dipsea (mayo 2025)

RevenueCat realizó el primer test a gran escala comparando compra in-app vs web en la app Dipsea (wellness/sleep, categoría similar a TuPotencial).

| Métrica | IAP | Web | Diferencia |
|---------|-----|-----|------------|
| Conversión paywall → trial | **28%** | **18%** | IAP +55% mejor |
| Completar compra después de tap en "Subscribe" | **71%** | **44%** | IAP +61% mejor |
| Ingreso neto (vs $1.00 IAP-only) | $1.00 | $0.86 (con SBP 15%) | **Web pierde 14%** |

**Conclusión de RevenueCat:** *"In-app purchases are good for conversion rates. In fact, at least 30% better."*

- Fuente: [RevenueCat Blog — Web vs. in-app subscriptions](https://www.revenuecat.com/blog/growth/iap-vs-web-purchases-conversion-test/) (mayo 2025)
- Fuente secundaria: [Daring Fireball](https://daringfireball.net/linked/2025/05/15/revenuecat-external-purchase-report) (mayo 2025)

### Dato clave para apps con Small Business Program (15%)

Superwall midió el impacto de redirigir a web post-Epic v. Apple:

- Caída inicial de conversión: **-11.9%**
- Para apps con 30% de comisión: los ingresos netos suben +19.85% (la comisión ahorrada compensa)
- **Para apps con 15% de comisión (Small Business): los ingresos netos BAJAN -1.3%**

Es decir: si TuPotencial califica para el Small Business Program (< $1M USD/año), ir solo-web **pierde dinero** comparado con IAP.

- Fuente: [Superwall — App2Web Conversion Rates](https://superwall.com/blog/initial-data-is-in-app-to-web-conversion-rates-after-the-app-store-ruling) (2025)

### Benchmarks de Health & Fitness (RevenueCat State of Subscription Apps 2026)

Datos de 115,000+ apps de suscripción generando $16B en ingresos:

| Métrica | Health & Fitness |
|---------|-----------------|
| Trial-to-paid mediana | **39.9%** |
| Trial-to-paid top 10% | **68.3%** |
| Revenue por install (60 días) | **$0.63** (la más alta de cualquier categoría) |
| 82% de trials empiezan el mismo día del install | Flujo sin fricción es crítico |

- Fuente: [RevenueCat State of Subscription Apps 2026](https://www.revenuecat.com/state-of-subscription-apps/) (marzo 2026)

---

## Reglas que aplican en México

### iOS
- **Contenido digital in-app DEBE usar IAP** (guideline 3.1.1)
- **No se puede dirigir a pago externo** dentro de la app (guideline 3.1.1(a) — México cae bajo "all other storefronts")
- **Sí se puede comunicar fuera de la app** (email, redes) sobre compra web (guideline 3.1.3)
- **Small Business Program:** 15% si ganas < $1M USD/año
- No hay cambios previstos para México

### Android
- **Contenido digital in-app DEBE usar Play Billing** (hoy, en México)
- **Suscripciones: 15% desde día 1** (no importa ingresos)
- **Settlement Epic v. Google (marzo 2026):** libertad total de billing llegará a México antes del 30 de septiembre de 2027
- Post-settlement: 10% suscripciones recurrentes + billing fee TBD

---

## RevenueCat: qué es y qué se necesita

### ¿Por qué RevenueCat?

RevenueCat abstrae IAP de iOS, Play Billing de Android, y pagos web (via Stripe) en un solo SDK con un solo dashboard. Sin RevenueCat, necesitarías implementar StoreKit 2 (iOS) + Play Billing Library (Android) + Stripe (web) por separado. RevenueCat reduce eso a ~100 líneas de código.

### Costo de RevenueCat

| Tier | Costo | Límite |
|------|-------|--------|
| **Free** | $0 | Hasta **$2,500 USD/mes** en ingresos rastreados |
| **Pro** | 1% del ingreso | Cuando superas $2,500 USD/mes |
| **Enterprise** | Custom | Alto volumen |

Con $399 MXN/mes (~$22 USD), necesitarías ~114 suscriptores activos para llegar al límite del tier gratuito. Empieza gratis.

- Fuente: [RevenueCat Pricing](https://www.revenuecat.com/pricing/)

### Plugins

- **Nativo:** `@revenuecat/purchases-capacitor` (oficial, mantenido por RevenueCat)
- **Web:** `@revenuecat/purchases-js`
- **Paywall UI pre-built:** `@revenuecat/purchases-capacitor-ui`
- **Docs Capacitor:** [RevenueCat Capacitor](https://www.revenuecat.com/docs/getting-started/installation/capacitor)
- **Docs Web:** [RevenueCat Web](https://www.revenuecat.com/docs/web/overview)

### Arquitectura

```
┌─────────────────────┐     ┌─────────────────────┐
│   App nativa         │     │      Web             │
│   (Capacitor)        │     │      (Nuxt SSR)      │
│                      │     │                      │
│  purchases-capacitor │     │  purchases-js        │
│  (IAP / Play Billing)│     │  (Stripe por debajo) │
└──────────┬───────────┘     └──────────┬───────────┘
           │                            │
           └────────────┬───────────────┘
                        ▼
              ┌──────────────────┐
              │   RevenueCat     │
              │   (unifica todo) │
              └────────┬─────────┘
                       │
                       ▼ webhook
              ┌──────────────────────────────┐
              │  Supabase: user_entitlements  │
              │                              │
              │  user_id | key  | source     │
              │  abc123  | core | revenuecat │
              └──────────────────────────────┘
                       │
                       ▼
              ┌──────────────────────────────┐
              │  App: useAuth() → isSubscriber│
              │  (no le importa el source)   │
              └──────────────────────────────┘
```

### Pasos de integración

| Paso | Qué hacer | Tiempo estimado |
|------|-----------|-----------------|
| 1 | Crear productos de suscripción en **App Store Connect** (subscription group, pricing, duración) | 1 día |
| 2 | Crear productos de suscripción en **Google Play Console** (service account, RTDN) | 1 día |
| 3 | Configurar proyecto en **RevenueCat dashboard** (products, entitlements, offerings, conectar Stripe) | 2-3 horas |
| 4 | Instalar `@revenuecat/purchases-capacitor` y configurar plugin Nuxt (solo nativo) | 1 día |
| 5 | Instalar `@revenuecat/purchases-js` y reemplazar Stripe checkout en web | 1 día |
| 6 | Crear **webhook RevenueCat → Supabase** Edge Function que actualice `user_entitlements` | 1 día |
| 7 | Crear **paywall UI** en la app (o usar `@revenuecat/purchases-capacitor-ui` pre-built) | 1-2 días |
| 8 | Eliminar Stripe worker viejo (`/create-checkout`, `/create-portal-session`, `/webhook`) | 0.5 días |
| 9 | Limpiar textos que mencionan "tupotencial.com" o "la web" en app nativa | 0.5 días |
| 10 | **Testing** en sandbox (iOS sandbox account, Google test track, web) | 2-3 días |
| 11 | Aplicar al **Small Business Program** de Apple | Inmediato |
| **Total** | | **~8-12 días** |

### Gotchas con Capacitor + Vue

1. **Vue Proxy objects:** Siempre usar `toRaw()` antes de pasar objetos reactivos al plugin. Los Proxy de Vue fallan silenciosamente al cruzar el bridge nativo.
2. **Capacitor 8 compatibilidad:** Verificar que la última versión del plugin (v12.x) sea compatible con Capacitor 8. Revisar [VERSIONS.md](https://github.com/RevenueCat/purchases-capacitor/blob/main/VERSIONS.md).
3. **Android launchMode:** Debe ser `standard` o `singleTop` en `AndroidManifest.xml`, si no el diálogo de compra de Google Play no aparece.
4. **No mezclar SDKs:** No importar `purchases-js` (web) y `purchases-capacitor` (nativo) en el mismo componente. Usar `isNative` para separar.
5. **appUserID:** Siempre pasar tu Supabase user ID en `Purchases.configure()`. Si no, RevenueCat asigna un `$RCAnonymousID` que no matchea con tu base de datos.

### Código mínimo de integración

```typescript
// plugins/revenuecat.client.ts (Nuxt plugin, solo nativo)
import { Purchases } from '@revenuecat/purchases-capacitor'
import { Capacitor } from '@capacitor/core'

export default defineNuxtPlugin(async () => {
  if (!Capacitor.isNativePlatform()) return

  const apiKey = Capacitor.getPlatform() === 'ios'
    ? 'appl_YOUR_IOS_KEY'
    : 'goog_YOUR_ANDROID_KEY'

  const { user } = useAuth()

  await Purchases.configure({
    apiKey,
    appUserID: user.value?.id,
  })
})
```

```typescript
// Compra nativa (en paywall o botón de suscripción)
import { Purchases } from '@revenuecat/purchases-capacitor'
import { toRaw } from 'vue'

async function subscribe() {
  const { offerings } = await Purchases.getOfferings()
  const pkg = offerings.current?.availablePackages[0]
  if (!pkg) return

  const { customerInfo } = await Purchases.purchasePackage({
    aPackage: toRaw(pkg),  // IMPORTANTE: toRaw() para Vue
  })

  if (customerInfo.entitlements.active['core']) {
    // Suscripción exitosa
  }
}
```

---

## Resumen para el cliente (formato WhatsApp)

```
MONETIZACIÓN DE LA APP — RESUMEN

Investigamos a fondo cómo manejar los pagos de suscripción en la app (iOS y Android) para México. Aquí va el resumen:


EL PROBLEMA

Apple y Google obligan a que las suscripciones digitales consumidas dentro de la app se cobren con su sistema de pagos (In-App Purchase en iOS, Google Play Billing en Android). Si no cumples, rechazan la app.

La comisión es:
- Apple: 15% si ganas menos de $1M USD/año (Small Business Program). Si no, 30%.
- Google: 15% siempre para suscripciones.

La alternativa sería cobrar solo por web (~3.6% de comisión con Stripe), pero hay un costo oculto enorme.


POR QUÉ NO CONVIENE COBRAR SOLO POR WEB

RevenueCat hizo el primer test A/B a gran escala comparando compra in-app vs compra web, en una app de wellness similar a la nuestra (Dipsea):

- Compra in-app: 28% de conversión
- Compra por web: 18% de conversión
- La compra in-app convierte 55% más

Superwall confirmó lo mismo: para apps con 15% de comisión (Small Business), ir solo por web resulta en MENOS ingresos — no más. La conversión cae tanto que no compensa el ahorro en comisión.


PROYECCIÓN POR ESCENARIOS

Con suscripción de $399 MXN/mes:

500 usuarios free/mes:
- Solo web: 9 subs × $332 = $2,988/mes
- Con IAP (15%): 15 subs × $292 = $4,380/mes
- Diferencia: +$1,392/mes con IAP

1,000 usuarios free/mes:
- Solo web: 18 subs × $332 = $5,976/mes
- Con IAP (15%): 30 subs × $292 = $8,760/mes
- Diferencia: +$2,784/mes con IAP

5,000 usuarios free/mes:
- Solo web: 90 subs × $332 = $29,880/mes
- Con IAP (15%): 150 subs × $292 = $43,800/mes
- Diferencia: +$13,920/mes con IAP

10,000 usuarios free/mes:
- Solo web: 180 subs × $332 = $59,760/mes
- Con IAP (15%): 300 subs × $292 = $87,600/mes
- Diferencia: +$27,840/mes con IAP

En TODOS los escenarios, IAP genera más ingreso a pesar de la comisión del 15%. La inversión en integrar IAP (~8-12 días de desarrollo) se recupera en el primer mes.


LA RECOMENDACIÓN

Usar RevenueCat como sistema único de pagos para todo: app nativa y web.

- En la app: el usuario compra con Apple Pay / Google Pay (15% de comisión)
- En la web: el usuario compra con tarjeta vía Stripe (procesado por RevenueCat, ~3.6%)
- Todo unificado: un solo sistema, un solo dashboard, las suscripciones se sincronizan automáticamente

RevenueCat es gratis hasta ~114 suscriptores activos ($2,500 USD/mes). Después cobra 1% del ingreso.

Pasos:
1. Aplicar al Small Business Program de Apple (15% en vez de 30%) — inmediato
2. Integrar RevenueCat en la app y la web (~8-12 días de desarrollo)
3. Opcional: email marketing post-registro para que más usuarios compren por web (menor comisión)

Lo que NO debemos hacer:
- Cobrar solo por web — perdemos más de la mitad de las conversiones
- Poner links o textos en la app que digan "compra en la web" — Apple lo prohíbe en México
- Intentar evitar las comisiones de las tiendas — riesgo de rechazo de la app


FUENTES

1. RevenueCat — Test A/B: compra in-app vs web (mayo 2025)
revenuecat.com/blog/growth/iap-vs-web-purchases-conversion-test/

2. Superwall — Datos de conversión App-to-Web (2025)
superwall.com/blog/initial-data-is-in-app-to-web-conversion-rates-after-the-app-store-ruling

3. RevenueCat — State of Subscription Apps 2026 (115K+ apps, $16B en ingresos)
revenuecat.com/state-of-subscription-apps/

4. Apple — App Store Review Guidelines, secciones 3.1.1 y 3.1.3
developer.apple.com/app-store/review/guidelines/

5. Apple — Small Business Program (15% comisión)
developer.apple.com/app-store/small-business-program/

6. Google Play — Payments Policy
support.google.com/googleplay/android-developer/answer/9858738

7. RevenueCat — Precios (gratis hasta $2,500 USD/mes)
revenuecat.com/pricing/
```
