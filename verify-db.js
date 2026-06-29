const mysql = require('mysql2/promise');

async function verifyDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '1234',
      database: 'hrms_erp',
      port: 3306
    });

    console.log('✅ Connected to MySQL successfully!\n');

    // Check tables
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`📊 Total tables: ${tables.length}`);
    
    // Check employee count
    const [employees] = await connection.query('SELECT COUNT(*) as count FROM employees');
    console.log(`👥 Total employees: ${employees[0].count}`);
    
    // Check qualifications
    const [qualifications] = await connection.query('SELECT COUNT(*) as count FROM qualifications');
    console.log(`🎓 Total qualifications: ${qualifications[0].count}`);
    
    // Check publications
    const [publications] = await connection.query('SELECT COUNT(*) as count FROM publications');
    console.log(`📚 Total publications: ${publications[0].count}`);
    
    // Check certifications
    const [certifications] = await connection.query('SELECT COUNT(*) as count FROM certifications');
    console.log(`📜 Total certifications: ${certifications[0].count}`);
    
    console.log('\n✨ Database is ready to use!');
    
    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verifyDatabase();
