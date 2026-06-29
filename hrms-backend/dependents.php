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
                http_response_code(400); echo json_encode(['error' => 'employeeId is required']); exit();
            }
            $stmt = $pdo->prepare(
                'SELECT id, employee_id AS employeeId, name, relationship,
                        date_of_birth AS dateOfBirth, occupation, contact_number AS contactNumber,
                        gender, is_dependent AS isDependent, aadhar_number AS aadharNumber,
                        created_at AS createdAt, updated_at AS updatedAt
                 FROM dependents WHERE employee_id = :eid'
            );
            $stmt->execute([':eid' => $employeeId]);
            $rows = $stmt->fetchAll();
            foreach ($rows as &$r) { $r['isDependent'] = (bool)$r['isDependent']; }
            unset($r);
            http_response_code(200);
            echo json_encode($rows);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch dependents']);
        }
        break;

    case 'POST':
        try {
            $body = json_decode(file_get_contents('php://input'), true);
            if (!$body) { http_response_code(400); echo json_encode(['error' => 'Invalid JSON']); exit(); }
            $id = sprintf('%s-%s-%s-%s-%s', bin2hex(random_bytes(4)), bin2hex(random_bytes(2)),
                          bin2hex(random_bytes(2)), bin2hex(random_bytes(2)), bin2hex(random_bytes(6)));
            $stmt = $pdo->prepare(
                'INSERT INTO dependents
                    (id, employee_id, name, relationship, date_of_birth,
                     occupation, contact_number, gender, is_dependent, aadhar_number)
                 VALUES (:id,:eid,:name,:rel,:dob,:occ,:cn,:gender,:isdep,:aadhar)'
            );
            $stmt->execute([
                ':id'     => $id,
                ':eid'    => $body['employeeId'],
                ':name'   => $body['name'],
                ':rel'    => $body['relationship'],
                ':dob'    => $body['dateOfBirth'],
                ':occ'    => $body['occupation']     ?? null,
                ':cn'     => $body['contactNumber']  ?? null,
                ':gender' => $body['gender']       ?? null,
                ':isdep'  => isset($body['isDependent']) ? (int)(bool)$body['isDependent'] : 1,
                ':aadhar' => $body['aadharNumber'] ?? null,
            ]);
            http_response_code(200);
            echo json_encode(['success' => true, 'data' => ['id' => $id]]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create dependent']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
