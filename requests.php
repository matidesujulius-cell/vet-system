<?php
require_once 'config.php';

if (!isset($_SESSION['user'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Not logged in']);
    exit;
}

$userId = $_SESSION['user']['id'];
$role = $_SESSION['user']['role'];
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    if ($role === 'admin') {
        $stmt = $pdo->query("SELECT r.*, s.name as serviceName, u.username as clientName FROM requests r JOIN services s ON r.serviceId = s.id JOIN users u ON r.userId = u.id ORDER BY r.createdAt DESC");
    } else {
        $stmt = $pdo->prepare("SELECT r.*, s.name as serviceName FROM requests r JOIN services s ON r.serviceId = s.id WHERE r.userId = ? ORDER BY r.createdAt DESC");
        $stmt->execute([$userId]);
    }
    $requests = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode($requests);
}
elseif ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = 'req_' . uniqid();
    $serviceId = $input['serviceId'];
    $animalType = $input['animalType'] ?? null;
    $notes = $input['notes'] ?? '';
    $stmt = $pdo->prepare("INSERT INTO requests (id, userId, serviceId, animalType, notes, status) VALUES (?,?,?,?,?, 'pending')");
    $stmt->execute([$id, $userId, $serviceId, $animalType, $notes]);
    echo json_encode(['success' => true]);
}
elseif ($method === 'PUT') {
    // Only admin can update status
    if ($role !== 'admin') {
        http_response_code(403);
        echo json_encode(['error' => 'Admin only']);
        exit;
    }
    $input = json_decode(file_get_contents('php://input'), true);
    $reqId = $input['id'];
    $status = $input['status'];
    $stmt = $pdo->prepare("UPDATE requests SET status = ? WHERE id = ?");
    $stmt->execute([$status, $reqId]);
    echo json_encode(['success' => true]);
}
elseif ($method === 'DELETE') {
    // Admin can delete any request; client can delete only their pending?
    if ($role !== 'admin') {
        http_response_code(403);
        echo json_encode(['error' => 'Admin only']);
        exit;
    }
    $reqId = $_GET['id'] ?? '';
    $stmt = $pdo->prepare("DELETE FROM requests WHERE id = ?");
    $stmt->execute([$reqId]);
    echo json_encode(['success' => true]);
}
?>