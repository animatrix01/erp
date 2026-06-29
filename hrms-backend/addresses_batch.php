<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); echo json_encode(['error' => 'Method not allowed']); exit();
}

try {
    $body       = json_decode(file_get_contents('php://input'), true);
    $employeeId = $body['employeeId'] ?? null;
    $addrs      = $body['addresses']  ?? null;

    if (!$employeeId || !is_array($addrs)) {
        http_response_code(400); echo json_encode(['error' => 'Invalid request body']); exit();
    }

    $del = $pdo->prepare('DELETE FROM addresses WHERE employee_id = :eid');
    $del->execute([':eid' => $employeeId]);

    if (count($addrs) > 0) {
        $ins = $pdo->prepare(
            'INSERT INTO addresses
                (id, employee_id, address_type, address_line1, address_line2,
                 city, district, state, postal_code, country)
             VALUES (:id,:eid,:at,:al1,:al2,:city,:district,:state,:pc,:country)'
        );
        foreach ($addrs as $a) {
            $ins->execute([
                ':id'       => sprintf('%s-%s-%s-%s-%s', bin2hex(random_bytes(4)), bin2hex(random_bytes(2)), bin2hex(random_bytes(2)), bin2hex(random_bytes(2)), bin2hex(random_bytes(6))),
                ':eid'      => $employeeId,
                ':at'       => $a['addressType'],
                ':al1'      => $a['addressLine1'],
                ':al2'      => $a['addressLine2'] ?? null,
                ':city'     => $a['city'],
                ':district' => $a['district']     ?? null,
                ':state'    => $a['state'],
                ':pc'       => $a['postalCode'],
                ':country'  => $a['country'] ?? 'India',
            ]);
        }
    }

    http_response_code(201);
    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save addresses']);
}
