-- 1. Crear la base de datos
CREATE DATABASE chatbot;
USE chatbot;

-- 2. Crear la tabla `preguntas_respuestas`
CREATE TABLE preguntas_respuestas (
  id INT AUTO_INCREMENT PRIMARY KEY,                -- ID de la pregunta (clave primaria)
  pregunta TEXT NOT NULL,     feedback                       -- Pregunta que el usuario hace
  respuesta TEXT NOT NULL,                           -- Respuesta del chatbot
  tema VARCHAR(255),                                 -- Tema de la pregunta (opcional)
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP, -- Fecha de creación de la respuesta
  activa BOOLEAN DEFAULT TRUE                       -- Estado de la respuesta (si está activa o no)
);

-- 3. Crear la tabla `preguntas_sin_respuesta`
CREATE TABLE preguntas_sin_respuesta (
  id INT AUTO_INCREMENT PRIMARY KEY,                -- ID de la pregunta (clave primaria)
  pregunta TEXT NOT NULL,                            -- La pregunta sin respuesta
  fecha_consulta DATETIME DEFAULT CURRENT_TIMESTAMP, -- Fecha en la que fue consultada
  respondida BOOLEAN DEFAULT FALSE                  -- Si la pregunta fue respondida por un admin o no
);

-- 4. Crear la tabla `feedback`
CREATE TABLE feedback (
  id INT AUTO_INCREMENT PRIMARY KEY,                -- ID del feedback
  pregunta_id INT,                                  -- ID de la pregunta (clave foránea hacia `preguntas_respuestas`)
  es_correcta BOOLEAN,                              -- Si la respuesta fue correcta (true) o incorrecta (false)
  fecha_feedback DATETIME DEFAULT CURRENT_TIMESTAMP, -- Fecha del feedback
  ip_usuario VARCHAR(255),                          -- IP del usuario que dio el feedback
  FOREIGN KEY (pregunta_id) REFERENCES preguntas_respuestas(id) -- Relación con la tabla preguntas_respuestas
);

-- 5. Crear la tabla `usuarios` (para el login de admins)
CREATE TABLE usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,                -- ID del usuario (clave primaria)
  username VARCHAR(255) NOT NULL UNIQUE,             -- Nombre de usuario (único)
  password VARCHAR(255) NOT NULL,                    -- Contraseña (puedes usar hash aquí)
  rol VARCHAR(50) DEFAULT 'admin',                  -- Rol del usuario (por ejemplo: admin)
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP -- Fecha de creación del usuario
);
