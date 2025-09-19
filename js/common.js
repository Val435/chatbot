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
  // === USER ===
  // POST { pregunta:string } 
  // -> { status:'ok', answer:string, pregunta_id:number } | { status:'not_found', message:string }
  ask: '/backend/search.php',

   

  // POST { pregunta_id:number, es_correcta:boolean } 
  // -> { status:'ok' }
  feedback: '/backend/feedback.php',

  // GET 
  // -> { temas:string[], items:{ id:number, pregunta:string, tema:string }[] }
  glossary: '/backend/glossary.php',

  // === TRAINER ===
  // GET 
  // -> { items:{ id:number, pregunta:string }[] }
  pending: '/backend/pending.php',

  // POST { id:number, respuesta:string, tema:string } 
  // -> { status:'ok' }
  answer: '/backend/answer.php',

  // POST { id:number, respuesta:string } 
  // -> { status:'ok' }
  correct: '/backend/correct.php',

   // ---- PARTE DEL LOGIN ----

  login: '/auth/login',
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
    });

    if (!res.ok) throw new Error(`Network error (${res.status})`);
    return await res.json();
  }

  // ---- MODO MOCK: datos simulados para desarrollo sin backend ----
  await new Promise((r) => setTimeout(r, 400));

  // === USER MOCKS ===

  // ---- PARTE DEL LOGIN COMIENZA ----

if (url.includes('/auth/login')) {
  if (data?.username === 'admin' && data?.password === '1234') {
    return { status: 'ok', user:{ id:1, username:'admin' } };
  }
  return { status:'error', message:'Usuario o contraseña inválidos' };
}   // ---- PARTE DEL LOGIN TERMINA ----

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

  if (url.includes('search')) {
    const q = (data?.pregunta || '').toLowerCase();
    if (q.includes('servidor')) {
      return {
        status: 'ok',
        answer: 'Para reiniciar el servidor, usa el panel de administración y ejecuta un reinicio seguro.',
        pregunta_id: 101,
      };
    }
    return { status: 'not_found', message: 'No encontré respuesta.' };
  }

  if (url.includes('feedback')) {
    return { status: 'ok' };
  }

  // === TRAINER MOCKS ===
  if (url.includes('pending')) {
    return {
      items: [
        { id: 201, pregunta: '¿Cómo configuro la máquina EN-08?' },
        { id: 202, pregunta: '¿Cuál es el número de soporte técnico?' },
      ],
    };
  }

  if (url.includes('answer')) {
    return { status: 'ok', message: 'Respuesta guardada correctamente.' };
  }

  if (url.includes('correct')) {
    return { status: 'ok', message: 'Respuesta corregida.' };
  }

// Fallback vacío
  return {};
  
}


// ===== Modal de respuesta =====
export function askForAnswer({ questionText = '' } = {}) {
  const ov     = document.getElementById('answerModal');
  const qEl    = document.getElementById('answerModalQuestion');
  const input  = document.getElementById('answerModalInput');
  const okBtn  = document.getElementById('answerModalOk');
  const cancel = document.getElementById('answerModalCancel');
  const xBtn   = ov.querySelector('.modal-close');

  qEl.textContent = questionText || 'Escribe la respuesta para esta pregunta:';
  input.value = '';

  return new Promise((resolve) => {
    const close = (val=null) => {
      ov.classList.add('d-none');
      okBtn.removeEventListener('click', onOk);
      cancel.removeEventListener('click', onCancel);
      xBtn.removeEventListener('click', onCancel);
      document.removeEventListener('keydown', onKey);
      resolve(val);
    };
    const onOk = () => close(input.value.trim() || null);
    const onCancel = () => close(null);
    const onKey = (e) => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) onOk(); // Ctrl/Cmd+Enter
    };

    okBtn.addEventListener('click', onOk);
    cancel.addEventListener('click', onCancel);
    xBtn.addEventListener('click', onCancel);
    document.addEventListener('keydown', onKey);

    ov.classList.remove('d-none');
    setTimeout(() => input.focus(), 0);
  });
}

// ===== Toast simple =====
export function notify(msg, type='ok', ms=1800) {
  const t = document.getElementById('toast');
  const s = document.getElementById('toastMsg');
  if (!t || !s) return;
  s.textContent = msg || '';
  t.classList.remove('d-none','ok','err');
  t.classList.add(type === 'err' ? 'err' : 'ok');
  let tm = setTimeout(() => {
    t.classList.add('d-none'); clearTimeout(tm);
  }, ms);
}

