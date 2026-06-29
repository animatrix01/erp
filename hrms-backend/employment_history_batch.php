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
    $employeeId = $body['employeeId']        ?? null;
    $records    = $body['employmentHistory'] ?? null;

    if (!$employeeId || !is_array($records)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid request body']);
        exit();
    }

    $del = $pdo->prepare('DELETE FROM employment_history WHERE employee_id = :eid');
    $del->execute([':eid' => $employeeId]);

    if (count($records) > 0) {
        $ins = $pdo->prepare(
            'INSERT INTO employment_history
                (id, employee_id, organization_name, designation, department,
                 from_date, to_date, employment_type, is_current, total_experience_years)
             VALUES (:id,:eid,:org,:des,:dept,:fd,:td,:et,:ic,:tey)'
        );
        foreach ($records as $r) {
            // Determine toDate: null when isCurrent=true OR toDate is absent/null/empty
            $isCurrent = !empty($r['isCurrent']);
            $toDate    = (!$isCurrent && !empty($r['toDate'])) ? $r['toDate'] : null;

            $ins->execute([
                ':id'   => sprintf('%s-%s-%s-%s-%s', bin2hex(random_bytes(4)), bin2hex(random_bytes(2)), bin2hex(random_bytes(2)), bin2hex(random_bytes(2)), bin2hex(random_bytes(6))),
                ':eid'  => $employeeId,
                ':org'  => $r['organizationName'],
                ':des'  => $r['designation'],
                ':dept' => $r['department'] ?? null,
                ':fd'   => $r['fromDate'],
                ':td'   => $toDate,
                ':et'   => $r['employmentType'] ?? null,
                ':ic'   => $isCurrent ? 1 : 0,
                ':tey'  => $r['totalExperienceYears'] ?? null,
            ]);
        }
    }

    http_response_code(201);
    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save employment history']);
}
