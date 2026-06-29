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
                           certification_name AS certificationName,
                           issuing_organization AS issuingOrganization,
                           issue_date AS issueDate, expiry_date AS expiryDate,
                           certificate_number AS certificateNumber,
                           created_at AS createdAt, updated_at AS updatedAt
                    FROM certifications';
            if ($employeeId) {
                $stmt = $pdo->prepare($sql . ' WHERE employee_id = :eid');
                $stmt->execute([':eid' => $employeeId]);
            } else {
                $stmt = $pdo->prepare($sql);
                $stmt->execute();
            }
            $rows = $stmt->fetchAll();
            http_response_code(200);
            echo json_encode($rows);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $e->getMessage(), 'details' => $e->getTraceAsString()]);
        }
        break;

    case 'POST':
        try {
            $body = json_decode(file_get_contents('php://input'), true);
            if (!$body) { http_response_code(400); echo json_encode(['error' => 'Invalid JSON']); exit(); }
            $id = sprintf('%s-%s-%s-%s-%s', bin2hex(random_bytes(4)), bin2hex(random_bytes(2)), bin2hex(random_bytes(2)), bin2hex(random_bytes(2)), bin2hex(random_bytes(6)));
            $stmt = $pdo->prepare(
                'INSERT INTO certifications
                    (id, employee_id, certification_name, issuing_organization,
                     issue_date, expiry_date, certificate_number)
                 VALUES (:id,:eid,:cn,:io,:id2,:ed,:cnum)'
            );
            $stmt->execute([
                ':id'   => $id,
                ':eid'  => $body['employeeId'],
                ':cn'   => $body['certificationName'],
                ':io'   => $body['issuingOrganization'],
                ':id2'  => $body['issueDate'],
                ':ed'   => !empty($body['expiryDate'])       ? $body['expiryDate']       : null,
                ':cnum' => !empty($body['certificateNumber']) ? $body['certificateNumber'] : null,
            ]);
            http_response_code(201);
            echo json_encode(['success' => true, 'data' => ['id' => $id]]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $e->getMessage(), 'details' => $e->getTraceAsString()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
