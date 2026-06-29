<?php
// =============================================================================
// upload.php — Profile photo upload handler (DEBUG-INSTRUMENTED)
// POST multipart/form-data fields:
//   file        (required) — the image binary
//   fileType    (required) — must be "photo"
//   employeeId  (optional) — UUID; if present updates employees.photo_url
// Returns JSON: { success, url, filename }  or  { error, debug{} }
// =============================================================================

// ── Show ALL PHP errors as JSON so the browser sees them ─────────────────────
ini_set('display_errors', '0');          // never leak HTML error pages
ini_set('log_errors', '1');
error_reporting(E_ALL);

// Catch fatal errors that escape try-catch
register_shutdown_function(function () {
    $err = error_get_last();
    if ($err && in_array($err['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        if (!headers_sent()) {
            http_response_code(500);
            header('Content-Type: application/json');
        }
        echo json_encode([
            'error' => 'PHP Fatal Error: ' . $err['message'],
            'debug' => ['file' => $err['file'], 'line' => $err['line']],
        ]);
    }
});

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit(); }

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed. Expected POST.']);
    exit();
}

// ── Helper: die with a rich JSON error ───────────────────────────────────────
function fail(int $code, string $message, array $extra = []): never {
    http_response_code($code);
    echo json_encode(array_merge(['error' => $message], $extra));
    exit();
}

try {
    require_once __DIR__ . DIRECTORY_SEPARATOR . 'db.php';
} catch (Throwable $e) {
    fail(500, 'db.php failed to load: ' . $e->getMessage(), [
        'debug' => ['db_path' => __DIR__ . DIRECTORY_SEPARATOR . 'db.php'],
    ]);
}

// ── 1. Validate POST fields ───────────────────────────────────────────────────
$fileType   = trim($_POST['fileType']   ?? '');
$employeeId = trim($_POST['employeeId'] ?? '');
if ($employeeId === '') $employeeId = null;

if ($fileType !== 'photo') {
    fail(400, 'Invalid or missing fileType. Expected "photo", received: "' . htmlspecialchars($fileType) . '".');
}

// ── 2. Validate $_FILES ───────────────────────────────────────────────────────
if (!isset($_FILES['file'])) {
    fail(400, 'No file field found in the request. Key "file" is missing from $_FILES.', [
        'debug' => ['files_keys' => array_keys($_FILES)],
    ]);
}

$uploadErrMap = [
    UPLOAD_ERR_OK         => 'No error',
    UPLOAD_ERR_INI_SIZE   => 'File exceeds upload_max_filesize in php.ini (' . ini_get('upload_max_filesize') . ')',
    UPLOAD_ERR_FORM_SIZE  => 'File exceeds MAX_FILE_SIZE directive in the HTML form',
    UPLOAD_ERR_PARTIAL    => 'File was only partially uploaded',
    UPLOAD_ERR_NO_FILE    => 'No file was uploaded (empty input)',
    UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder — check php.ini upload_tmp_dir',
    UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk — check PHP temp dir permissions',
    UPLOAD_ERR_EXTENSION  => 'A PHP extension stopped the file upload',
];

$errCode = $_FILES['file']['error'];
if ($errCode !== UPLOAD_ERR_OK) {
    fail(400, $uploadErrMap[$errCode] ?? 'Unknown upload error (code ' . $errCode . ')', [
        'debug' => ['error_code' => $errCode, 'php_tmp_dir' => sys_get_temp_dir()],
    ]);
}

$file = $_FILES['file'];

// ── 3. MIME validation (server-side, finfo) ───────────────────────────────────
if (!function_exists('finfo_open')) {
    fail(500, 'PHP fileinfo extension is not enabled. Enable extension=fileinfo in php.ini.');
}

$finfo    = finfo_open(FILEINFO_MIME_TYPE);
$mimeType = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

$allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
if (!in_array($mimeType, $allowedMimes, true)) {
    fail(422, 'Invalid file type. Only JPG, PNG, or WebP are allowed. Detected MIME: "' . $mimeType . '".', [
        'debug' => ['original_name' => $file['name'], 'detected_mime' => $mimeType],
    ]);
}

