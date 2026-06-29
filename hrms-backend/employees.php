<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

require_once 'db.php';

// All confirmed columns from: SHOW COLUMNS FROM employees
// id, employee_id, role, designation, department, date_of_joining,
// first_name, middle_name, last_name, display_name, email, personal_email,
// phone, alternate_phone, office_extension, fax, date_of_birth, gender,
// marital_status, nationality, religion, category, blood_group, languages_known,
// photo_url, permanent_same_as_current, orcid, scopus_id, google_scholar_url,
// researchgate_url, linkedin_url, personal_website, created_at, updated_at, deleted_at

const SELECT_EMPLOYEE =
    'id,
     employee_id              AS employeeId,
     role,
     designation,
     department,
     date_of_joining          AS dateOfJoining,
     first_name               AS firstName,
     middle_name              AS middleName,
     last_name                AS lastName,
     display_name             AS displayName,
     email,
     personal_email           AS personalEmail,
     phone,
     alternate_phone          AS alternatePhone,
     office_extension         AS officeExtension,
     fax,
     date_of_birth            AS dateOfBirth,
     gender,
     marital_status           AS maritalStatus,
     nationality,
     religion,
     category,
     blood_group              AS bloodGroup,
     languages_known          AS languagesKnown,
     photo_url                AS photoUrl,
     permanent_same_as_current AS permanentSameAsCurrent,
     orcid,
     scopus_id                AS scopusId,
     google_scholar_url       AS googleScholarUrl,
     researchgate_url         AS researchgateUrl,
     linkedin_url             AS linkedinUrl,
     personal_website         AS personalWebsite,
     created_at               AS createdAt,
     updated_at               AS updatedAt,
     deleted_at               AS deletedAt';

