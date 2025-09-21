<?php
include('db.php');

// Obtener la pregunta desde la petición
$data = json_decode(file_get_contents("php://input"));
$pregunta = $data->pregunta;

// Consulta para verificar si la pregunta ya existe en la base de datos
$query = "SELECT * FROM preguntas_respuestas WHERE pregunta LIKE :pregunta LIMIT 1";
$stmt = $pdo->prepare($query);
$stmt->bindParam(':pregunta', $pregunta);
$stmt->execute();
$preguntaData = $stmt->fetch(PDO::FETCH_ASSOC);

if ($preguntaData) {
    // Si existe, devolver la respuesta
    echo json_encode(['status' => 'ok', 'respuesta' => $preguntaData['respuesta']]);
} else {
    // Si no existe, devolver un status para insertar la pregunta
    echo json_encode(['status' => 'not_found']);
}
?>
