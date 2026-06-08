<?php
require_once 'config.php';

function checkAdmin() {
    if (!isset($_SESSION['user']) || $_SESSION['user']['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['error' => 'Admin rights required']);
        exit;
    }
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    $stmt = $pdo->query("SELECT * FROM services ORDER BY id");
    $services = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($services);
}
elseif ($method === 'POST') {
    checkAdmin();
    $input = json_decode(file_get_contents('php://input'), true);
    $id = 's' . uniqid();
    $name = $input['name'];
    $stmt = $pdo->prepare("INSERT INTO services (id, name) VALUES (?,?)");
    $stmt->execute([$id, $name]);
    echo json_encode(['success' => true]);
}
elseif ($method === 'PUT') {
    checkAdmin();
    $input = json_decode(file_get_contents('php://input'), true);
    $id = $input['id'];
    $name = $input['name'];
    $stmt = $pdo->prepare("UPDATE services SET name = ? WHERE id = ?");
    $stmt->execute([$name, $id]);
    echo json_encode(['success' => true]);
}
elseif ($method === 'DELETE') {
    checkAdmin();
    $id = $_GET['id'] ?? '';
    $stmt = $pdo->prepare("DELETE FROM services WHERE id = ?");
    $stmt->execute([$id]);
    echo json_encode(['success' => true]);
}
?>