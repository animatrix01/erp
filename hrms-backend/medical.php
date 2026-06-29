<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    // GET ?employeeId=<id>  → returns array (matches original behaviour)
    case 'GET':
        try {
            $employeeId = $_GET['employeeId'] ?? null;
            if ($employeeId) {
                $stmt = $pdo->prepare(
                    'SELECT id, employee_id AS employeeId,
                            blood_group AS bloodGroup, medical_history AS medicalHistory,
                            height, weight,
                            last_medical_checkup AS lastMedicalCheckup,
                            disability,
                            physically_handicapped AS physicallyHandicapped,
                            known_allergies AS knownAllergies,
                            medical_notes AS medicalNotes,
                            insurance_policy_number AS insurancePolicyNumber,
                            insurance_provider AS insuranceProvider,
                            created_at AS createdAt, updated_at AS updatedAt
                     FROM medical_information WHERE employee_id = :eid'
                );
                $stmt->execute([':eid' => $employeeId]);
                $rows = $stmt->fetchAll();
                foreach ($rows as &$r) {
                    $r['height'] = $r['height'] !== null ? (float)$r['height'] : null;
                    $r['weight'] = $r['weight'] !== null ? (float)$r['weight'] : null;
                    $r['physicallyHandicapped'] = (bool)$r['physicallyHandicapped'];
                }
                unset($r);
                http_response_code(200);
                echo json_encode($rows); // array, matches original
            } else {
                $stmt = $pdo->prepare(
                    'SELECT id, employee_id AS employeeId,
                            blood_group AS bloodGroup, medical_history AS medicalHistory,
                            height, weight,
                            last_medical_checkup AS lastMedicalCheckup,
                            disability,
                            physically_handicapped AS physicallyHandicapped,
                            known_allergies AS knownAllergies,
                            medical_notes AS medicalNotes,
                            insurance_policy_number AS insurancePolicyNumber,
                            insurance_provider AS insuranceProvider
                     FROM medical_information'
                );
                $stmt->execute();
                http_response_code(200);
                echo json_encode($stmt->fetchAll());
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch medical information']);
        }
        break;

    // POST — upsert medical info for an employee
    case 'POST':
        try {
            $body = json_decode(file_get_contents('php://input'), true);
            if (!$body || empty($body['employeeId'])) {
                http_response_code(400); echo json_encode(['error' => 'employeeId required']); exit();
            }

            $check = $pdo->prepare('SELECT id FROM medical_information WHERE employee_id = :eid');
            $check->execute([':eid' => $body['employeeId']]);
            $existing = $check->fetch();

            if ($existing) {
                $stmt = $pdo->prepare(
                    'UPDATE medical_information
                     SET blood_group              = :bg,
                         medical_history          = :mh,
                         height                   = :ht,
                         weight                   = :wt,
                         last_medical_checkup     = :lmc,
                         disability               = :dis,
                         physically_handicapped   = :ph,
                         known_allergies          = :ka,
                         medical_notes            = :mn,
                         insurance_policy_number  = :ipn,
                         insurance_provider       = :ip
                     WHERE employee_id = :eid'
                );
            } else {
                $stmt = $pdo->prepare(
                    'INSERT INTO medical_information
                        (id, employee_id, blood_group, medical_history,
                         height, weight, last_medical_checkup, disability,
                         physically_handicapped, known_allergies, medical_notes,
                         insurance_policy_number, insurance_provider)
                     VALUES (:newid,:eid,:bg,:mh,:ht,:wt,:lmc,:dis,:ph,:ka,:mn,:ipn,:ip)'
                );
            }

            $params = [
                ':eid' => $body['employeeId'],
                ':bg'  => $body['bloodGroup'],
                ':mh'  => $body['medicalHistory']         ?? null,
                ':ht'  => !empty($body['height'])         ? $body['height']         : null,
                ':wt'  => !empty($body['weight'])         ? $body['weight']         : null,
                ':lmc' => !empty($body['lastMedicalCheckup']) ? $body['lastMedicalCheckup'] : null,
                ':dis' => !empty($body['disability'])     ? $body['disability']     : null,
                ':ph'  => !empty($body['physicallyHandicapped']) ? 1 : 0,
                ':ka'  => !empty($body['knownAllergies']) ? $body['knownAllergies'] : null,
                ':mn'  => !empty($body['medicalNotes'])   ? $body['medicalNotes']   : null,
                ':ipn' => !empty($body['insurancePolicyNumber']) ? $body['insurancePolicyNumber'] : null,
                ':ip'  => !empty($body['insuranceProvider'])     ? $body['insuranceProvider']     : null,
            ];

            // Add the newid parameter for INSERT operations
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
