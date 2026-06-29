<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

// Helper: generate UUID v4
function uuid(): string {
    return sprintf('%s-%s-%s-%s-%s',
        bin2hex(random_bytes(4)), bin2hex(random_bytes(2)),
        bin2hex(random_bytes(2)), bin2hex(random_bytes(2)),
        bin2hex(random_bytes(6)));
}

switch ($method) {

    // GET /qualifications.php?employeeId=<id>  OR  GET /qualifications.php
    case 'GET':
        try {
            $employeeId = $_GET['employeeId'] ?? null;
            if ($employeeId) {
                $stmt = $pdo->prepare(
                    'SELECT id, employee_id AS employeeId,
                            education_level AS educationLevel,
                            degree_name AS degreeName,
                            specialization, institution,
                            board_university AS boardUniversity,
                            score_type AS scoreType,
                            score_value AS scoreValue,
                            passing_year AS passingYear,
                            study_mode AS studyMode,
                            percentage, is_phd AS isPhd,
                            thesis_title AS thesisTitle,
                            research_guide AS researchGuide,
                            research_area AS researchArea,
                            viva_date AS vivaDate,
                            document_url AS documentUrl,
                            created_at AS createdAt, updated_at AS updatedAt
                     FROM qualifications WHERE employee_id = :eid'
                );
                $stmt->execute([':eid' => $employeeId]);
            } else {
                $stmt = $pdo->prepare(
                    'SELECT id, employee_id AS employeeId,
                            education_level AS educationLevel,
                            degree_name AS degreeName,
                            specialization, institution,
                            board_university AS boardUniversity,
                            score_type AS scoreType,
                            score_value AS scoreValue,
                            passing_year AS passingYear,
                            study_mode AS studyMode,
                            percentage, is_phd AS isPhd,
                            thesis_title AS thesisTitle,
                            research_guide AS researchGuide,
                            research_area AS researchArea,
                            viva_date AS vivaDate,
                            document_url AS documentUrl,
                            created_at AS createdAt, updated_at AS updatedAt
                     FROM qualifications'
                );
                $stmt->execute();
            }
            $rows = $stmt->fetchAll();
            // Cast numeric fields
            foreach ($rows as &$r) {
                $r['isPhd']       = (bool)$r['isPhd'];
                $r['passingYear'] = (int)$r['passingYear'];
                $r['percentage']  = $r['percentage'] !== null ? (float)$r['percentage'] : null;
            }
            unset($r);
            http_response_code(200);
            echo json_encode($rows);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $e->getMessage(), 'details' => $e->getTraceAsString()]);
        }
        break;

    // POST /qualifications.php  — single insert (used by old route)
    case 'POST':
        try {
            $body = json_decode(file_get_contents('php://input'), true);
            if (!$body || empty($body['employeeId']) || empty($body['degreeName'])) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid request']);
                exit();
            }
            $id = uuid();
            $stmt = $pdo->prepare(
                'INSERT INTO qualifications
                    (id, employee_id, degree_name, institution, passing_year, percentage, is_phd,
                     thesis_title, research_guide, research_area)
                 VALUES (:id,:eid,:dn,:inst,:py,:pct,:phd,:tt,:rg,:ra)'
            );
            $stmt->execute([
                ':id'   => $id,
                ':eid'  => $body['employeeId'],
                ':dn'   => $body['degreeName'],
                ':inst' => $body['institution'],
                ':py'   => $body['passingYear'],
                ':pct'  => array_key_exists('percentage', $body) && $body['percentage'] !== '' ? (float)$body['percentage'] : 0.00,
                ':phd'  => !empty($body['isPhd']) ? 1 : 0,
                ':tt'   => $body['thesisTitle']   ?? null,
                ':rg'   => $body['researchGuide'] ?? null,
                ':ra'   => $body['researchArea']  ?? null,
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
