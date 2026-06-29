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
            if (!$employeeId) {
                http_response_code(400);
                echo json_encode(['error' => 'employeeId is required']);
                exit();
            }
            $stmt = $pdo->prepare(
                'SELECT id, employee_id AS employeeId,
                        condition_name AS conditionName,
                        diagnosed_date AS diagnosedDate,
                        treatment_status AS treatmentStatus,
                        notes,
                        created_at AS createdAt, updated_at AS updatedAt
                 FROM chronic_conditions WHERE employee_id = :eid'
            );
            $stmt->execute([':eid' => $employeeId]);
            http_response_code(200);
            echo json_encode($stmt->fetchAll());
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch chronic conditions']);
        }
        break;

    case 'POST':
        try {
            $body = json_decode(file_get_contents('php://input'), true);
            if (!$body || empty($body['employeeId']) || empty($body['conditionName'])) {
                http_response_code(400);
                echo json_encode(['error' => 'employeeId and conditionName required']);
                exit();
            }
            $id = sprintf('%s-%s-%s-%s-%s', bin2hex(random_bytes(4)), bin2hex(random_bytes(2)), bin2hex(random_bytes(2)), bin2hex(random_bytes(2)), bin2hex(random_bytes(6)));
            $stmt = $pdo->prepare(
                'INSERT INTO chronic_conditions
                    (id, employee_id, condition_name, diagnosed_date, treatment_status, notes)
                 VALUES (:id,:eid,:cn,:dd,:ts,:notes)'
            );
            $stmt->execute([
                ':id'     => $id,
                ':eid'    => $body['employeeId'],
                ':cn'     => $body['conditionName'],
                ':dd'     => !empty($body['diagnosedDate'])    ? $body['diagnosedDate']    : null,
                ':ts'     => $body['treatmentStatus']          ?? 'active',
                ':notes'  => !empty($body['notes'])            ? $body['notes']            : null,
            ]);
            http_response_code(201);
            echo json_encode(['success' => true, 'data' => ['id' => $id]]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create chronic condition']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
