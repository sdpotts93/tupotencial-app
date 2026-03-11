## 8) IA Coach (alineación de marca y control)

Para la IA Coach, se definen controles claros:

### 8.1 Límites de respuesta

- Límite de longitud por respuesta (tokens) para evitar respuestas largas y costosas
- Límite de frecuencia (rate limit) por usuario y por día
- Reglas de “no responder” (rechazo) para temas fuera del alcance

**Sí, se pueden configurar límites por usuario** (p. ej., X mensajes/día o X tokens/día), además de límites globales.

### 8.2 “Solo contenido aprobado”

Hay dos niveles:

- **Nivel 1 (MVP):** reglas + instrucciones (“solo responder con lineamientos aprobados; si no, abstenerse y recomendar canal humano”)
- **Nivel 2 (futuro):** base de conocimiento (RAG) con contenido aprobado (documentos/FAQs/guías) para que la IA responda con mayor precisión sin “inventar”.

### 8.3 Control del tono y mensajes

- Se configura un “sistema de voz” (tono, estilo, frases permitidas/prohibidas)
- Dos variantes: **Carlotta** y **Gabriel**
- Mensajes y límites revisables por el equipo (ajustes iterativos)

### 8.4 Tope de consumo mensual

- Se puede poner un **tope mensual global** (si llega al límite, la IA se desactiva o reduce a modo “lite”).
- También se puede poner **tope por usuario** (cuota diaria/semanal/mensual) para evitar que unos pocos consuman todo el presupuesto.

### 8.5 Optimización de costo

- Cache de respuestas frecuentes (FAQ / dudas repetidas)
- Prompts y límites pensados para costo/valor

### 8.6 Temas fuera de alcance (la IA debe abstenerse)

La IA no debe responder como “asesor definitivo” ni dar instrucciones específicas en:

- **Salud / lesiones / malestar físico** (dolor, síntomas, recuperación, diagnósticos)
- **Emergencias** o situaciones sensibles (riesgo físico, violencia, autolesión)
- **Temas médicos, psicológicos o terapéuticos**
- **Legal / financiero** (incluye disputas, amenazas legales)
- **Facturación sensible**: reembolsos, contracargos, disputas de pago, cambios de plan “especiales”
- Cualquier tema que implique responsabilidad clínica o legal

### 8.7 Protocolo de redirección a canal humano

Cuando detecte cualquiera de los temas anteriores, la IA:

1. Responde con un mensaje breve de contención alineado a marca (“prioridad: tu bienestar / cuidarte”).
2. Evita dar instrucciones específicas o diagnósticos.
3. Redirige a un canal humano dentro del producto:
    - botón “Hablar con soporte” / “Hablar con el equipo”
    - link a contacto.
4. Si aplica, sugiere buscar atención profesional (sin alarmismo, pero responsable).

### 8.8 Controles técnicos (para hacer cumplir lo anterior)

- Reglas de intención y “categorías sensibles”
- Respuestas aprobadas para redirección.
- Límites de longitud y frecuencia.
- Tope de consumo mensual (global y opcional por usuario)