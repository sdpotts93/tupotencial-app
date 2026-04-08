<template>
  <div class="legal">
    <header class="legal__header">
      <button class="legal__back" aria-label="Volver" @click="$router.back()">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"/>
        </svg>
      </button>
      <h1 class="legal__header-title">Política de privacidad</h1>
    </header>

    <div class="legal__body">
      <p class="legal__updated">Última actualización: 7 de abril de 2026</p>

      <section class="legal__section">
        <h2>1. Identidad del responsable</h2>
        <p>Tu Potencial, con domicilio en Ciudad de México, México, es responsable del tratamiento de tus datos personales conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP) y su Reglamento.</p>
        <p>Esta Política de Privacidad (Aviso de Privacidad) explica cómo recopilamos, usamos, almacenamos y protegemos tu información personal cuando utilizas nuestra aplicación móvil Tu Potencial ("la Aplicación").</p>
        <p>Al utilizar la Aplicación, aceptas las prácticas descritas en este Aviso. Si no estás de acuerdo, te pedimos que no utilices la Aplicación.</p>
      </section>

      <section class="legal__section">
        <h2>2. Información que recopilamos</h2>

        <h3>2.1 Información que proporcionas directamente</h3>
        <ul>
          <li><strong>Datos de registro:</strong> correo electrónico y contraseña al crear tu cuenta.</li>
          <li><strong>Datos de perfil:</strong> nombre para mostrar y foto de perfil (opcional).</li>
          <li><strong>Preferencias de onboarding:</strong> motivaciones, áreas de enfoque, guía seleccionado (Gabriel, Carlotta o Conjunta) y tiempo diario de dedicación.</li>
          <li><strong>Contenido de comunidad:</strong> publicaciones, comentarios, imágenes y videos que compartes en la comunidad.</li>
          <li><strong>Conversaciones con el coach IA:</strong> mensajes que envías al coach de inteligencia artificial.</li>
        </ul>

        <h3>2.2 Información recopilada automáticamente</h3>
        <ul>
          <li><strong>Datos de uso:</strong> progreso en programas, contenido visualizado, rachas de actividad y check-ins diarios.</li>
          <li><strong>Datos de dispositivo:</strong> plataforma (iOS o Android), tokens de notificaciones push.</li>
          <li><strong>Datos analíticos:</strong> eventos de navegación y uso de funciones a través de Firebase Analytics (solo en aplicación nativa).</li>
        </ul>

        <h3>2.3 Información de pago</h3>
        <p>Los pagos se procesan a través de Stripe, Apple App Store o Google Play Store. <strong>No almacenamos</strong> números de tarjeta de crédito ni datos financieros completos. Solo guardamos identificadores de suscripción y estado de pago para gestionar tu acceso a contenido premium.</p>
      </section>

      <section class="legal__section">
        <h2>3. Cómo usamos tu información</h2>
        <p>Utilizamos tu información para:</p>
        <ul>
          <li><strong>Proporcionar el servicio:</strong> gestionar tu cuenta, personalizar tu experiencia y entregar contenido relevante.</li>
          <li><strong>Coach IA:</strong> contextualizar las respuestas del coach con tus preferencias y segmento seleccionado para brindarte orientación personalizada.</li>
          <li><strong>Seguimiento de progreso:</strong> registrar tus rachas, completaciones de programas y check-ins diarios.</li>
          <li><strong>Notificaciones:</strong> enviarte recordatorios, actualizaciones y comunicaciones relevantes sobre tu actividad (con tu consentimiento).</li>
          <li><strong>Mejoras del servicio:</strong> analizar patrones de uso de forma agregada para mejorar la Aplicación.</li>
          <li><strong>Seguridad:</strong> detectar y prevenir actividades fraudulentas o abuso de la plataforma.</li>
          <li><strong>Cumplimiento legal:</strong> cumplir con obligaciones legales y regulatorias aplicables.</li>
        </ul>
      </section>

      <section class="legal__section">
        <h2>4. Con quién compartimos tu información</h2>
        <p>No vendemos tu información personal. Podemos compartir datos con:</p>
        <ul>
          <li><strong>Proveedores de servicios:</strong> Supabase (base de datos y autenticación), Stripe (pagos), Firebase (analíticas), OpenAI (procesamiento de conversaciones del coach IA). Estos proveedores solo acceden a la información necesaria para prestar sus servicios y están sujetos a obligaciones de confidencialidad.</li>
          <li><strong>Tiendas de aplicaciones:</strong> Apple y Google para gestionar suscripciones y pagos dentro de la aplicación.</li>
          <li><strong>Autoridades legales:</strong> cuando sea requerido por ley, orden judicial o para proteger nuestros derechos legales.</li>
        </ul>
      </section>

      <section class="legal__section">
        <h2>5. Conversaciones con el coach IA</h2>
        <p>Tus conversaciones con el coach IA se almacenan de forma segura para mantener el historial de sesiones y mejorar la calidad de las respuestas. Es importante que sepas que:</p>
        <ul>
          <li>Las conversaciones se procesan a través de OpenAI para generar respuestas.</li>
          <li>Implementamos categorías de seguridad para filtrar contenido inapropiado.</li>
          <li>No utilizamos tus conversaciones para entrenar modelos de inteligencia artificial de terceros.</li>
          <li>Puedes solicitar la eliminación de tu historial de conversaciones contactándonos.</li>
        </ul>
      </section>

      <section class="legal__section">
        <h2>6. Almacenamiento y seguridad</h2>
        <p>Tu información se almacena en servidores seguros proporcionados por Supabase con cifrado en tránsito y en reposo. Implementamos medidas de seguridad técnicas y organizativas para proteger tus datos, incluyendo:</p>
        <ul>
          <li>Cifrado de contraseñas.</li>
          <li>Conexiones HTTPS/TLS.</li>
          <li>Políticas de seguridad a nivel de fila (Row Level Security) en la base de datos.</li>
          <li>Acceso restringido a datos personales por parte de nuestro equipo.</li>
        </ul>
        <p>Sin embargo, ningún sistema de transmisión o almacenamiento es 100% seguro. No podemos garantizar la seguridad absoluta de tu información.</p>
      </section>

      <section class="legal__section">
        <h2>7. Retención de datos</h2>
        <p>Conservamos tu información personal durante los siguientes periodos:</p>
        <ul>
          <li><strong>Datos de cuenta y perfil:</strong> mientras tu cuenta permanezca activa. Se eliminan dentro de los 30 días posteriores a la solicitud de eliminación de cuenta.</li>
          <li><strong>Conversaciones con el coach IA:</strong> mientras tu cuenta esté activa. Se eliminan al eliminar la cuenta.</li>
          <li><strong>Contenido de comunidad:</strong> mientras tu cuenta esté activa. Puede ser anonimizado al eliminar la cuenta.</li>
          <li><strong>Datos de facturación:</strong> se conservan por 5 años conforme a las obligaciones fiscales establecidas en el Código Fiscal de la Federación.</li>
          <li><strong>Datos analíticos:</strong> se conservan de forma agregada y anonimizada sin límite de tiempo.</li>
        </ul>
      </section>

      <section class="legal__section">
        <h2>8. Tus derechos ARCO</h2>
        <p>De acuerdo con la LFPDPPP, tienes derecho a ejercer en cualquier momento tus derechos ARCO:</p>
        <ul>
          <li><strong>Acceso:</strong> conocer qué datos personales tenemos sobre ti y cómo los tratamos.</li>
          <li><strong>Rectificación:</strong> solicitar la corrección de datos inexactos o incompletos.</li>
          <li><strong>Cancelación:</strong> solicitar la eliminación de tus datos personales cuando consideres que no están siendo tratados conforme a la ley.</li>
          <li><strong>Oposición:</strong> oponerte al tratamiento de tus datos para finalidades específicas.</li>
        </ul>
        <p>Asimismo, puedes revocar el consentimiento otorgado para el tratamiento de tus datos personales en cualquier momento.</p>
        <p>Para ejercer cualquiera de estos derechos, envía tu solicitud a <strong>soporte@tupotencial.app</strong> con tu nombre completo, descripción clara de los datos y el derecho que deseas ejercer. Responderemos en un plazo máximo de 20 días hábiles conforme a la LFPDPPP.</p>
      </section>

      <section class="legal__section">
        <h2>9. Transferencias internacionales de datos</h2>
        <p>Tus datos personales pueden ser transferidos y almacenados en servidores ubicados fuera de México a través de nuestros proveedores de servicios (Supabase, Stripe, Firebase, OpenAI). Al utilizar la Aplicación, consientes expresamente esta transferencia. Nos aseguramos de que dichos proveedores cuenten con medidas de seguridad y confidencialidad adecuadas conforme a la LFPDPPP.</p>
      </section>

      <section class="legal__section">
        <h2>10. Menores de edad</h2>
        <p>La Aplicación no está dirigida a menores de 18 años. No recopilamos deliberadamente información de menores de edad. Si descubrimos que hemos recopilado datos de un menor sin consentimiento parental verificable, eliminaremos esa información de inmediato.</p>
      </section>

      <section class="legal__section">
        <h2>11. Cambios a este aviso</h2>
        <p>Podemos actualizar esta Política de Privacidad periódicamente. Te notificaremos de cambios significativos a través de la Aplicación o por correo electrónico. El uso continuado de la Aplicación después de los cambios constituye tu aceptación de la política actualizada.</p>
      </section>

      <section class="legal__section">
        <h2>12. Autoridad reguladora</h2>
        <p>Si consideras que tu derecho a la protección de datos personales ha sido vulnerado, puedes interponer una queja ante el Instituto Nacional de Transparencia, Acceso a la Información y Protección de Datos Personales (INAI). Para más información visita <strong>www.inai.org.mx</strong>.</p>
      </section>

      <section class="legal__section">
        <h2>13. Contacto</h2>
        <p>Si tienes preguntas o inquietudes sobre este Aviso de Privacidad o sobre el tratamiento de tus datos personales, puedes contactarnos en:</p>
        <p><strong>soporte@tupotencial.app</strong></p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: false })
