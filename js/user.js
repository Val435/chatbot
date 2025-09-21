// user.js
// Lógica de la Interfaz de Usuario (consulta, feedback, glosario)

import { API, USE_MOCK, show, hide, requestJSON } from './common.js';

// Variable global temporal para recordar el último id de pregunta respondida
let lastPreguntaId = null;

// Variable global para almacenar todas las preguntas
let allQuestions = [];

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
  document.getElementById('filterTema').addEventListener('change', () => applyFilters(allQuestions));
  document.getElementById('searchGlossary').addEventListener('input', () => applyFilters(allQuestions));
});

// ---------------------------------------------------------------------------
// onSend(): procesa el envío de la pregunta del usuario
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// onSend(): procesa el envío de la pregunta del usuario
// ---------------------------------------------------------------------------
async function onSend() {
  const preguntaEl = document.getElementById('userQuestion');
  const answerEl = document.getElementById('systemAnswer');
  const loadingEl = document.getElementById('loading');
  const feedbackSection = document.getElementById('feedbackSection');

  // Tomamos la pregunta del textarea
  const pregunta = (preguntaEl.value || '').trim();
  if (!pregunta) return; // si está vacío, no hacemos nada

  // Reset de estado UI
  hide('#feedbackSection'); // Oculta feedback hasta que llegue respuesta
  answerEl.value = '';      // limpia la respuesta previa
  hide('#fbMsg');           // oculta mensaje de feedback
  loadingEl.classList.remove('d-none'); // muestra “cargando”

  try {
    // Primero, verificamos si la pregunta ya existe en la base de datos
    const res = await fetch('./backend/search_question.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pregunta })
    });

    const data = await res.json();
    loadingEl.classList.add('d-none'); // ocultar spinner

    if (data.status === 'ok') {
      // Si la pregunta tiene una respuesta en la base de datos
      answerEl.value = data.respuesta || '—';
      lastPreguntaId = data.pregunta_id ?? null;
      show('#feedbackSection'); // habilita los botones de feedback
    } else {
      // Si la pregunta no tiene respuesta, la guardamos en la tabla `preguntas_sin_respuesta`
      await fetch('./backend/save_question.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pregunta })
      });

      answerEl.value = 'Pregunta guardada. Un administrador la responderá pronto.';
      notify('Tu pregunta ha sido guardada y será respondida pronto', 'ok');
      hide('#feedbackSection'); // No mostrar feedback si no hay respuesta
    }
  } catch (e) {
    loadingEl.classList.add('d-none');
    answerEl.value = 'Error al consultar. Intenta de nuevo.';
    hide('#feedbackSection'); // No mostrar feedback si hay error
  }
}

// ---------------------------------------------------------------------------
// sendFeedback(): envía la valoración del usuario (✓ o ✗)
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// sendFeedback(): envía la valoración del usuario (✓ o ✗)
// ---------------------------------------------------------------------------
async function sendFeedback(ok) {
  const fbMsg = document.getElementById('fbMsg');
  const feedbackSection = document.getElementById('feedbackSection');
  const fbBtns = feedbackSection.querySelectorAll('button');
  
  // Si no hay id de pregunta y no estamos en modo mock, no hacemos nada
  if (!lastPreguntaId && !USE_MOCK) return;

  try {
    // Deshabilitar los botones de feedback
    fbBtns.forEach(btn => btn.disabled = true);

    // Enviar el feedback
    await requestJSON(API.feedback, 'POST', {
      pregunta_id: lastPreguntaId,
      es_correcta: !!ok,
    });

    // Mostrar el mensaje de confirmación (en lugar de los botones)
    fbMsg.textContent = ok ? '¡Gracias por tu feedback! Respuesta correcta.' : '¡Gracias por tu feedback! Respuesta incorrecta.';
    fbMsg.classList.remove('text-danger', 'text-muted');
    fbMsg.classList.add('text-white'); // Hacer el mensaje blanco

    // Opcionalmente, ocultar la sección de feedback o cambiar el estilo
    setTimeout(() => {
      hide('#feedbackSection');
    }, 2000); // El feedback desaparece después de 2 segundos
  } catch (_) {
    // Error al guardar feedback
    fbMsg.textContent = 'No se pudo guardar el feedback.';
    fbMsg.classList.remove('text-muted');
    fbMsg.classList.add('text-danger');
  }

  // Mostrar el mensaje de feedback
  show('#fbMsg');
  setTimeout(() => hide('#fbMsg'), 3000); // Mostrar el mensaje por 3 segundos
}


// ---------------------------------------------------------------------------
// loadGlossary(): carga y muestra las preguntas ya respondidas y filtra por tema
// ---------------------------------------------------------------------------
async function loadGlossary() {
  const list = document.getElementById('glossaryList');
  const filterTema = document.getElementById('filterTema');
  
  list.innerHTML = 'Cargando…'; // Mostrar "Cargando…" mientras se cargan las preguntas

  try {
    // Obtener los temas y preguntas desde el backend
    const res = await fetch('./backend/get_glossary.php');
    const data = await res.json();

    // Guardar las preguntas en la variable global
    allQuestions = data.preguntas;

    // Cargar los temas en el select
    filterTema.innerHTML = '<option value="">Todos</option>';  // Reseteamos el select
    data.temas.forEach((tema) => {
      if (tema.tema) { // Solo agregar temas que no sean null o vacíos
        const option = document.createElement('option');
        option.value = tema.tema;
        option.textContent = tema.tema;
        filterTema.appendChild(option);
      }
    });

    // Aplicar filtros iniciales (mostrar todas las preguntas)
    applyFilters(allQuestions);

  } catch (e) {
    console.error('Error al cargar glosario:', e);
    list.innerHTML = 'Error al cargar el glosario.';
  }
}

// Función separada para aplicar filtros
function applyFilters(allQuestions) {
  const filterTema = document.getElementById('filterTema');
  const searchInput = document.getElementById('searchGlossary');
  
  const selectedTema = filterTema.value;
  const searchText = searchInput.value.toLowerCase().trim();
  
  let filteredQuestions = allQuestions;
  
  // Filtrar por tema
  if (selectedTema) {
    filteredQuestions = filteredQuestions.filter((pregunta) => pregunta.tema === selectedTema);
  }
  
  // Filtrar por texto de búsqueda
  if (searchText) {
    filteredQuestions = filteredQuestions.filter((pregunta) => 
      pregunta.pregunta.toLowerCase().includes(searchText) ||
      (pregunta.respuesta && pregunta.respuesta.toLowerCase().includes(searchText))
    );
  }
  
  renderQuestions(filteredQuestions);
}

// Función para renderizar las preguntas en el glosario
function renderQuestions(questions) {
  const list = document.getElementById('glossaryList');
  list.innerHTML = ''; // Limpiar lista antes de renderizar las preguntas

  if (questions.length === 0) {
    list.innerHTML = '<li>No hay preguntas disponibles para este filtro.</li>';
    return;
  }

  questions.forEach((it) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div>
        <strong>${it.pregunta}</strong>
        ${it.tema ? `<small class="text-muted d-block"></small>` : ''}
      </div>
      <button class="btn btn-sm btn-accent">Usar</button>
    `;
    li.querySelector('button').addEventListener('click', () => {
      // Al hacer clic, poner la pregunta en el campo de "Pregunta"
      document.getElementById('userQuestion').value = it.pregunta;
      notify('Pregunta copiada al campo de consulta', 'ok');
    });
    list.appendChild(li);
  });
}

