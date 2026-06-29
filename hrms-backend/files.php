<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    case 'GET':
        try {
            $employeeId = $_GET['employeeId'] ?? null;
            $sql = 'SELECT id, employee_id AS employeeId, uploaded_by AS uploadedBy,
                           file_type AS fileType, file_name AS fileName,
                           file_path AS filePath, file_size AS fileSize,
                           mime_type AS mimeType, is_verified AS isVerified,
                           uploaded_at AS uploadedAt, created_at AS createdAt
                    FROM file_uploads';
            if ($employeeId) {
                $stmt = $pdo->prepare($sql . ' WHERE employee_id = :eid ORDER BY uploaded_at DESC');
                $stmt->execute([':eid' => $employeeId]);
            } else {
                $stmt = $pdo->prepare($sql . ' ORDER BY uploaded_at DESC');
                $stmt->execute();
            }
            $rows = $stmt->fetchAll();
            foreach ($rows as &$r) {
                $r['isVerified'] = (bool)$r['isVerified'];
                $r['fileSize']   = (int)$r['fileSize'];
            }
            unset($r);
            http_response_code(200);
            echo json_encode($rows);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch files']);
        }
        break;

    case 'DELETE':
        try {
            $fileId = $_GET['id'] ?? null;
            if (!$fileId) {
                http_response_code(400); echo json_encode(['error' => 'File ID required']); exit();
            }
            $stmt = $pdo->prepare('DELETE FROM file_uploads WHERE id = :id');
            $stmt->execute([':id' => $fileId]);
            http_response_code(200);
            echo json_encode(['success' => true]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete file']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
