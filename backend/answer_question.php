<?php
header('Content-Type: application/json');
include('db.php');

try {
    // Obtener la pregunta, respuesta y tema desde la petición
    $input = file_get_contents("php://input");
    $data = json_decode($input);
    
    if (!$data || !isset($data->id) || !isset($data->answer) || !isset($data->tema)) {
        echo json_encode(['status' => 'error', 'message' => 'Datos incompletos']);
        exit;
    }
    
    $id = $data->id;
    $answer = $data->answer;
    $tema = $data->tema;

    // Primero, obtener la pregunta de la tabla preguntas_sin_respuesta
    $query = "SELECT pregunta FROM preguntas_sin_respuesta WHERE id = :id";
    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':id', $id);
    $stmt->execute();
    $pregunta_data = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$pregunta_data) {
        echo json_encode(['status' => 'error', 'message' => 'Pregunta no encontrada']);
        exit;
    }
    
    $pregunta = $pregunta_data['pregunta'];

    // Insertar la pregunta respondida en la tabla preguntas_respuestas
    $query = "INSERT INTO preguntas_respuestas (pregunta, respuesta, tema) VALUES (:pregunta, :respuesta, :tema)";
    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':pregunta', $pregunta);
    $stmt->bindParam(':respuesta', $answer);
    $stmt->bindParam(':tema', $tema);
    $stmt->execute();

    // Eliminar la pregunta de la tabla preguntas_sin_respuesta
    $query = "DELETE FROM preguntas_sin_respuesta WHERE id = :id";
    $stmt = $pdo->prepare($query);
    $stmt->bindParam(':id', $id);
    $stmt->execute();

    // Devolver estado
    echo json_encode(['status' => 'ok']);
    
} catch (Exception $e) {
    echo json_encode(['status' => 'error', 'message' => 'Error del servidor: ' . $e->getMessage()]);
}
?>
