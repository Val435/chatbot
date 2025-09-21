<?php
// Configuración de la conexión a la base de datos
$host = 'localhost'; // Cambia esto a tu servidor de base de datos
$db = 'chatbot'; // Nombre de la base de datos
$user = 'root'; // Tu usuario de base de datos
$pass = ''; // Tu contraseña de base de datos

// Crear la conexión
try {
    $pdo = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo "Error de conexión: " . $e->getMessage();
    die();
}
?>
