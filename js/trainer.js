import { API, USE_MOCK, show, hide, requestJSON, askForAnswer, notify } from './common.js';

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
    const res = await fetch('./backend/get_pending_questions.php');
    
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();

    // Verificar si hay un error en la respuesta
    if (data.error) {
      throw new Error(data.error);
    }

    tbody.innerHTML = '';
    
    if (Array.isArray(data)) {
      data.forEach((it) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${it.pregunta}</td>
          <td>
            <button class="btn btn-sm btn-primary" data-id="${it.id}">Responder</button>
          </td>
        `;
        tbody.appendChild(tr);
      });

      if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="2">No hay preguntas pendientes</td></tr>';
      }
    } else {
      tbody.innerHTML = '<tr><td colspan="2" class="text-danger">Datos inválidos recibidos</td></tr>';
    }

    // Agregar evento para los botones de "Responder"
    const answerButtons = document.querySelectorAll('#pendingQuestions .btn-primary');
    answerButtons.forEach(button => {
      button.addEventListener('click', () => {
        const questionId = button.getAttribute('data-id');
        answerQuestion(questionId);
      });
    });

  } catch (e) {
    console.error('Error al cargar preguntas pendientes:', e);
    tbody.innerHTML = '<tr><td colspan="2" class="text-danger">Error al cargar: ' + e.message + '</td></tr>';
  }
}

// ---------------------------------------------------------------------------
// Responder a una pregunta
// ---------------------------------------------------------------------------
async function answerQuestion(questionId) {
  const modal = document.getElementById('answerModal');
  const questionEl = document.getElementById('answerModalQuestion');
  const inputEl = document.getElementById('answerModalInput');
  const temaEl = document.getElementById('answerModalTema');
  const newTemaInput = document.getElementById('newTemaInput');
  const newTemaSection = document.getElementById('newTemaSection');
  
  // Obtener la pregunta
  const button = document.querySelector(`#pendingQuestions button[data-id="${questionId}"]`);
  const question = button.closest('tr').querySelector('td:first-child').textContent;
  
  // Mostrar modal
  show('#answerModal');
  questionEl.textContent = question;

  // Limpiar campos del modal
  inputEl.value = '';
  newTemaInput.value = '';
  newTemaSection.classList.add('d-none');

  // Limpiar event listeners previos clonando los elementos
  const newOkButton = document.getElementById('answerModalOk').cloneNode(true);
  document.getElementById('answerModalOk').replaceWith(newOkButton);
  
  const newTemaSelect = temaEl.cloneNode(true);
  temaEl.replaceWith(newTemaSelect);
  // Actualizar referencias después del clonado
  const temaElNew = document.getElementById('answerModalTema');

  // Obtener los temas existentes desde el backend
  try {
    const res = await fetch('./backend/get_themes.php');
    
    // Verificar si la respuesta es exitosa
    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    
    const data = await res.json();

    // Verificar si hay un error en la respuesta JSON
    if (data.error) {
      throw new Error(data.error);
    }

    // Limpiar los temas existentes
    temaElNew.innerHTML = '<option value="">Selecciona un tema</option>'; 

    // Agregar los temas al select
    if (Array.isArray(data)) {
      data.forEach((tema) => {
        const option = document.createElement('option');
        option.value = tema.tema;
        option.textContent = tema.tema;
        temaElNew.appendChild(option);
      });
    } else {
      console.warn('Los datos recibidos no son un array:', data);
    }
  } catch (e) {
    console.error('Error al cargar temas:', e);
    notify('Error al cargar los temas: ' + e.message, 'err');
  }

  // Mostrar o esconder el campo de nuevo tema según la selección
  temaElNew.addEventListener('change', () => {
    if (temaElNew.value === '') {
      newTemaSection.classList.remove('d-none');
    } else {
      newTemaSection.classList.add('d-none');
    }
  });

  // Cuando se hace clic en "OK", enviar la respuesta y el tema al backend
  document.getElementById('answerModalOk').addEventListener('click', async () => {
    const answer = inputEl.value.trim();
    const tema = temaElNew.value.trim() || newTemaInput.value.trim(); // Si no se selecciona un tema, tomar el nuevo tema

    if (answer && tema) {
      try {
        const res = await fetch('./backend/answer_question.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: questionId, answer: answer, tema: tema })
        });

        // Verificar si la respuesta es exitosa
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        // Verificar si la respuesta es JSON válido
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await res.text();
          console.error('Respuesta no es JSON:', text);
          throw new Error('El servidor no devolvió JSON válido');
        }

        const data = await res.json();
        if (data.status === 'ok') {
          notify('Respuesta guardada correctamente.', 'ok');
          hide('#answerModal'); // Cerrar el modal primero
          loadPending(); // Recargar las preguntas sin respuesta
        } else {
          notify('Error al guardar la respuesta: ' + (data.message || 'Error desconocido'), 'err');
        }
      } catch (error) {
        console.error('Error:', error);
        notify('Error de conexión: ' + error.message, 'err');
      }
    } else {
      notify('La respuesta y el tema son obligatorios.', 'err');
    }
  });

  // Cerrar modal cuando se haga clic en "Cancelar"
  document.getElementById('answerModalCancel').addEventListener('click', () => {
    hide('#answerModal');
  });

  // Cerrar modal cuando se haga clic en la "X"
  const closeButton = document.querySelector('#answerModal .modal-close');
  if (closeButton) {
    closeButton.addEventListener('click', () => {
      hide('#answerModal');
    });
  }

  // Cerrar modal cuando se haga clic en el overlay (fondo)
  const modalOverlay = document.getElementById('answerModal');
  modalOverlay.addEventListener('click', (e) => {
    // Solo cerrar si se hace clic en el overlay, no en el contenido del modal
    if (e.target === modalOverlay) {
      hide('#answerModal');
    }
  });

  // Cerrar modal con la tecla Escape
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      hide('#answerModal');
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);
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
  if (!correction || !lastPreguntaId) return;

  try {
    await fetch('./backend/saveCorrection.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pregunta_id: lastPreguntaId, respuesta: correction })
    });

    notify('Corrección guardada correctamente.', 'ok');
    document.getElementById('correctionInput').value = ''; // Limpiar el campo
  } catch (e) {
    notify('No se pudo guardar la corrección.', 'err');
  }
}
