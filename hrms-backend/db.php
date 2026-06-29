<?php

// =============================================================================
// CORS Headers
// Allow the Next.js frontend (localhost:3000) to communicate with this backend
// =============================================================================
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle OPTIONS preflight request — browsers send this before the real request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// =============================================================================
// Database Configuration
// =============================================================================
define('DB_HOST', 'localhost');
define('DB_NAME', 'hrms_erp');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

// =============================================================================
// PDO Connection
// =============================================================================
try {
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=" . DB_CHARSET;

    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,   // throw exceptions on error
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,         // return arrays by default
        PDO::ATTR_EMULATE_PREPARES   => false,                     // use real prepared statements
    ];

    $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);

} catch (PDOException $e) {
    // Return a clean JSON error — never expose raw exception messages in production
    http_response_code(500);
    header("Content-Type: application/json");
    echo json_encode([
        "error"   => "Database connection failed",
        "message" => $e->getMessage()
    ]);
    exit();
}
