<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    case 'GET':
        try {
            $employeeId = $_GET['employeeId'] ?? null;
            $sql = 'SELECT id, employee_id AS employeeId,
                           organization_name AS organizationName, designation, department,
                           from_date AS fromDate, to_date AS toDate,
                           employment_type AS employmentType, is_current AS isCurrent,
                           total_experience_years AS totalExperienceYears,
                           created_at AS createdAt, updated_at AS updatedAt
                    FROM employment_history';
            if ($employeeId) {
                $stmt = $pdo->prepare($sql . ' WHERE employee_id = :eid');
                $stmt->execute([':eid' => $employeeId]);
            } else {
                $stmt = $pdo->prepare($sql);
                $stmt->execute();
            }
            $rows = $stmt->fetchAll();
            foreach ($rows as &$r) {
                $r['totalExperienceYears'] = $r['totalExperienceYears'] !== null ? (float)$r['totalExperienceYears'] : null;
                $r['isCurrent'] = (bool)$r['isCurrent'];
            }
            unset($r);
            http_response_code(200);
            echo json_encode($rows);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch employment history']);
        }
        break;

    case 'POST':
        try {
            $body = json_decode(file_get_contents('php://input'), true);
            if (!$body) { http_response_code(400); echo json_encode(['error' => 'Invalid JSON']); exit(); }
            $id = sprintf('%s-%s-%s-%s-%s', bin2hex(random_bytes(4)), bin2hex(random_bytes(2)), bin2hex(random_bytes(2)), bin2hex(random_bytes(2)), bin2hex(random_bytes(6)));
            $stmt = $pdo->prepare(
                'INSERT INTO employment_history
                    (id, employee_id, organization_name, designation, department,
                     from_date, to_date, employment_type, is_current, total_experience_years)
                 VALUES (:id,:eid,:org,:des,:dept,:fd,:td,:et,:ic,:tey)'
            );
            $stmt->execute([
                ':id'   => $id,
                ':eid'  => $body['employeeId'],
                ':org'  => $body['organizationName'],
                ':des'  => $body['designation'],
                ':dept' => $body['department'] ?? null,
                ':fd'   => $body['fromDate'],
                ':td'   => !empty($body['toDate']) ? $body['toDate'] : null,
                ':et'   => $body['employmentType'] ?? null,
                ':ic'   => !empty($body['isCurrent']) ? 1 : 0,
                ':tey'  => $body['totalExperienceYears'] ?? null,
            ]);
            http_response_code(201);
            echo json_encode(['success' => true, 'data' => ['id' => $id]]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create employment record']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
