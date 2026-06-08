<?php
require_once 'config.php';

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents('php://input'), true);

if ($method === 'POST') {
    $action = $_GET['action'] ?? '';
    
    if ($action === 'login') {
        $username = $input['username'] ?? '';
        $password = md5($input['password'] ?? '');
        $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ? AND password = ?");
        $stmt->execute([$username, $password]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($user) {
            $_SESSION['user'] = [
                'id' => $user['id'],
                'username' => $user['username'],
                'role' => $user['role'],
                'fullName' => $user['fullName']
            ];
            echo json_encode(['success' => true, 'user' => $_SESSION['user']]);
        } else {
            http_response_code(401);
            echo json_encode(['error' => 'Jina au nenosiri si sahihi']);
        }
    }
    elseif ($action === 'register') {
        $id = 'u' . uniqid();
        $username = $input['username'];
        $password = md5($input['password']);
        $fullName = $input['fullName'];
        $role = 'client';
        try {
            $stmt = $pdo->prepare("INSERT INTO users (id, username, password, role, fullName) VALUES (?,?,?,?,?)");
            $stmt->execute([$id, $username, $password, $role, $fullName]);
            echo json_encode(['success' => true, 'message' => 'Umewasilishwa kwa mafanikio! Sasa ingia.']);
        } catch(PDOException $e) {
            http_response_code(400);
            echo json_encode(['error' => 'Jina la mtumiaji tayari lipo']);
        }
    }
    elseif ($action === 'session') {
        if (isset($_SESSION['user'])) {
            echo json_encode(['user' => $_SESSION['user']]);
        } else {
            echo json_encode(['user' => null]);
        }
    }
}
?>