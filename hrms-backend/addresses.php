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
                           address_type  AS addressType,
                           address_line1 AS addressLine1,
                           address_line2 AS addressLine2,
                           city, state,
                           postal_code   AS postalCode,
                           country,
                           created_at AS createdAt,
                           updated_at AS updatedAt
                    FROM addresses';
            if ($employeeId) {
                $stmt = $pdo->prepare($sql . ' WHERE employee_id = :eid');
                $stmt->execute([':eid' => $employeeId]);
            } else {
                $stmt = $pdo->prepare($sql);
                $stmt->execute();
            }
            http_response_code(200);
            echo json_encode($stmt->fetchAll());
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch addresses: ' . $e->getMessage()]);
        }
        break;

    case 'POST':
        try {
            $body = json_decode(file_get_contents('php://input'), true);
            if (!$body) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid JSON']);
                exit();
            }
            $id = sprintf('%s-%s-%s-%s-%s',
                bin2hex(random_bytes(4)), bin2hex(random_bytes(2)),
                bin2hex(random_bytes(2)), bin2hex(random_bytes(2)),
                bin2hex(random_bytes(6))
            );
            $stmt = $pdo->prepare(
                'INSERT INTO addresses
                    (id, employee_id, address_type, address_line1, address_line2,
                     city, state, postal_code, country)
                 VALUES
                    (:id, :eid, :at, :al1, :al2, :city, :state, :pc, :country)'
            );
            $stmt->execute([
                ':id'      => $id,
                ':eid'     => $body['employeeId'],
                ':at'      => $body['addressType'],
                ':al1'     => $body['addressLine1'],
                ':al2'     => $body['addressLine2'] ?? null,
                ':city'    => $body['city'],
                ':state'   => $body['state'],
                ':pc'      => $body['postalCode'],
                ':country' => $body['country'] ?? 'India',
            ]);
            http_response_code(201);
            echo json_encode(['success' => true, 'data' => ['id' => $id]]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create address: ' . $e->getMessage()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
