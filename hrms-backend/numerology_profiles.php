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
                           life_path_number AS lifePathNumber,
                           destiny_number AS destinyNumber,
                           soul_urge_number AS soulUrgeNumber,
                           personality_number AS personalityNumber,
                           birthday_number AS birthdayNumber,
                           kua_number AS kuaNumber,
                           lucky_numbers AS luckyNumbers,
                           lucky_colours AS luckyColours,
                           lucky_gemstone AS luckyGemstone,
                           favourable_days AS favourableDays,
                           notes,
                           created_at AS createdAt, updated_at AS updatedAt
                    FROM numerology_profiles';
            if ($employeeId) {
                $stmt = $pdo->prepare($sql . ' WHERE employee_id = :eid');
                $stmt->execute([':eid' => $employeeId]);
                $row = $stmt->fetch();
                if ($row) {
                    foreach (['lifePathNumber','destinyNumber','soulUrgeNumber','personalityNumber','birthdayNumber','kuaNumber'] as $f) {
                        $row[$f] = $row[$f] !== null ? (int)$row[$f] : null;
                    }
                }
                http_response_code(200);
                echo json_encode($row ?: null);
            } else {
                $stmt = $pdo->prepare($sql);
                $stmt->execute();
                $rows = $stmt->fetchAll();
                foreach ($rows as &$r) {
                    foreach (['lifePathNumber','destinyNumber','soulUrgeNumber','personalityNumber','birthdayNumber','kuaNumber'] as $f) {
                        $r[$f] = $r[$f] !== null ? (int)$r[$f] : null;
                    }
                }
                unset($r);
                http_response_code(200);
                echo json_encode($rows);
            }
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to fetch numerology profile']);
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

            $check = $pdo->prepare('SELECT id FROM numerology_profiles WHERE employee_id = :eid');
            $check->execute([':eid' => $body['employeeId']]);
            $existing = $check->fetch();

            if ($existing) {
                $stmt = $pdo->prepare(
                    'UPDATE numerology_profiles
                     SET life_path_number   = :lpn,
                         destiny_number     = :dn,
                         soul_urge_number   = :sun,
                         personality_number = :pn,
                         birthday_number    = :bn,
                         kua_number         = :kn,
                         lucky_numbers      = :ln,
                         lucky_colours      = :lc,
                         lucky_gemstone     = :lg,
                         favourable_days    = :fd,
                         notes              = :notes
                     WHERE employee_id = :eid'
                );
            } else {
                $stmt = $pdo->prepare(
                    'INSERT INTO numerology_profiles
                        (id, employee_id, life_path_number, destiny_number, soul_urge_number,
                         personality_number, birthday_number, kua_number, lucky_numbers,
                         lucky_colours, lucky_gemstone, favourable_days, notes)
                     VALUES (:newid, :eid, :lpn, :dn, :sun, :pn, :bn, :kn, :ln, :lc, :lg, :fd, :notes)'
                );
            }

            $params = [
                ':eid'   => $body['employeeId'],
                ':lpn'   => isset($body['lifePathNumber'])   && $body['lifePathNumber']   !== '' ? (int)$body['lifePathNumber']   : null,
                ':dn'    => isset($body['destinyNumber'])     && $body['destinyNumber']     !== '' ? (int)$body['destinyNumber']     : null,
                ':sun'   => isset($body['soulUrgeNumber'])    && $body['soulUrgeNumber']    !== '' ? (int)$body['soulUrgeNumber']    : null,
                ':pn'    => isset($body['personalityNumber']) && $body['personalityNumber'] !== '' ? (int)$body['personalityNumber'] : null,
                ':bn'    => isset($body['birthdayNumber'])    && $body['birthdayNumber']    !== '' ? (int)$body['birthdayNumber']    : null,
                ':kn'    => isset($body['kuaNumber'])         && $body['kuaNumber']         !== '' ? (int)$body['kuaNumber']         : null,
                ':ln'    => !empty($body['luckyNumbers'])     ? $body['luckyNumbers']     : null,
                ':lc'    => !empty($body['luckyColours'])     ? $body['luckyColours']     : null,
                ':lg'    => !empty($body['luckyGemstone'])    ? $body['luckyGemstone']    : null,
                ':fd'    => !empty($body['favourableDays'])   ? $body['favourableDays']   : null,
                ':notes' => !empty($body['notes'])            ? $body['notes']            : null,
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
