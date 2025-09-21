<?php
include('db.php');

// Obtener los datos enviados (ID de la pregunta y si fue correcta o no)
$data = json_decode(file_get_contents("php://input"));
$questionId = $data->pregunta_id;
$isCorrect = $data->es_correcta;

// Guardar el feedback en la base de datos
$query = "INSERT INTO feedback (pregunta_id, es_correcta) VALUES (:pregunta_id, :es_correcta)";
$stmt = $pdo->prepare($query);
$stmt->bindParam(':pregunta_id', $questionId);
$stmt->bindParam(':es_correcta', $isCorrect);
$stmt->execute();

echo json_encode(['status' => 'ok']);
?>
