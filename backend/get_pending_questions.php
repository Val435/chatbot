<?php
header('Content-Type: application/json');
include('db.php');

try {
    // Consulta para obtener las preguntas pendientes de la tabla preguntas_sin_respuesta
    $query = "SELECT id, pregunta FROM preguntas_sin_respuesta ORDER BY id DESC";
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $preguntas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Devolver los resultados en formato JSON
    echo json_encode($preguntas);
} catch (Exception $e) {
    echo json_encode(['error' => 'Error al obtener preguntas: ' . $e->getMessage()]);
}
?>
