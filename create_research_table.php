<?php
// Create research_profiles table
$pdo = new PDO('mysql:host=localhost;dbname=hrms_erp', 'root', '');

$sql = "CREATE TABLE IF NOT EXISTS `research_profiles` (
  `id`                   CHAR(36)     NOT NULL,
  `employee_id`          CHAR(36)     NOT NULL,
  `orcid`                VARCHAR(100) NULL DEFAULT NULL,
  `scopus_id`            VARCHAR(100) NULL DEFAULT NULL,
  `google_scholar_url`   VARCHAR(500) NULL DEFAULT NULL,
  `researchgate_url`     VARCHAR(500) NULL DEFAULT NULL,
  `linkedin_url`         VARCHAR(500) NULL DEFAULT NULL,
  `personal_website`     VARCHAR(500) NULL DEFAULT NULL,
  `created_at`           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at`           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `research_profiles_employee_id_idx` (`employee_id`),

  CONSTRAINT `fk_research_profiles_employee`
    FOREIGN KEY (`employee_id`)
    REFERENCES `employees` (`id`)
    ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";

try {
    $pdo->exec($sql);
    echo "✅ research_profiles table created successfully!\n";
} catch (PDOException $e) {
    echo "❌ Error: " . $e->getMessage() . "\n";
}
