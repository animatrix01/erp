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
    $depsList   = $body['dependents'] ?? null;

    if (!$employeeId) {
        http_response_code(400); echo json_encode(['error' => 'employeeId is required']); exit();
    }

    $del = $pdo->prepare('DELETE FROM dependents WHERE employee_id = :eid');
    $del->execute([':eid' => $employeeId]);

    if (is_array($depsList) && count($depsList) > 0) {
        $ins = $pdo->prepare(
            'INSERT INTO dependents
                (id, employee_id, name, relationship, date_of_birth,
                 occupation, contact_number, gender, is_dependent, aadhar_number)
             VALUES (:id,:eid,:name,:rel,:dob,:occ,:cn,:gender,:isdep,:aadhar)'
        );
        foreach ($depsList as $d) {
            $ins->execute([
                ':id'     => sprintf('%s-%s-%s-%s-%s', bin2hex(random_bytes(4)), bin2hex(random_bytes(2)), bin2hex(random_bytes(2)), bin2hex(random_bytes(2)), bin2hex(random_bytes(6))),
                ':eid'    => $employeeId,
                ':name'   => $d['name'],
                ':rel'    => $d['relationship'],
                ':dob'    => $d['dateOfBirth'],
                ':occ'    => $d['occupation']    ?? null,
                ':cn'     => $d['contactNumber'] ?? null,
                ':gender' => $d['gender']       ?? null,
                ':isdep'  => isset($d['isDependent']) ? (int)(bool)$d['isDependent'] : 1,
                ':aadhar' => $d['aadharNumber'] ?? null,
            ]);
        }
    }

    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Dependents updated successfully']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage(), 'details' => $e->getTraceAsString()]);
}
