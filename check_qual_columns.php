<?php
$pdo = new PDO('mysql:host=localhost;dbname=hrms_erp', 'root', '');
$stmt = $pdo->query('DESCRIBE qualifications');
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
foreach ($rows as $r) {
    echo $r['Field'] . ' | ' . $r['Type'] . PHP_EOL;
}
