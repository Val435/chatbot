<?php
include('db.php');

// Obtener la pregunta desde la petición
$data = json_decode(file_get_contents("php://input"));
$pregunta = $data->pregunta;

// Insertar la pregunta en la tabla preguntas_sin_respuesta
$query = "INSERT INTO preguntas_sin_respuesta (pregunta) VALUES (:pregunta)";
$stmt = $pdo->prepare($query);
$stmt->bindParam(':pregunta', $pregunta);
$stmt->execute();

echo json_encode(['status' => 'ok']);
?>
