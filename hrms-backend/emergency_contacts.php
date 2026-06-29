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
                'SELECT id, employee_id AS employeeId, name, relationship, phone,
                        blood_group AS bloodGroup,
                        alternate_phone AS alternatePhone, email, address, priority,
                        contact_type AS contactType,
                        created_at AS createdAt, updated_at AS updatedAt
                 FROM emergency_contacts WHERE employee_id = :eid ORDER BY priority ASC'
            );
            $stmt->execute([':eid' => $employeeId]);
            $rows = $stmt->fetchAll();
            foreach ($rows as &$r) { $r['priority'] = (int)$r['priority']; }
            unset($r);
            http_response_code(200);
            echo json_encode($rows);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch emergency contacts']);
        }
        break;

    case 'POST':
        try {
            $body = json_decode(file_get_contents('php://input'), true);
            if (!$body) { http_response_code(400); echo json_encode(['error' => 'Invalid JSON']); exit(); }
            $id = sprintf('%s-%s-%s-%s-%s', bin2hex(random_bytes(4)), bin2hex(random_bytes(2)),
                          bin2hex(random_bytes(2)), bin2hex(random_bytes(2)), bin2hex(random_bytes(6)));
            $stmt = $pdo->prepare(
                'INSERT INTO emergency_contacts
                    (id, employee_id, name, relationship, phone, blood_group,
                     alternate_phone, email, address, priority, contact_type)
                 VALUES (:id,:eid,:name,:rel,:phone,:bg,:ap,:email,:addr,:pri,:ct)'
            );
            $stmt->execute([
                ':id'    => $id,
                ':eid'   => $body['employeeId'],
                ':name'  => $body['name'],
                ':rel'   => $body['relationship'],
                ':phone' => $body['phone'],
                ':bg'    => $body['bloodGroup']    ?? null,
                ':ap'    => $body['alternatePhone'] ?? null,
                ':email' => $body['email']          ?? null,
                ':addr'  => $body['address']        ?? null,
                ':pri'   => $body['priority']       ?? 1,
                ':ct'    => $body['contactType']    ?? 'general',
            ]);
            http_response_code(200);
            echo json_encode(['success' => true, 'data' => ['id' => $id]]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create emergency contact']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
