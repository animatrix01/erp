<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); echo json_encode(['error' => 'Method not allowed']); exit();
}

try {
    $body       = json_decode(file_get_contents('php://input'), true);
    $employeeId = $body['employeeId']   ?? null;
    $pubs       = $body['publications'] ?? null;

    if (!$employeeId || !is_array($pubs)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid request body']);
        exit();
    }

    $del = $pdo->prepare('DELETE FROM publications WHERE employee_id = :eid');
    $del->execute([':eid' => $employeeId]);

    if (count($pubs) > 0) {
        $ins = $pdo->prepare(
            'INSERT INTO publications
                (id, employee_id, publication_type, journal_title, authors,
                 publisher_venue, conference_details, doi, impact_factor,
                 publication_year, volume_issue_pages, citation_count)
             VALUES (:id,:eid,:pt,:jt,:auth,:pv,:cd,:doi,:if,:py,:vip,:cc)'
        );
        foreach ($pubs as $p) {
            $ins->execute([
                ':id'   => sprintf('%s-%s-%s-%s-%s', bin2hex(random_bytes(4)), bin2hex(random_bytes(2)), bin2hex(random_bytes(2)), bin2hex(random_bytes(2)), bin2hex(random_bytes(6))),
                ':eid'  => $employeeId,
                ':pt'   => $p['publicationType']   ?? null,
                ':jt'   => $p['journalTitle'],
                ':auth' => $p['authors']         ?? null,
                ':pv'   => $p['publisherVenue']    ?? null,
                ':cd'   => !empty($p['conferenceDetails']) ? $p['conferenceDetails'] : null,
                ':doi'  => !empty($p['doi']) ? $p['doi'] : null,
                ':if'   => $p['impactFactor']    ?? null,
                ':py'   => $p['publicationYear'] ?? null,
                ':vip'  => $p['volumeIssuePages'] ?? null,
                ':cc'   => $p['citationCount']   ?? null,
            ]);
        }
    }

    http_response_code(201);
    echo json_encode(['success' => true]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save publications']);
}
