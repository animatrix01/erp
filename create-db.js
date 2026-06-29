const mysql = require('mysql2/promise');

async function createDatabase() {
  try {
    console.log('Connecting to MySQL 8.0 on port 3306 with password 1234...');
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '1234',
      port: 3306
    });

    await connection.query('CREATE DATABASE IF NOT EXISTS hrms_erp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
    console.log('✅ Database "hrms_erp" created successfully!');
    
    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

createDatabase();
