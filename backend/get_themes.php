<?php
header('Content-Type: application/json');
include('db.php');

try {
    // Consulta para obtener los temas existentes
    $query = "SELECT DISTINCT tema FROM preguntas_respuestas WHERE tema IS NOT NULL AND tema != ''";
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $temas = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Devolver los resultados en formato JSON
    echo json_encode($temas);
} catch (Exception $e) {
    echo json_encode(['error' => 'Error al obtener temas: ' . $e->getMessage()]);
}
?>
