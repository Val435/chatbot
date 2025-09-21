<?php
include('db.php');

// Recibir datos del login
$data = json_decode(file_get_contents("php://input"));
$username = $data->username ?? '';
$password = $data->password ?? '';

// Consulta segura
$query = "SELECT * FROM usuarios WHERE username = :username";
$stmt = $pdo->prepare($query);
$stmt->bindParam(':username', $username);
$stmt->execute();
$user = $stmt->fetch(PDO::FETCH_ASSOC);

// Verificar la contraseña hasheada
if ($user && password_verify($password, $user['password'])) {
    echo json_encode(['status' => 'ok', 'user' => $user]);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Usuario o contraseña incorrectos']);
}
?>
