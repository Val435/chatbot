Proyecto: UI de Chatbot (solo Punto 1 del PDF)
=================================================
Arquitectura minimal para cumplir:
- Consulta (textarea + botón + respuesta readonly)
- Feedback (✓/✗ aparece tras responder)
- Glosario (lista + filtro por tema + buscador)
- Todo con AJAX (fetch) sin recargar.
- Estilos Bootstrap 5 + tema oscuro no-pastel.

Cómo usar:
1) Abre index.html en un servidor local (ej. VSCode Live Server).
2) Por defecto USE_MOCK=true (sin backend). Verás datos simulados.
3) Cuando tengas backend, edita js/common.js:
   - Cambia USE_MOCK=false
   - Ajusta rutas de API en const API

Endpoints esperados (formato):
- POST /backend/search.php   body: { pregunta }
  -> { status:'ok', answer, pregunta_id } | { status:'not_found', message }
- POST /backend/feedback.php body: { pregunta_id, es_correcta:boolean }
  -> { status:'ok' }
- GET  /backend/glossary.php -> { temas:string[], items:{id, pregunta, tema}[] }
