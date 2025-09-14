// ============================================================================
// Configuración de API y utilidades de red/DOM para la UI del Chatbot
// - Vanilla JS + fetch() para AJAX (sin recargar la página)
// - Compatible con un modo "mock" (datos simulados) para desarrollo sin backend
// ============================================================================

/**
 * Mapa de endpoints del backend.
 * Ajusta las rutas según tu stack: PHP (/backend/*.php), Node (/api/*), etc.
 * Los contratos de datos (payloads) están indicados en comentarios.
 */
export const API = {
  // POST { pregunta:string } -> { status:'ok', answer:string, pregunta_id:number } | { status:'not_found', message:string }
  ask: '/backend/search.php',

  // POST { pregunta_id:number, es_correcta:boolean } -> { status:'ok' }
  feedback: '/backend/feedback.php',

  // GET -> { temas:string[], items:{ id:number, pregunta:string, tema:string }[] }
  glossary: '/backend/glossary.php',
};

/**
 * Bandera de ejecución con datos simulados.
 * true  = usa mocks (útil para maquetar y testear UI sin backend).
 * false = usa el backend real (fetch a los endpoints definidos en API).
 */
export const USE_MOCK = true;

// ============================================================================
// Helpers de DOM (mostrar/ocultar con la clase Bootstrap .d-none)
// ============================================================================

/**
 * Muestra el elemento que coincide con el selector CSS.
 * @param {string} sel - Selector CSS del elemento a mostrar.
 */
export const show = (sel) => document.querySelector(sel)?.classList.remove('d-none');

/**
 * Oculta el elemento que coincide con el selector CSS.
 * @param {string} sel - Selector CSS del elemento a ocultar.
 */
export const hide = (sel) => document.querySelector(sel)?.classList.add('d-none');

// ============================================================================
// requestJSON: wrapper de fetch() con soporte para modo MOCK
// ============================================================================

/**
 * Realiza una petición JSON al backend o devuelve datos simulados si USE_MOCK=true.
 *
 * @param {string} url     - URL del endpoint (usa valores en `API`).
 * @param {('GET'|'POST'|'PUT'|'PATCH'|'DELETE')} [method='GET'] - Método HTTP.
 * @param {object} [data]  - Cuerpo JSON para métodos con body (POST/PUT/PATCH).
 * @returns {Promise<any>} - Respuesta parseada como JSON.
 *
 * @example
 * // Real: (USE_MOCK=false)
 * const res = await requestJSON(API.ask, 'POST', { pregunta: '¿Horario?' });
 *
 * @example
 * // Mock: (USE_MOCK=true)
 * const res = await requestJSON(API.glossary, 'GET');
 */
export async function requestJSON(url, method = 'GET', data = undefined) {
  // ---- MODO REAL: usa backend ----
  if (!USE_MOCK) {
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: data ? JSON.stringify(data) : undefined,
      // Nota: si tu backend requiere credenciales/CORS, agrega:
      // credentials: 'include',
      // mode: 'cors',
    });

    // Falla explícita si la respuesta HTTP no es 2xx (para que el caller maneje errores)
    if (!res.ok) throw new Error(`Network error (${res.status})`);

    // Devuelve el cuerpo ya parseado
    return await res.json();
  }

  // ---- MODO MOCK: datos simulados para desarrollo sin backend ----
  // Simula latencia de red
  await new Promise((r) => setTimeout(r, 400));

  // Mock para el glosario
  if (url.includes('glossary')) {
    return {
      temas: ['Operación', 'TI', 'Logística'],
      items: [
        { id: 1, pregunta: '¿Cómo reinicio el servidor de correo?', tema: 'TI' },
        { id: 2, pregunta: '¿Cuál es el horario de carga en bodega?', tema: 'Logística' },
        { id: 3, pregunta: '¿Cómo solicito mantenimiento preventivo?', tema: 'Operación' },
      ],
    };
  }

  // Mock para búsqueda de respuestas
  if (url.includes('search')) {
    const q = (data?.pregunta || '').toLowerCase();

    // Ejemplo: “servidor” devuelve una respuesta de muestra
    if (q.includes('servidor')) {
      return {
        status: 'ok',
        answer:
          'Para reiniciar el servidor, usa el panel de administración y ejecuta un reinicio seguro.',
        pregunta_id: 101,
      };
    }

    // Si no coincide, simula “no encontrado” (se esperaría guardar en preguntas_sin_respuesta en el backend real)
    return { status: 'not_found', message: 'No encontré respuesta.' };
  }

  // Mock para feedback (respuesta genérica de éxito)
  if (url.includes('feedback')) {
    return { status: 'ok' };
  }

  // Fallback vacío (por si llega otra ruta en modo mock)
  return {};
}
