<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
require_once 'db.php';

// File upload helper function
function handleCertificationFileUpload($fileKey) {
    if (!isset($_FILES[$fileKey]) || $_FILES[$fileKey]['error'] !== UPLOAD_ERR_OK) {
        return null;
    }

    $file = $_FILES[$fileKey];
    $uploadDir = __DIR__ . '/uploads/certifications/';
    
    // Create directory if it doesn't exist
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    // Generate unique filename
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = uniqid('cert_') . '_' . time() . '.' . $extension;
    $targetPath = $uploadDir . $filename;

    // Move uploaded file
    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        return 'uploads/certifications/' . $filename;
    }

    return null;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); echo json_encode(['error' => 'Method not allowed']); exit();
}

try {
    // Get employee ID from POST data
    $employeeId = $_POST['employeeId'] ?? null;

    if (!$employeeId) {
        http_response_code(400);
        echo json_encode(['error' => 'employeeId is required']);
        exit();
    }

    // Parse certifications array from POST
    // Frontend sends: certifications[0][certificationName], certifications[0][credentialUrl], etc.
    $certifications = [];
    $index = 0;
    while (isset($_POST["certifications"][$index]["certificationName"])) {
        $cert = $_POST["certifications"][$index];
        $certifications[] = [
            'certificationName'   => $cert['certificationName']   ?? '',
            'issuingOrganization' => $cert['issuingOrganization'] ?? '',
            'issueDate'           => $cert['issueDate']           ?? '',
            'expiryDate'          => $cert['expiryDate']          ?? null,
            'certificateNumber'   => $cert['certificateNumber']   ?? null,
            'credentialUrl'       => $cert['credentialUrl']       ?? null,
            'doesNotExpire'       => ($cert['doesNotExpire'] ?? '0') === '1' ? 1 : 0,
        ];
        $index++;
    }

    if (count($certifications) === 0) {
        http_response_code(400);
        echo json_encode(['error' => 'No certifications provided']);
        exit();
    }

    // Delete existing certifications for this employee
    $del = $pdo->prepare('DELETE FROM certifications WHERE employee_id = :eid');
    $del->execute([':eid' => $employeeId]);

    // Insert new certifications
    $ins = $pdo->prepare(
        'INSERT INTO certifications
            (id, employee_id, certification_name, issuing_organization,
             issue_date, expiry_date, certificate_number)
         VALUES (:id, :eid, :cn, :io, :idate, :ed, :cnum)'
    );

    foreach ($certifications as $idx => $c) {
        // If doesNotExpire is set, force expiryDate to NULL
        $expiryDate = $c['doesNotExpire'] ? null : (!empty($c['expiryDate']) ? $c['expiryDate'] : null);

        $ins->execute([
            ':id'    => sprintf('%s-%s-%s-%s-%s',
                bin2hex(random_bytes(4)), bin2hex(random_bytes(2)),
                bin2hex(random_bytes(2)), bin2hex(random_bytes(2)),
                bin2hex(random_bytes(6))),
            ':eid'   => $employeeId,
            ':cn'    => $c['certificationName'],
            ':io'    => $c['issuingOrganization'],
            ':idate' => $c['issueDate'],
            ':ed'    => $expiryDate,
            ':cnum'  => !empty($c['certificateNumber']) ? $c['certificateNumber'] : null,
        ]);
    }

    http_response_code(201);
    echo json_encode([
        'success' => true,
        'message' => 'Certifications saved successfully'
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage(), 'details' => $e->getTraceAsString()]);
}
