<?php
$pdo = new PDO('mysql:host=localhost;dbname=hrms_erp', 'root', '');

// Check if column already exists
$check = $pdo->query("SHOW COLUMNS FROM qualifications LIKE 'education_level'");
if ($check->rowCount() === 0) {
    $pdo->exec("ALTER TABLE qualifications ADD COLUMN education_level VARCHAR(10) NULL DEFAULT NULL AFTER employee_id");
    echo "education_level column added successfully\n";
} else {
    echo "education_level column already exists\n";
}