// ── 4. Size cap (5 MB) ────────────────────────────────────────────────────────
$maxBytes = 5 * 1024 * 1024;
if ($file['size'] > $maxBytes) {
    fail(422, 'Photo exceeds 5 MB limit. Uploaded size: ' . round($file['size'] / 1048576, 2) . ' MB.');
}

// ── 5. Prepare upload directory (Windows-safe with DIRECTORY_SEPARATOR) ───────
$uploadDir = __DIR__ . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . 'profile_photos' . DIRECTORY_SEPARATOR;

if (!is_dir($uploadDir)) {
    if (!mkdir($uploadDir, 0755, true)) {
        fail(500, 'Failed to create upload directory.', [
            'debug' => [
                'attempted_path' => $uploadDir,
                'parent_writable' => is_writable(dirname($uploadDir)),
            ],
        ]);
    }
}

if (!is_writable($uploadDir)) {
    fail(500, 'Upload directory exists but is not writable by PHP.', [
        'debug' => [
            'directory'   => $uploadDir,
            'php_user'    => function_exists('posix_getpwuid') ? posix_getpwuid(posix_geteuid())['name'] : 'unknown (Windows)',
            'dir_perms'   => substr(sprintf('%o', fileperms($uploadDir)), -4),
        ],
    ]);
}

// ── 6. Build unique filename ──────────────────────────────────────────────────
$extMap = [
    'image/jpeg' => 'jpg',
    'image/jpg'  => 'jpg',
    'image/png'  => 'png',
    'image/webp' => 'webp',
];
$extension = $extMap[$mimeType] ?? 'jpg';
$prefix    = $employeeId ? preg_replace('/[^a-zA-Z0-9_-]/', '', $employeeId) : uniqid('emp', true);
$filename  = 'photo_' . $prefix . '_' . time() . '.' . $extension;
$destPath  = $uploadDir . $filename;

// Relative path stored in DB and returned to frontend
// Always use forward slashes so it works as a URL segment
$relPath = 'uploads/profile_photos/' . $filename;

// ── 7. Move the file ──────────────────────────────────────────────────────────
if (!move_uploaded_file($file['tmp_name'], $destPath)) {
    // Gather as much diagnostic info as possible
    fail(500, 'move_uploaded_file() failed. File could not be moved to destination.', [
        'debug' => [
            'tmp_name'       => $file['tmp_name'],
            'tmp_exists'     => file_exists($file['tmp_name']),
            'tmp_readable'   => is_readable($file['tmp_name']),
            'dest_path'      => $destPath,
            'dest_dir'       => $uploadDir,
            'dest_writable'  => is_writable($uploadDir),
            'free_space_mb'  => round(disk_free_space($uploadDir) / 1048576, 1),
            'php_ini_upload' => ini_get('file_uploads'),
            'open_basedir'   => ini_get('open_basedir') ?: 'not set',
        ],
    ]);
}

// ── 8. Update employees.photo_url (optional) ─────────────────────────────────
if ($employeeId !== null) {
    try {
        $stmt = $pdo->prepare(
            'UPDATE employees SET photo_url = :url WHERE id = :id AND deleted_at IS NULL'
        );
        $stmt->execute([':url' => $relPath, ':id' => $employeeId]);

        if ($stmt->rowCount() === 0) {
            // File saved OK, but no employee row matched — return warning not error
            http_response_code(200);
            echo json_encode([
                'success'  => true,
                'url'      => $relPath,
                'filename' => $filename,
                'warning'  => 'Photo saved, but no employee row matched id="' . $employeeId . '". photo_url was NOT updated.',
            ]);
            exit();
        }
    } catch (PDOException $e) {
        // File is already on disk — don't delete it, just report the DB issue
        http_response_code(207);
        echo json_encode([
            'url'      => $relPath,
            'filename' => $filename,
            'warning'  => 'Photo saved to disk but DB update failed.',
            'debug'    => [
                'pdo_error'   => $e->getMessage(),
                'pdo_code'    => $e->getCode(),
                'employee_id' => $employeeId,
            ],
        ]);
        exit();
    }
}

// ── 9. All good ───────────────────────────────────────────────────────────────
http_response_code(200);
echo json_encode([
    'success'  => true,
    'url'      => $relPath,
    'filename' => $filename,
]);
