<?php
header('Content-Type: application/json');
include('db.php');

try {
    // Consulta para obtener los temas únicos de preguntas respondidas
    $query = "SELECT DISTINCT tema FROM preguntas_respuestas WHERE tema IS NOT NULL AND tema != '' AND respuesta IS NOT NULL AND respuesta != ''";
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $temas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Consulta para obtener las preguntas y respuestas (solo las que tienen respuesta)
    $query = "SELECT pregunta, respuesta, tema FROM preguntas_respuestas WHERE respuesta IS NOT NULL AND respuesta != '' ORDER BY id DESC";
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $preguntas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Devolver los resultados en formato JSON
    echo json_encode(['temas' => $temas, 'preguntas' => $preguntas]);
} catch (Exception $e) {
    echo json_encode(['error' => 'Error al obtener glosario: ' . $e->getMessage()]);
}
?>