</script>

<style scoped>
.legal {
  min-height: 100dvh;
  padding: var(--space-6);
  overflow-y: auto;
}

.legal__header {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: var(--space-6);
}

.legal__header-title {
  font-family: var(--font-eyebrow);
  font-size: 12px;
  text-transform: uppercase;
}

.legal__back {
  position: absolute;
  left: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--color-dark-lighter);
  cursor: pointer;
  border-radius: var(--radius-md);
  -webkit-tap-highlight-color: transparent;
}

@media (hover: hover) {
  .legal__back:hover { background: rgba(var(--tint-rgb), 0.04); }
}

.legal__body {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  line-height: 1.7;
  color: var(--color-text);
  max-width: 680px;
  margin: 0 auto;
}

.legal__updated {
  font-size: var(--text-xs);
  color: var(--color-muted);
  margin-bottom: var(--space-6);
}

.legal__section {
  margin-bottom: var(--space-6);
}

.legal__section h2 {
  font-family: var(--font-body);
  font-size: var(--text-base);
  font-weight: var(--weight-semibold);
  margin-bottom: var(--space-2);
}

.legal__section h3 {
  font-family: var(--font-body);
  font-size: var(--text-sm);
  font-weight: var(--weight-semibold);
  margin-top: var(--space-4);
  margin-bottom: var(--space-2);
}

.legal__section p {
  margin-bottom: var(--space-3);
}

.legal__section ul {
  padding-left: var(--space-5);
  margin-bottom: var(--space-3);
}

.legal__section li {
  margin-bottom: var(--space-2);
}
</style>