$id     = $_GET['id'] ?? null;
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    // ── GET ──────────────────────────────────────────────────────────────────
    case 'GET':
        try {
            if ($id) {
                $stmt = $pdo->prepare(
                    'SELECT ' . SELECT_EMPLOYEE .
                    ' FROM employees WHERE id = :id AND deleted_at IS NULL'
                );
                $stmt->execute([':id' => $id]);
                $employee = $stmt->fetch();

                if (!$employee) {
                    http_response_code(404);
                    echo json_encode(['error' => 'Employee not found', 'id' => $id]);
                    exit();
                }

                $employee['permanentSameAsCurrent'] = (bool)$employee['permanentSameAsCurrent'];
                http_response_code(200);
                echo json_encode($employee);

            } else {
                // Lightweight list — only safe columns for directory
                $stmt = $pdo->prepare(
                    'SELECT id,
                            employee_id  AS employeeId,
                            first_name   AS firstName,
                            last_name    AS lastName,
                            photo_url    AS photoUrl,
                            role,
                            designation,
                            department
                     FROM employees
                     WHERE deleted_at IS NULL
                     ORDER BY created_at DESC'
                );
                $stmt->execute();
                http_response_code(200);
                echo json_encode($stmt->fetchAll());
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'SQL Error (GET): ' . $e->getMessage(), 'sqlState' => $e->getCode()]);
        }
        break;

    // ── POST — create ────────────────────────────────────────────────────────
    case 'POST':
        try {
            $body = json_decode(file_get_contents('php://input'), true);
            if (!$body) { http_response_code(400); echo json_encode(['error' => 'Invalid JSON body']); exit(); }

            $newId = sprintf('%s-%s-%s-%s-%s',
                bin2hex(random_bytes(4)), bin2hex(random_bytes(2)),
                bin2hex(random_bytes(2)), bin2hex(random_bytes(2)),
                bin2hex(random_bytes(6))
            );

            $stmt = $pdo->prepare(
                'INSERT INTO employees
                    (id, employee_id, role, designation, department, date_of_joining,
                     first_name, middle_name, last_name, display_name,
                     email, personal_email, phone, alternate_phone, office_extension, fax,
                     date_of_birth, gender, marital_status, nationality, religion, category,
                     blood_group, languages_known, photo_url, permanent_same_as_current)
                 VALUES
                    (:id, :employeeId, :role, :designation, :department, :dateOfJoining,
                     :firstName, :middleName, :lastName, :displayName,
                     :email, :personalEmail, :phone, :alternatePhone, :officeExtension, :fax,
                     :dateOfBirth, :gender, :maritalStatus, :nationality, :religion, :category,
                     :bloodGroup, :languagesKnown, :photoUrl, :permanentSameAsCurrent)'
            );

            $stmt->execute([
                ':id'                     => $newId,
                ':employeeId'             => $body['employeeId']   ?? null,
                ':role'                   => $body['role']         ?? null,
                ':designation'            => $body['designation']  ?? null,
                ':department'             => $body['department']   ?? null,
                ':dateOfJoining'          => !empty($body['dateOfJoining']) ? $body['dateOfJoining'] : null,
                ':firstName'              => $body['firstName']    ?? null,
                ':middleName'             => $body['middleName']   ?? null,
                ':lastName'               => $body['lastName']     ?? null,
                ':displayName'            => $body['displayName']  ?? null,
                ':email'                  => $body['email']        ?? null,
                ':personalEmail'          => $body['personalEmail'] ?? null,
                ':phone'                  => $body['phone']        ?? null,
                ':alternatePhone'         => $body['alternatePhone'] ?? null,
                ':officeExtension'        => $body['officeExtension'] ?? null,
                ':fax'                    => $body['fax']          ?? null,
                ':dateOfBirth'            => $body['dateOfBirth']  ?? null,
                ':gender'                 => $body['gender']       ?? null,
                ':maritalStatus'          => $body['maritalStatus'] ?? null,
                ':nationality'            => $body['nationality']  ?? 'Indian',
                ':religion'               => $body['religion']     ?? null,
                ':category'               => $body['category']     ?? null,
                ':bloodGroup'             => $body['bloodGroup']   ?? null,
                ':languagesKnown'         => $body['languagesKnown'] ?? null,
                ':photoUrl'               => !empty($body['photoUrl']) ? $body['photoUrl'] : null,
                ':permanentSameAsCurrent' => !empty($body['permanentSameAsCurrent']) ? 1 : 0,
            ]);

            http_response_code(201);
            echo json_encode(['success' => true, 'data' => ['id' => $newId]]);

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'SQL Error (POST): ' . $e->getMessage(), 'sqlState' => $e->getCode()]);
        }
        break;

    // ── PUT — update ─────────────────────────────────────────────────────────
    case 'PUT':
        try {
            if (!$id) { http_response_code(400); echo json_encode(['error' => 'id param required']); exit(); }

            $body = json_decode(file_get_contents('php://input'), true);
            if (!$body) { http_response_code(400); echo json_encode(['error' => 'Invalid JSON body']); exit(); }

            $stmt = $pdo->prepare(
                'UPDATE employees
                 SET role                      = :role,
                     designation               = :designation,
                     department                = :department,
                     date_of_joining           = :dateOfJoining,
                     first_name                = :firstName,
                     middle_name               = :middleName,
                     last_name                 = :lastName,
                     display_name              = :displayName,
                     email                     = :email,
                     personal_email            = :personalEmail,
                     phone                     = :phone,
                     alternate_phone           = :alternatePhone,
                     office_extension          = :officeExtension,
                     fax                       = :fax,
                     date_of_birth             = :dateOfBirth,
                     gender                    = :gender,
                     marital_status            = :maritalStatus,
                     nationality               = :nationality,
                     religion                  = :religion,
                     category                  = :category,
                     blood_group               = :bloodGroup,
                     languages_known           = :languagesKnown,
                     photo_url                 = :photoUrl,
                     permanent_same_as_current = :permanentSameAsCurrent
                 WHERE id = :id AND deleted_at IS NULL'
            );

            $stmt->execute([
                ':id'                     => $id,
                ':role'                   => $body['role']         ?? null,
                ':designation'            => $body['designation']  ?? null,
                ':department'             => $body['department']   ?? null,
                ':dateOfJoining'          => !empty($body['dateOfJoining']) ? $body['dateOfJoining'] : null,
                ':firstName'              => $body['firstName']    ?? null,
                ':middleName'             => $body['middleName']   ?? null,
                ':lastName'               => $body['lastName']     ?? null,
                ':displayName'            => $body['displayName']  ?? null,
                ':email'                  => $body['email']        ?? null,
                ':personalEmail'          => $body['personalEmail'] ?? null,
                ':phone'                  => $body['phone']        ?? null,
                ':alternatePhone'         => $body['alternatePhone'] ?? null,
                ':officeExtension'        => $body['officeExtension'] ?? null,
                ':fax'                    => $body['fax']          ?? null,
                ':dateOfBirth'            => $body['dateOfBirth']  ?? null,
                ':gender'                 => $body['gender']       ?? null,
                ':maritalStatus'          => $body['maritalStatus'] ?? null,
                ':nationality'            => $body['nationality']  ?? 'Indian',
                ':religion'               => $body['religion']     ?? null,
                ':category'               => $body['category']     ?? null,
                ':bloodGroup'             => $body['bloodGroup']   ?? null,
                ':languagesKnown'         => $body['languagesKnown'] ?? null,
                ':photoUrl'               => array_key_exists('photoUrl', $body) ? ($body['photoUrl'] ?: null) : null,
                ':permanentSameAsCurrent' => !empty($body['permanentSameAsCurrent']) ? 1 : 0,
            ]);

            http_response_code(200);
            echo json_encode(['success' => true, 'data' => ['id' => $id]]);

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'SQL Error (PUT): ' . $e->getMessage(), 'sqlState' => $e->getCode()]);
        }
        break;

    // ── PATCH — research profile IDs only ────────────────────────────────────
    case 'PATCH':
        try {
            if (!$id) { http_response_code(400); echo json_encode(['error' => 'id param required']); exit(); }

            $body = json_decode(file_get_contents('php://input'), true);
            if (!$body) { http_response_code(400); echo json_encode(['error' => 'Invalid JSON body']); exit(); }

            $stmt = $pdo->prepare(
                'UPDATE employees
                 SET orcid              = :orcid,
                     scopus_id          = :scopusId,
                     google_scholar_url = :googleScholarUrl,
                     researchgate_url   = :researchgateUrl,
                     linkedin_url       = :linkedinUrl,
                     personal_website   = :personalWebsite
                 WHERE id = :id AND deleted_at IS NULL'
            );

            $stmt->execute([
                ':id'               => $id,
                ':orcid'            => !empty($body['orcid'])            ? $body['orcid']            : null,
                ':scopusId'         => !empty($body['scopusId'])         ? $body['scopusId']         : null,
                ':googleScholarUrl' => !empty($body['googleScholarUrl']) ? $body['googleScholarUrl'] : null,
                ':researchgateUrl'  => !empty($body['researchgateUrl'])  ? $body['researchgateUrl']  : null,
                ':linkedinUrl'      => !empty($body['linkedinUrl'])      ? $body['linkedinUrl']      : null,
                ':personalWebsite'  => !empty($body['personalWebsite'])  ? $body['personalWebsite']  : null,
            ]);

            http_response_code(200);
            echo json_encode(['success' => true]);

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'SQL Error (PATCH): ' . $e->getMessage(), 'sqlState' => $e->getCode()]);
        }
        break;

    // ── DELETE — soft delete ─────────────────────────────────────────────────
    case 'DELETE':
        try {
            if (!$id) { http_response_code(400); echo json_encode(['error' => 'id param required']); exit(); }

            $stmt = $pdo->prepare('UPDATE employees SET deleted_at = NOW() WHERE id = :id AND deleted_at IS NULL');
            $stmt->execute([':id' => $id]);
            http_response_code(200);
            echo json_encode(['success' => true]);

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'SQL Error (DELETE): ' . $e->getMessage()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
}
