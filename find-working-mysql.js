const mysql = require('mysql2/promise');

async function findWorkingMySQL() {
  const configs = [
    { name: 'MySQL 9.7 no password', host: 'localhost', user: 'root', password: '', port: 3307 },
    { name: 'MySQL 9.7 with admin000', host: 'localhost', user: 'root', password: 'admin000', port: 3307 },
    { name: 'MySQL 8.0 no password', host: 'localhost', user: 'root', password: '', port: 3306 },
    { name: 'MySQL 8.0 with admin000', host: 'localhost', user: 'root', password: 'admin000', port: 3306 },
  ];

  for (const config of configs) {
    try {
      console.log(`\nTrying: ${config.name}...`);
      const connection = await mysql.createConnection({
        host: config.host,
        user: config.user,
        password: config.password,
        port: config.port
      });
      
      console.log(`✅ SUCCESS! Connected to ${config.name}`);
      console.log(`   Port: ${config.port}`);
      console.log(`   Password: ${config.password || '(none)'}`);
      
      // Create database
      await connection.query('CREATE DATABASE IF NOT EXISTS hrms_erp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci');
      console.log(`✅ Database "hrms_erp" created!`);
      
      console.log(`\n📝 Update your .env file with:`);
      console.log(`   DB_PORT=${config.port}`);
      console.log(`   DB_PASSWORD=${config.password}`);
      
      await connection.end();
      return;
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
    }
  }
  
  console.log('\n❌ No working MySQL configuration found.');
  console.log('💡 Try running PowerShell as Administrator and reset MySQL password.');
}

findWorkingMySQL();
