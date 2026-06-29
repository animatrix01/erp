<?php

// =============================================================================
// CORS Headers — must be sent before any output
// =============================================================================
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle CORS preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// =============================================================================
// Database connection — provides $pdo
// =============================================================================
require_once 'db.php';

// =============================================================================
// Route by HTTP method
// =============================================================================
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    // -------------------------------------------------------------------------
    // GET — fetch all departments, optionally filtered by isActive=true
    // Original: GET /api/departments?isActive=true
    // -------------------------------------------------------------------------
    case 'GET':
        try {
            $isActive = isset($_GET['isActive']) ? $_GET['isActive'] : null;

            if ($isActive === 'true') {
                $stmt = $pdo->prepare(
                    'SELECT * FROM departments WHERE is_active = 1'
                );
                $stmt->execute();
            } else {
                $stmt = $pdo->prepare('SELECT * FROM departments');
                $stmt->execute();
            }

            $result = $stmt->fetchAll();

            // Cast is_active from string "1"/"0" to boolean to match JS response
            foreach ($result as &$row) {
                $row['is_active'] = (bool) $row['is_active'];
            }
            unset($row);

            http_response_code(200);
            echo json_encode($result);

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch departments']);
        }
        break;

    // -------------------------------------------------------------------------
    // POST — create a new department
    // Original: POST /api/departments  body: { departmentCode, departmentName,
    //           description, parentDepartmentId, headOfDepartment, isActive }
    // -------------------------------------------------------------------------
    case 'POST':
        try {
            $body = json_decode(file_get_contents('php://input'), true);

            if (!$body) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid JSON body']);
                exit();
            }

            // Generate UUID v4
            $id = sprintf('%s-%s-%s-%s-%s',
                bin2hex(random_bytes(4)),
                bin2hex(random_bytes(2)),
                bin2hex(random_bytes(2)),
                bin2hex(random_bytes(2)),
                bin2hex(random_bytes(6))
            );

            $isActive = isset($body['isActive']) ? (int)(bool)$body['isActive'] : 1;

            $stmt = $pdo->prepare(
                'INSERT INTO departments
                    (id, department_code, department_name, description,
                     parent_department_id, head_of_department, is_active)
                 VALUES
                    (:id, :departmentCode, :departmentName, :description,
                     :parentDepartmentId, :headOfDepartment, :isActive)'
            );

            $stmt->execute([
                ':id'                 => $id,
                ':departmentCode'     => $body['departmentCode']     ?? null,
                ':departmentName'     => $body['departmentName']     ?? null,
                ':description'        => $body['description']        ?? null,
                ':parentDepartmentId' => !empty($body['parentDepartmentId']) ? $body['parentDepartmentId'] : null,
                ':headOfDepartment'   => !empty($body['headOfDepartment'])   ? $body['headOfDepartment']   : null,
                ':isActive'           => $isActive,
            ]);

            http_response_code(200);
            echo json_encode(['success' => true, 'data' => ['id' => $id]]);

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create department']);
        }
        break;

    // -------------------------------------------------------------------------
    // PUT — update an existing department
    // Original: PUT /api/departments  body: { id, departmentCode, ... }
    // -------------------------------------------------------------------------
    case 'PUT':
        try {
            $body = json_decode(file_get_contents('php://input'), true);

            if (!$body) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid JSON body']);
                exit();
            }

            $id = $body['id'] ?? null;

            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Department ID is required']);
                exit();
            }

            $stmt = $pdo->prepare(
                'UPDATE departments
                 SET department_code      = :departmentCode,
                     department_name      = :departmentName,
                     description          = :description,
                     parent_department_id = :parentDepartmentId,
                     head_of_department   = :headOfDepartment,
                     is_active            = :isActive
                 WHERE id = :id'
            );

            $stmt->execute([
                ':id'                 => $id,
                ':departmentCode'     => $body['departmentCode']     ?? null,
                ':departmentName'     => $body['departmentName']     ?? null,
                ':description'        => $body['description']        ?? null,
                ':parentDepartmentId' => !empty($body['parentDepartmentId']) ? $body['parentDepartmentId'] : null,
                ':headOfDepartment'   => !empty($body['headOfDepartment'])   ? $body['headOfDepartment']   : null,
                ':isActive'           => isset($body['isActive']) ? (int)(bool)$body['isActive'] : 1,
            ]);

            http_response_code(200);
            echo json_encode(['success' => true]);

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update department']);
        }
        break;

    // -------------------------------------------------------------------------
    // DELETE — soft delete (sets is_active = 0, does NOT remove the row)
    // Original: DELETE /api/departments?id=<uuid>
    // -------------------------------------------------------------------------
    case 'DELETE':
        try {
            $id = $_GET['id'] ?? null;

            if (!$id) {
                http_response_code(400);
                echo json_encode(['error' => 'Department ID is required']);
                exit();
            }

            $stmt = $pdo->prepare(
                'UPDATE departments SET is_active = 0 WHERE id = :id'
            );
            $stmt->execute([':id' => $id]);

            http_response_code(200);
            echo json_encode(['success' => true]);

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete department']);
        }
        break;

    // -------------------------------------------------------------------------
    // Unsupported method
    // -------------------------------------------------------------------------
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        break;
}
