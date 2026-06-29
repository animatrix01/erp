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
                           birth_time AS birthTime, birth_place AS birthPlace,
                           zodiac_sign AS zodiacSign, moon_sign AS moonSign,
                           ascendant, nakshatra, gotra, pada,
                           chinese_zodiac AS chineseZodiac,
                           chinese_element AS chineseElement,
                           vedic_element AS vedicElement,
                           created_at AS createdAt, updated_at AS updatedAt
                    FROM astrology_profiles';
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
            echo json_encode(['error' => 'Failed to fetch astrology profile']);
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

            $check = $pdo->prepare('SELECT id FROM astrology_profiles WHERE employee_id = :eid');
            $check->execute([':eid' => $body['employeeId']]);
            $existing = $check->fetch();

            if ($existing) {
                $stmt = $pdo->prepare(
                    'UPDATE astrology_profiles
                     SET birth_time      = :bt,
                         birth_place     = :bp,
                         zodiac_sign     = :zs,
                         moon_sign       = :ms,
                         ascendant       = :asc,
                         nakshatra       = :nak,
                         gotra           = :got,
                         pada            = :pada,
                         chinese_zodiac  = :cz,
                         chinese_element = :ce,
                         vedic_element   = :ve
                     WHERE employee_id = :eid'
                );
            } else {
                $stmt = $pdo->prepare(
                    'INSERT INTO astrology_profiles
                        (id, employee_id, birth_time, birth_place, zodiac_sign, moon_sign,
                         ascendant, nakshatra, gotra, pada, chinese_zodiac, chinese_element, vedic_element)
                     VALUES (:newid, :eid, :bt, :bp, :zs, :ms, :asc, :nak, :got, :pada, :cz, :ce, :ve)'
                );
            }

            $params = [
                ':eid' => $body['employeeId'],
                ':bt'  => !empty($body['birthTime'])      ? $body['birthTime']      : null,
                ':bp'  => !empty($body['birthPlace'])     ? $body['birthPlace']     : null,
                ':zs'  => !empty($body['zodiacSign'])    ? $body['zodiacSign']    : null,
                ':ms'  => !empty($body['moonSign'])      ? $body['moonSign']      : null,
                ':asc' => !empty($body['ascendant'])     ? $body['ascendant']     : null,
                ':nak' => !empty($body['nakshatra'])     ? $body['nakshatra']     : null,
                ':got' => !empty($body['gotra'])         ? $body['gotra']         : null,
                ':pada'=> !empty($body['pada'])          ? $body['pada']          : null,
                ':cz'  => !empty($body['chineseZodiac']) ? $body['chineseZodiac'] : null,
                ':ce'  => !empty($body['chineseElement'])? $body['chineseElement']: null,
                ':ve'  => !empty($body['vedicElement'])  ? $body['vedicElement']  : null,
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
