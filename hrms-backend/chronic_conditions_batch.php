<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

try {
    $body       = json_decode(file_get_contents('php://input'), true);
    $employeeId = $body['employeeId']        ?? null;
    $conditions = $body['chronicConditions']  ?? null;

    if (!$employeeId || !is_array($conditions)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid request body']);
        exit();
    }

    $del = $pdo->prepare('DELETE FROM chronic_conditions WHERE employee_id = :eid');
    $del->execute([':eid' => $employeeId]);

    if (count($conditions) > 0) {
        $ins = $pdo->prepare(
            'INSERT INTO chronic_conditions
                (id, employee_id, condition_name, diagnosed_date, treatment_status, notes)
             VALUES (:id,:eid,:cn,:dd,:ts,:notes)'
        );
        foreach ($conditions as $c) {
            if (empty($c['conditionName'])) continue;
            $ins->execute([
                ':id'    => sprintf('%s-%s-%s-%s-%s', bin2hex(random_bytes(4)), bin2hex(random_bytes(2)), bin2hex(random_bytes(2)), bin2hex(random_bytes(2)), bin2hex(random_bytes(6))),
                ':eid'   => $employeeId,
                ':cn'    => $c['conditionName'],
                ':dd'    => !empty($c['diagnosedDate']) ? $c['diagnosedDate'] : null,
                ':ts'    => $c['treatmentStatus']       ?? 'active',
                ':notes' => !empty($c['notes'])         ? $c['notes']         : null,
            ]);
        }
    }

    http_response_code(201);
    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save chronic conditions']);
}
