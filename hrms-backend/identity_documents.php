<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

// File upload helper function
function handleFileUpload($fileKey) {
    if (!isset($_FILES[$fileKey]) || $_FILES[$fileKey]['error'] !== UPLOAD_ERR_OK) {
        return null;
    }

    $file = $_FILES[$fileKey];
    $uploadDir = __DIR__ . '/uploads/documents/';
    
    // Create directory if it doesn't exist
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    // Generate unique filename
    $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
    $filename = uniqid($fileKey . '_') . '.' . $extension;
    $targetPath = $uploadDir . $filename;

    // Move uploaded file
    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        return 'uploads/documents/' . $filename;
    }

    return null;
}

switch ($method) {

    // GET /identity_documents.php?employeeId=<id>
    case 'GET':
        try {
            $employeeId = $_GET['employeeId'] ?? null;
            $sql = 'SELECT id, employee_id AS employeeId,
                           aadhar_number AS aadharNumber,
                           pan_number AS panNumber,
                           passport_number AS passportNumber,
                           passport_expiry_date AS passportExpiryDate,
                           driving_license_number AS drivingLicenseNumber,
                           voter_id AS voterId,
                           aadhar_file_path AS aadharFilePath,
                           pan_file_path AS panFilePath,
                           passport_file_path AS passportFilePath,
                           voter_id_file_path AS voterIdFilePath,
                           driving_license_file_path AS drivingLicenseFilePath,
                           aadhar_status AS aadharStatus,
                           pan_status AS panStatus,
                           passport_status AS passportStatus,
                           voter_id_status AS voterIdStatus,
                           driving_license_status AS drivingLicenseStatus,
                           created_at AS createdAt,
                           updated_at AS updatedAt
                    FROM identity_documents';
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
            echo json_encode(['error' => 'Failed to fetch identity documents', 'details' => $e->getMessage()]);
        }
        break;

    // POST /identity_documents.php
    case 'POST':
        try {
            // Get form data from POST
            $employeeId = $_POST['employeeId'] ?? null;
            if (!$employeeId) {
                http_response_code(400);
                echo json_encode(['error' => 'employeeId is required']);
                exit();
            }

            // Check if record exists
            $check = $pdo->prepare('SELECT id FROM identity_documents WHERE employee_id = :eid');
            $check->execute([':eid' => $employeeId]);
            $existing = $check->fetch();

            // Handle file uploads
            $aadharFile = handleFileUpload('aadharFile');
            $panFile = handleFileUpload('panFile');
            $passportFile = handleFileUpload('passportFile');
            $voterIdFile = handleFileUpload('voterIdFile');
            $drivingLicenseFile = handleFileUpload('drivingLicenseFile');

            if ($existing) {
                // UPDATE existing record
                $sql = 'UPDATE identity_documents SET
                           aadhar_number = :aadhar,
                           pan_number = :pan,
                           passport_number = :passport,
                           passport_expiry_date = :passportExpiry,
                           driving_license_number = :drivingLicense,
                           voter_id = :voterId,
                           aadhar_status = :aadharStatus,
                           pan_status = :panStatus,
                           passport_status = :passportStatus,
                           voter_id_status = :voterIdStatus,
                           driving_license_status = :drivingLicenseStatus';
                
                // Only update file paths if new files were uploaded
                if ($aadharFile) $sql .= ', aadhar_file_path = :aadharFile';
                if ($panFile) $sql .= ', pan_file_path = :panFile';
                if ($passportFile) $sql .= ', passport_file_path = :passportFile';
                if ($voterIdFile) $sql .= ', voter_id_file_path = :voterIdFile';
                if ($drivingLicenseFile) $sql .= ', driving_license_file_path = :drivingLicenseFile';
                
                $sql .= ' WHERE employee_id = :employeeId';
                
                $stmt = $pdo->prepare($sql);
                $params = [
                    ':employeeId' => $employeeId,
                    ':aadhar' => $_POST['aadharNumber'] ?? null,
                    ':pan' => $_POST['panNumber'] ?? null,
                    ':passport' => $_POST['passportNumber'] ?? null,
                    ':passportExpiry' => !empty($_POST['passportExpiryDate']) ? $_POST['passportExpiryDate'] : null,
                    ':drivingLicense' => $_POST['drivingLicenseNumber'] ?? null,
                    ':voterId' => $_POST['voterId'] ?? null,
                    ':aadharStatus' => $_POST['aadharStatus'] ?? 'missing',
                    ':panStatus' => $_POST['panStatus'] ?? 'missing',
                    ':passportStatus' => $_POST['passportStatus'] ?? 'missing',
                    ':voterIdStatus' => $_POST['voterIdStatus'] ?? 'missing',
                    ':drivingLicenseStatus' => $_POST['drivingLicenseStatus'] ?? 'missing',
                ];
                
                if ($aadharFile) $params[':aadharFile'] = $aadharFile;
                if ($panFile) $params[':panFile'] = $panFile;
                if ($passportFile) $params[':passportFile'] = $passportFile;
                if ($voterIdFile) $params[':voterIdFile'] = $voterIdFile;
                if ($drivingLicenseFile) $params[':drivingLicenseFile'] = $drivingLicenseFile;
                
                $stmt->execute($params);
            } else {
                // INSERT new record
                $id = sprintf('%s-%s-%s-%s-%s', 
                    bin2hex(random_bytes(4)), bin2hex(random_bytes(2)),
                    bin2hex(random_bytes(2)), bin2hex(random_bytes(2)), 
                    bin2hex(random_bytes(6)));
                
                $stmt = $pdo->prepare(
                    'INSERT INTO identity_documents (
                        id, employee_id, aadhar_number, pan_number, passport_number,
                        passport_expiry_date, driving_license_number, voter_id,
                        aadhar_file_path, pan_file_path, passport_file_path,
                        voter_id_file_path, driving_license_file_path,
                        aadhar_status, pan_status, passport_status,
                        voter_id_status, driving_license_status
                    ) VALUES (
                        :id, :employeeId, :aadhar, :pan, :passport,
                        :passportExpiry, :drivingLicense, :voterId,
                        :aadharFile, :panFile, :passportFile,
                        :voterIdFile, :drivingLicenseFile,
                        :aadharStatus, :panStatus, :passportStatus,
                        :voterIdStatus, :drivingLicenseStatus
                    )'
                );
                
                $stmt->execute([
                    ':id' => $id,
                    ':employeeId' => $employeeId,
                    ':aadhar' => $_POST['aadharNumber'] ?? null,
                    ':pan' => $_POST['panNumber'] ?? null,
                    ':passport' => $_POST['passportNumber'] ?? null,
                    ':passportExpiry' => !empty($_POST['passportExpiryDate']) ? $_POST['passportExpiryDate'] : null,
                    ':drivingLicense' => $_POST['drivingLicenseNumber'] ?? null,
                    ':voterId' => $_POST['voterId'] ?? null,
                    ':aadharFile' => $aadharFile,
                    ':panFile' => $panFile,
                    ':passportFile' => $passportFile,
                    ':voterIdFile' => $voterIdFile,
                    ':drivingLicenseFile' => $drivingLicenseFile,
                    ':aadharStatus' => $_POST['aadharStatus'] ?? 'missing',
                    ':panStatus' => $_POST['panStatus'] ?? 'missing',
                    ':passportStatus' => $_POST['passportStatus'] ?? 'missing',
                    ':voterIdStatus' => $_POST['voterIdStatus'] ?? 'missing',
                    ':drivingLicenseStatus' => $_POST['drivingLicenseStatus'] ?? 'missing',
                ]);
            }

            http_response_code(201);
            echo json_encode([
                'success' => true,
                'message' => 'Identity documents saved successfully',
                'uploadedFiles' => [
                    'aadhar' => $aadharFile,
                    'pan' => $panFile,
                    'passport' => $passportFile,
                    'voterId' => $voterIdFile,
                    'drivingLicense' => $drivingLicenseFile,
                ]
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to save identity documents', 'details' => $e->getMessage()]);
        }
        break;

    // PATCH /identity_documents.php
    // Body (JSON): { employeeId, documentType, action: "verify" }
    // documentType: "aadhar" | "pan" | "voterId" | "drivingLicense" | "passport"
    // Sets the corresponding _status column to "verified"
    case 'PATCH':
        try {
            $body = json_decode(file_get_contents('php://input'), true);
            if (!$body) {
                http_response_code(400);
                echo json_encode(['error' => 'Invalid JSON body']);
                exit();
            }

            $employeeId   = $body['employeeId']    ?? null;
            $documentType = $body['documentType']  ?? null;
            $action       = $body['action']        ?? null;

            if (!$employeeId || !$documentType || $action !== 'verify') {
                http_response_code(400);
                echo json_encode(['error' => 'employeeId, documentType, and action="verify" are required']);
                exit();
            }

            // Map camelCase documentType → snake_case DB column
            $columnMap = [
                'aadhar'          => 'aadhar_status',
                'pan'             => 'pan_status',
                'voterId'         => 'voter_id_status',
                'drivingLicense'  => 'driving_license_status',
                'passport'        => 'passport_status',
            ];

            if (!array_key_exists($documentType, $columnMap)) {
                http_response_code(422);
                echo json_encode(['error' => 'Invalid documentType. Must be one of: aadhar, pan, voterId, drivingLicense, passport']);
                exit();
            }

            $column = $columnMap[$documentType];

            $stmt = $pdo->prepare(
                "UPDATE identity_documents
                 SET {$column} = 'verified'
                 WHERE employee_id = :eid"
            );
            $stmt->execute([':eid' => $employeeId]);

            if ($stmt->rowCount() === 0) {
                http_response_code(404);
                echo json_encode(['error' => 'No identity document record found for this employee']);
                exit();
            }

            http_response_code(200);
            echo json_encode([
                'success'      => true,
                'documentType' => $documentType,
                'status'       => 'verified',
            ]);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to verify document', 'details' => $e->getMessage()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
