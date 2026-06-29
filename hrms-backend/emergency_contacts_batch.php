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
    $contacts   = $body['contacts']   ?? null;

    if (!$employeeId) {
        http_response_code(400); echo json_encode(['error' => 'employeeId is required']); exit();
    }

    $del = $pdo->prepare('DELETE FROM emergency_contacts WHERE employee_id = :eid');
    $del->execute([':eid' => $employeeId]);

    if (is_array($contacts) && count($contacts) > 0) {
        $ins = $pdo->prepare(
            'INSERT INTO emergency_contacts
                (id, employee_id, name, relationship, phone, blood_group,
                 alternate_phone, email, address, priority, contact_type)
             VALUES (:id,:eid,:name,:rel,:phone,:bg,:ap,:email,:addr,:pri,:ct)'
        );
        foreach ($contacts as $c) {
            $ins->execute([
                ':id'    => sprintf('%s-%s-%s-%s-%s', bin2hex(random_bytes(4)), bin2hex(random_bytes(2)), bin2hex(random_bytes(2)), bin2hex(random_bytes(2)), bin2hex(random_bytes(6))),
                ':eid'   => $employeeId,
                ':name'  => $c['name'],
                ':rel'   => $c['relationship'],
                ':phone' => $c['phone'],
                ':bg'    => $c['bloodGroup']     ?? null,
                ':ap'    => $c['alternatePhone'] ?? null,
                ':email' => $c['email']          ?? null,
                ':addr'  => $c['address']        ?? null,
                ':pri'   => $c['priority']       ?? 1,
                ':ct'    => $c['contactType']    ?? 'general',
            ]);
        }
    }

    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Emergency contacts updated successfully']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage(), 'details' => $e->getTraceAsString()]);
}
