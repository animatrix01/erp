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
                           publication_type AS publicationType,
                           journal_title AS journalTitle, authors,
                           publisher_venue AS publisherVenue,
                           conference_details AS conferenceDetails,
                           doi, impact_factor AS impactFactor,
                           publication_year AS publicationYear,
                           volume_issue_pages AS volumeIssuePages,
                           citation_count AS citationCount,
                           created_at AS createdAt, updated_at AS updatedAt
                    FROM publications';
            if ($employeeId) {
                $stmt = $pdo->prepare($sql . ' WHERE employee_id = :eid');
                $stmt->execute([':eid' => $employeeId]);
            } else {
                $stmt = $pdo->prepare($sql);
                $stmt->execute();
            }
            $rows = $stmt->fetchAll();
            foreach ($rows as &$r) {
                $r['impactFactor']    = $r['impactFactor']    !== null ? (float)$r['impactFactor']    : null;
                $r['publicationYear'] = $r['publicationYear'] !== null ? (int)$r['publicationYear']   : null;
                $r['citationCount']   = $r['citationCount']   !== null ? (int)$r['citationCount']     : 0;
            }
            unset($r);
            http_response_code(200);
            echo json_encode($rows);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch publications']);
        }
        break;

    case 'POST':
        try {
            $body = json_decode(file_get_contents('php://input'), true);
            if (!$body) { http_response_code(400); echo json_encode(['error' => 'Invalid JSON']); exit(); }
            $id = sprintf('%s-%s-%s-%s-%s', bin2hex(random_bytes(4)), bin2hex(random_bytes(2)), bin2hex(random_bytes(2)), bin2hex(random_bytes(2)), bin2hex(random_bytes(6)));
            $stmt = $pdo->prepare(
                'INSERT INTO publications
                    (id, employee_id, publication_type, journal_title, authors,
                     publisher_venue, conference_details, doi, impact_factor,
                     publication_year, volume_issue_pages, citation_count)
                 VALUES (:id,:eid,:pt,:jt,:auth,:pv,:cd,:doi,:if,:py,:vip,:cc)'
            );
            $stmt->execute([
                ':id'   => $id,
                ':eid'  => $body['employeeId'],
                ':pt'   => $body['publicationType']   ?? null,
                ':jt'   => $body['journalTitle'],
                ':auth' => $body['authors']           ?? null,
                ':pv'   => $body['publisherVenue']    ?? null,
                ':cd'   => $body['conferenceDetails'] ?? null,
                ':doi'  => !empty($body['doi']) ? $body['doi'] : null,
                ':if'   => $body['impactFactor']    ?? null,
                ':py'   => $body['publicationYear'] ?? null,
                ':vip'  => $body['volumeIssuePages'] ?? null,
                ':cc'   => $body['citationCount']   ?? 0,
            ]);
            http_response_code(201);
            echo json_encode(['success' => true, 'data' => ['id' => $id]]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create publication']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
