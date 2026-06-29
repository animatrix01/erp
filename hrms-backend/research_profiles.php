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
                           orcid, scopus_id AS scopusId,
                           google_scholar_url AS googleScholarUrl,
                           researchgate_url AS researchgateUrl,
                           linkedin_url AS linkedinUrl,
                           personal_website AS personalWebsite,
                           created_at AS createdAt, updated_at AS updatedAt
                    FROM research_profiles';
            if ($employeeId) {
                $stmt = $pdo->prepare($sql . ' WHERE employee_id = :eid');
                $stmt->execute([':eid' => $employeeId]);
                $row = $stmt->fetch();
                http_response_code(200);
                echo json_encode($row ?: null);
            } else {
                $stmt = $pdo->prepare($sql);
                $stmt->execute();
                http_response_code(200);
                echo json_encode($stmt->fetchAll());
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $e->getMessage(), 'details' => $e->getTraceAsString()]);
        }
        break;

    case 'POST':
        try {
            $body = json_decode(file_get_contents('php://input'), true);
            if (!$body || empty($body['employeeId'])) {
                http_response_code(400);
                echo json_encode(['error' => 'employeeId required']);
                exit();
            }

            $check = $pdo->prepare('SELECT id FROM research_profiles WHERE employee_id = :eid');
            $check->execute([':eid' => $body['employeeId']]);
            $existing = $check->fetch();

            if ($existing) {
                $stmt = $pdo->prepare(
                    'UPDATE research_profiles
                     SET orcid              = :orcid,
                         scopus_id          = :scopus,
                         google_scholar_url = :gs,
                         researchgate_url   = :rg,
                         linkedin_url       = :li,
                         personal_website   = :web
                     WHERE employee_id = :eid'
                );
            } else {
                $stmt = $pdo->prepare(
                    'INSERT INTO research_profiles
                        (id, employee_id, orcid, scopus_id,
                         google_scholar_url, researchgate_url, linkedin_url, personal_website)
                     VALUES (:newid, :eid, :orcid, :scopus, :gs, :rg, :li, :web)'
                );
            }

            $params = [
                ':eid'   => $body['employeeId'],
                ':orcid' => !empty($body['orcid'])              ? $body['orcid']              : null,
                ':scopus'=> !empty($body['scopusId'])           ? $body['scopusId']           : null,
                ':gs'    => !empty($body['googleScholarUrl'])   ? $body['googleScholarUrl']   : null,
                ':rg'    => !empty($body['researchgateUrl'])    ? $body['researchgateUrl']    : null,
                ':li'    => !empty($body['linkedinUrl'])        ? $body['linkedinUrl']        : null,
                ':web'   => !empty($body['personalWebsite'])    ? $body['personalWebsite']    : null,
            ];

            if (!$existing) {
                $params[':newid'] = sprintf('%s-%s-%s-%s-%s', bin2hex(random_bytes(4)), bin2hex(random_bytes(2)), bin2hex(random_bytes(2)), bin2hex(random_bytes(2)), bin2hex(random_bytes(6)));
            }

            $stmt->execute($params);

            http_response_code(201);
            echo json_encode(['success' => true]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Database error: ' . $e->getMessage(), 'details' => $e->getTraceAsString()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
