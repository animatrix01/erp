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

// ── File upload helper ────────────────────────────────────────────────────────
function handleQualDocUpload(string $fileKey): ?string {
    if (!isset($_FILES[$fileKey]) || $_FILES[$fileKey]['error'] !== UPLOAD_ERR_OK) {
        return null;
    }
    $file      = $_FILES[$fileKey];
    $uploadDir = __DIR__ . '/uploads/qualifications/';
    if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

    $ext      = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $filename = uniqid('qual_' . preg_replace('/[^a-z0-9]/', '_', strtolower($fileKey)) . '_') . '_' . time() . '.' . $ext;
    $dest     = $uploadDir . $filename;

    if (move_uploaded_file($file['tmp_name'], $dest)) {
        return 'uploads/qualifications/' . $filename;
    }
    return null;
}

try {
    // This endpoint now accepts multipart/form-data (for file uploads)
    // Frontend sends: employeeId, quals[level][field], qual_doc_<level>
    $employeeId = $_POST['employeeId'] ?? null;

    if (!$employeeId) {
        http_response_code(400);
        echo json_encode(['error' => 'employeeId is required']);
        exit();
    }

    // Valid tiers the frontend sends
    $VALID_LEVELS = ['10th', '12th', 'UG', 'PG', 'PhD'];

    // Build array of submitted qualifications
    $quals = [];
    foreach ($VALID_LEVELS as $level) {
        $q = $_POST['quals'][$level] ?? null;
        if (!$q || empty($q['institution'])) continue; // skip blank tiers

        // Attempt file upload for this tier
        $fileKey    = 'qual_doc_' . $level;
        $uploadedUrl = handleQualDocUpload($fileKey);

        $quals[] = [
            'level'          => $level,
            'degreeName'     => $q['degreeName']     ?? '',
            'specialization' => $q['specialization'] ?? null,
            'institution'    => $q['institution']    ?? '',
            'boardUniversity'=> $q['boardUniversity']?? null,
            'passingYear'    => !empty($q['passingYear'])  ? (int)$q['passingYear']  : null,
            'scoreType'      => $q['scoreType']      ?? null,
            'scoreValue'     => $q['scoreValue']     ?? null,
            'percentage'     => isset($q['percentage']) && $q['percentage'] !== '' ? (float)$q['percentage'] : null,
            'studyMode'      => $q['studyMode']      ?? null,
            'isPHD'          => $level === 'PhD'     ? 1 : 0,
            'thesisTitle'    => $q['thesisTitle']    ?? null,
            'researchGuide'  => $q['researchGuide']  ?? null,
            'researchArea'   => $q['researchArea']   ?? null,
            'vivaDate'       => !empty($q['vivaDate'])    ? $q['vivaDate']    : null,
            // Keep existing documentUrl if no new file was uploaded
            'documentUrl'    => $uploadedUrl ?? ($q['existingDocumentUrl'] ?? null),
        ];
    }

    // Delete existing qualifications for this employee then re-insert
    $del = $pdo->prepare('DELETE FROM qualifications WHERE employee_id = :eid');
    $del->execute([':eid' => $employeeId]);

    $uploadResults = [];
    if (count($quals) > 0) {
        $ins = $pdo->prepare(
            'INSERT INTO qualifications
                (id, employee_id, education_level, degree_name, specialization,
                 institution, board_university, score_type, score_value,
                 passing_year, study_mode, percentage, is_phd,
                 thesis_title, research_guide, research_area, viva_date, document_url)
             VALUES (:id,:eid,:level,:dn,:spec,:inst,:bu,:st,:sv,:py,:sm,:pct,:phd,:tt,:rg,:ra,:vd,:docUrl)'
        );
        foreach ($quals as $q) {
            $percentage = isset($q['percentage']) && $q['percentage'] !== null && $q['percentage'] !== ''
                ? (float)$q['percentage']
                : 0.00;

            $ins->execute([
                ':id'     => sprintf('%s-%s-%s-%s-%s',
                    bin2hex(random_bytes(4)), bin2hex(random_bytes(2)),
                    bin2hex(random_bytes(2)), bin2hex(random_bytes(2)),
                    bin2hex(random_bytes(6))),
                ':eid'    => $employeeId,
                ':level'  => $q['level'],
                ':dn'     => $q['degreeName'],
                ':spec'   => !empty($q['specialization'])  ? $q['specialization']  : null,
                ':inst'   => $q['institution'],
                ':bu'     => !empty($q['boardUniversity'])  ? $q['boardUniversity']  : null,
                ':st'     => !empty($q['scoreType'])        ? $q['scoreType']        : null,
                ':sv'     => !empty($q['scoreValue'])       ? $q['scoreValue']       : null,
                ':py'     => $q['passingYear'] ?? date('Y'),
                ':sm'     => !empty($q['studyMode'])        ? $q['studyMode']        : null,
                ':pct'    => $percentage,
                ':phd'    => $q['isPHD'],
                ':tt'     => !empty($q['thesisTitle'])      ? $q['thesisTitle']      : null,
                ':rg'     => !empty($q['researchGuide'])    ? $q['researchGuide']    : null,
                ':ra'     => !empty($q['researchArea'])     ? $q['researchArea']     : null,
                ':vd'     => !empty($q['vivaDate'])         ? $q['vivaDate']         : null,
                ':docUrl' => !empty($q['documentUrl'])      ? $q['documentUrl']      : null,
            ]);
            $uploadResults[$q['level']] = $q['documentUrl'];
        }
    }

    http_response_code(201);
    echo json_encode([
        'success'       => true,
        'savedCount'    => count($quals),
        'uploadedFiles' => $uploadResults,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage(), 'details' => $e->getTraceAsString()]);
}
