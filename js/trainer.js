//AQUI VA EL JS DEL ADMIN

//AQUI VA EL JS DEL ADMIN
// ============================================================================
// trainer.js
// Lógica de la Interfaz de Administrador (Trainer)
// ============================================================================

import { API, USE_MOCK, show, hide, requestJSON , askForAnswer, notify} from './common.js';

let lastPreguntaId = null;

// ---------------------------------------------------------------------------
// Inicialización
// ---------------------------------------------------------------------------
window.addEventListener('DOMContentLoaded', () => {
  loadPending();

  // Botón para probar preguntas
  document.getElementById('testBtn').addEventListener('click', onTest);

  // Botones de feedback
  document.getElementById('adminFbOk').addEventListener('click', () => sendAdminFeedback(true));
  document.getElementById('adminFbBad').addEventListener('click', () => sendAdminFeedback(false));

  // Guardar corrección
  document.getElementById('saveCorrectionBtn').addEventListener('click', saveCorrection);
});

// ---------------------------------------------------------------------------
// Cargar preguntas sin respuesta
// ---------------------------------------------------------------------------
async function loadPending() {
  const tbody = document.getElementById('pendingQuestions');
  tbody.innerHTML = '<tr><td colspan="2">Cargando…</td></tr>';

  try {
    const res = await requestJSON(API.pending, 'GET');
    tbody.innerHTML = '';

    (res.items || []).forEach((it) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${it.pregunta}</td>
        <td>
          <button class="btn btn-sm btn-primary">Responder</button>
        </td>
      `;
    tr.querySelector('button').addEventListener('click', async () => {
     const answer = await askForAnswer({ questionText: `Escribe la respuesta para: "${it.pregunta}"` });
      if (answer) saveAnswer(it.id, answer);
    });

      tbody.appendChild(tr);
    });

    if ((res.items || []).length === 0) {
      tbody.innerHTML = '<tr><td colspan="2">No hay preguntas pendientes</td></tr>';
    }
  } catch (e) {
    tbody.innerHTML = '<tr><td colspan="2" class="text-danger">Error al cargar</td></tr>';
  }
}

// ---------------------------------------------------------------------------
// Guardar respuesta manual
// ---------------------------------------------------------------------------
async function saveAnswer(id, respuesta) {
  try {
    await requestJSON(API.answer, 'POST', { id, respuesta });
    notify('Respuesta guardada correctamente.', 'ok');
    loadPending();
  } catch (e) {
    notify('No se pudo guardar la respuesta.', 'err');
  }
}


// ---------------------------------------------------------------------------
// Probar pregunta
// ---------------------------------------------------------------------------
async function onTest() {
  const qEl = document.getElementById('testQuestion');
  const aEl = document.getElementById('testAnswer');
  const loading = document.getElementById('testLoading');

  const pregunta = (qEl.value || '').trim();
  if (!pregunta) return;

  aEl.value = '';
  hide('#correctionSection');
  loading.classList.remove('d-none');

  try {
    const res = await requestJSON(API.ask, 'POST', { pregunta });
    loading.classList.add('d-none');

    if (res?.status === 'ok') {
      aEl.value = res.answer || '—';
      lastPreguntaId = res.pregunta_id ?? null;
      show('#correctionSection');
    } else {
      aEl.value = res?.message || 'No encontré respuesta.';
      lastPreguntaId = null;
    }
  } catch (e) {
    loading.classList.add('d-none');
    aEl.value = 'Error al consultar.';
    lastPreguntaId = null;
  }
}

// ---------------------------------------------------------------------------
// Feedback desde admin
// ---------------------------------------------------------------------------
async function sendAdminFeedback(ok) {
  if (!lastPreguntaId && !USE_MOCK) return;

  const fbMsg = document.getElementById('adminFbMsg');
  try {
    await requestJSON(API.feedback, 'POST', {
      pregunta_id: lastPreguntaId,
      es_correcta: !!ok,
    });
    fbMsg.textContent = 'Feedback guardado.';
    fbMsg.classList.remove('text-danger');
    fbMsg.classList.add('text-muted');
  } catch (_) {
    fbMsg.textContent = 'Error al guardar feedback.';
    fbMsg.classList.remove('text-muted');
    fbMsg.classList.add('text-danger');
  }
  show('#adminFbMsg');
  setTimeout(() => hide('#adminFbMsg'), 2000);
}

// ---------------------------------------------------------------------------
// Guardar corrección de respuesta
// ---------------------------------------------------------------------------
async function saveCorrection() {
  const correction = (document.getElementById('correctionInput').value || '').trim();
  if (!correction || (!lastPreguntaId && !USE_MOCK)) return;

  try {
    await requestJSON(API.correct, 'POST', {
      pregunta_id: lastPreguntaId,
      respuesta: correction,
    });
    notify('Corrección guardada.', 'ok');
    document.getElementById('correctionInput').value = '';
  } catch (e) {
    notify('No se pudo guardar la corrección.', 'err');
  }
}

