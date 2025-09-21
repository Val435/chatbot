<?php
include('db.php');

// Obtener los datos de la corrección desde la solicitud POST
$data = json_decode(file_get_contents("php://input"));
$questionId = $data->pregunta_id;
$correction = $data->respuesta;

// Actualizar la respuesta en la tabla `preguntas_respuestas`
$query = "UPDATE preguntas_respuestas SET respuesta = :respuesta WHERE id = :id";
$stmt = $pdo->prepare($query);
$stmt->bindParam(':respuesta', $correction);
$stmt->bindParam(':id', $questionId);
$stmt->execute();

// Devolver un status de éxito
echo json_encode(['status' => 'ok']);
?>
