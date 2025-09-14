// ============================================================================
// user.js
// Lógica de la Interfaz de Usuario (consulta, feedback, glosario)
// ============================================================================

import { API, USE_MOCK, show, hide, requestJSON } from './common.js';

// Variable global temporal para recordar el último id de pregunta respondida
let lastPreguntaId = null;

// ---------------------------------------------------------------------------
// Inicialización al cargar la página
// ---------------------------------------------------------------------------
window.addEventListener('DOMContentLoaded', () => {
  // Botón "Enviar" → ejecuta la consulta al backend
  document.getElementById('sendBtn').addEventListener('click', onSend);

  // Botones de feedback → envían valoración al backend
  document.getElementById('fbOk').addEventListener('click', () => sendFeedback(true));
  document.getElementById('fbBad').addEventListener('click', () => sendFeedback(false));

  // Cargar glosario al inicio
  loadGlossary();

  // Filtros del glosario (tema + buscador de texto)
  document.getElementById('filterTema').addEventListener('change', loadGlossary);
  document.getElementById('searchGlossary').addEventListener('input', loadGlossary);
});

// ---------------------------------------------------------------------------
// onSend(): procesa el envío de la pregunta del usuario
// ---------------------------------------------------------------------------
async function onSend() {
  const preguntaEl = document.getElementById('userQuestion');
  const answerEl = document.getElementById('systemAnswer');
  const loadingEl = document.getElementById('loading');

  // Tomamos la pregunta del textarea
  const pregunta = (preguntaEl.value || '').trim();
  if (!pregunta) return; // si está vacío, no hacemos nada

  // Reset de estado UI
  hide('#feedbackSection'); // oculta feedback hasta que llegue respuesta
  answerEl.value = '';      // limpia la respuesta previa
  hide('#fbMsg');           // oculta mensaje de feedback
  loadingEl.classList.remove('d-none'); // muestra “cargando”

  try {
    // Petición al backend (API.ask) vía requestJSON
    const res = await requestJSON(API.ask, 'POST', { pregunta });
    loadingEl.classList.add('d-none'); // ocultar spinner

    if (res?.status === 'ok') {
      // Caso: sí hay respuesta
      answerEl.value = res.answer || '—';
      lastPreguntaId = res.pregunta_id ?? null;
      show('#feedbackSection'); // habilita los botones de feedback
    } else {
      // Caso: no encontrado
      answerEl.value = res?.message || 'No encontré respuesta.';
      lastPreguntaId = null;
    }
  } catch (e) {
    // Error de red / backend
    loadingEl.classList.add('d-none');
    answerEl.value = 'Error al consultar. Intenta de nuevo.';
    lastPreguntaId = null;
  }
}

// ---------------------------------------------------------------------------
// sendFeedback(): envía la valoración del usuario (✓ o ✗)
// ---------------------------------------------------------------------------
async function sendFeedback(ok) {
  // Si no hay id de pregunta y no estamos en modo mock, no hacemos nada
  if (!lastPreguntaId && !USE_MOCK) return;

  const fbMsg = document.getElementById('fbMsg');
  try {
    await requestJSON(API.feedback, 'POST', {
      pregunta_id: lastPreguntaId,
      es_correcta: !!ok,
    });

    // Mensaje visual de éxito
    fbMsg.textContent = '¡Gracias por tu feedback!';
    fbMsg.classList.remove('text-danger');
    fbMsg.classList.add('text-muted');
  } catch (_) {
    // Error al guardar feedback
    fbMsg.textContent = 'No se pudo guardar el feedback.';
    fbMsg.classList.remove('text-muted');
    fbMsg.classList.add('text-danger');
  }

  // Mostrar mensaje unos segundos
  show('#fbMsg');
  setTimeout(() => hide('#fbMsg'), 2000);
}

// ---------------------------------------------------------------------------
// loadGlossary(): carga y muestra las preguntas ya respondidas
// ---------------------------------------------------------------------------
async function loadGlossary() {
  const temaSel = document.getElementById('filterTema').value;
  const q = (document.getElementById('searchGlossary').value || '').toLowerCase();

  try {
    // Petición al backend para obtener temas y preguntas
    const res = await requestJSON(API.glossary, 'GET');

    // ---- Rellenar dropdown de temas (solo 1 vez) ----
    const temaSelect = document.getElementById('filterTema');
    if (temaSelect.options.length <= 1 && Array.isArray(res.temas)) {
      res.temas.forEach((t) => {
        const opt = document.createElement('option');
        opt.value = t;
        opt.textContent = t;
        temaSelect.appendChild(opt);
      });
    }

    // ---- Rellenar lista de preguntas (glosario) ----
    const list = document.getElementById('glossaryList');
    list.innerHTML = ''; // limpia lista actual

    (res.items || [])
      // filtro por tema (dropdown)
      .filter((it) => !temaSel || it.tema === temaSel)
      // filtro por texto (buscador)
      .filter((it) => !q || it.pregunta.toLowerCase().includes(q))
      .forEach((it) => {
        const li = document.createElement('li');
        li.className =
          'list-group-item d-flex justify-content-between align-items-start';
        li.innerHTML = `
          <div>
            <div class="fw-semibold">${it.pregunta}</div>
           
          </div>
          <a href="#" class="btn btn-sm btn-accent">Usar</a>
        `;

        // Evento "Usar" → copia la pregunta al textarea de consulta
        li.querySelector('a').addEventListener('click', (e) => {
          e.preventDefault();
          document.getElementById('userQuestion').value = it.pregunta;
          window.scrollTo({ top: 0, behavior: 'smooth' }); // sube al inicio
        });

        list.appendChild(li);
      });
  } catch (_) {
    // En caso de error, no renderiza nada (se podría mostrar aviso)
  }
}
