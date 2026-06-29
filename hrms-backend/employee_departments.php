<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    case 'GET':
        try {
            $employeeId   = $_GET['employeeId']   ?? null;
            $departmentId = $_GET['departmentId'] ?? null;
            $isCurrent    = $_GET['isCurrent']    ?? null;

            $sql    = 'SELECT id, employee_id AS employeeId, department_id AS departmentId,
                              designation, joining_date AS joiningDate,
                              relieving_date AS relievingDate, is_current AS isCurrent,
                              created_at AS createdAt, updated_at AS updatedAt
                       FROM employee_departments WHERE 1=1';
            $params = [];

            if ($employeeId)   { $sql .= ' AND employee_id   = :eid'; $params[':eid'] = $employeeId; }
            if ($departmentId) { $sql .= ' AND department_id = :did'; $params[':did'] = $departmentId; }
            if ($isCurrent === 'true') { $sql .= ' AND is_current = 1'; }

            $stmt = $pdo->prepare($sql);
            $stmt->execute($params);
            $rows = $stmt->fetchAll();
            foreach ($rows as &$r) { $r['isCurrent'] = (bool)$r['isCurrent']; }
            unset($r);
            http_response_code(200);
            echo json_encode($rows);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch employee departments']);
        }
        break;

    case 'POST':
        try {
            $body = json_decode(file_get_contents('php://input'), true);
            if (!$body) { http_response_code(400); echo json_encode(['error' => 'Invalid JSON']); exit(); }

            // If marking as current, clear other current assignments for this employee
            if (!empty($body['isCurrent'])) {
                $clr = $pdo->prepare('UPDATE employee_departments SET is_current = 0 WHERE employee_id = :eid');
                $clr->execute([':eid' => $body['employeeId']]);
            }

            $id = sprintf('%s-%s-%s-%s-%s', bin2hex(random_bytes(4)), bin2hex(random_bytes(2)),
                          bin2hex(random_bytes(2)), bin2hex(random_bytes(2)), bin2hex(random_bytes(6)));
            $stmt = $pdo->prepare(
                'INSERT INTO employee_departments
                    (id, employee_id, department_id, designation,
                     joining_date, relieving_date, is_current)
                 VALUES (:id,:eid,:did,:des,:jd,:rd,:ic)'
            );
            $stmt->execute([
                ':id'  => $id,
                ':eid' => $body['employeeId'],
                ':did' => $body['departmentId'],
                ':des' => $body['designation']    ?? null,
                ':jd'  => $body['joiningDate'],
                ':rd'  => $body['relievingDate']  ?? null,
                ':ic'  => isset($body['isCurrent']) ? (int)(bool)$body['isCurrent'] : 1,
            ]);
            http_response_code(200);
            echo json_encode(['success' => true, 'data' => ['id' => $id]]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to assign employee to department']);
        }
        break;

    case 'PUT':
        try {
            $body = json_decode(file_get_contents('php://input'), true);
            $id   = $body['id'] ?? null;
            if (!$id) { http_response_code(400); echo json_encode(['error' => 'Assignment ID is required']); exit(); }
            $stmt = $pdo->prepare(
                'UPDATE employee_departments
                 SET designation    = :des,
                     joining_date   = :jd,
                     relieving_date = :rd,
                     is_current     = :ic
                 WHERE id = :id'
            );
            $stmt->execute([
                ':id'  => $id,
                ':des' => $body['designation']   ?? null,
                ':jd'  => $body['joiningDate'],
                ':rd'  => $body['relievingDate'] ?? null,
                ':ic'  => isset($body['isCurrent']) ? (int)(bool)$body['isCurrent'] : 1,
            ]);
            http_response_code(200);
            echo json_encode(['success' => true]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update employee department']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
