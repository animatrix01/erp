const mysql = require('mysql2/promise');

async function cleanup() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '1234',
      database: 'hrms_erp',
      port: 3306
    });

    console.log('🧹 Cleaning up duplicate records...\n');

    // Get the first employee ID
    const [employees] = await connection.query('SELECT id FROM employees LIMIT 1');
    
    if (employees.length === 0) {
      console.log('No employees found');
      return;
    }
    
    const employeeId = employees[0].id;
    console.log(`Employee ID: ${employeeId}\n`);

    // Delete duplicates
    await connection.query('DELETE FROM qualifications WHERE employee_id = ?', [employeeId]);
    console.log('✅ Deleted all qualifications');
    
    await connection.query('DELETE FROM certifications WHERE employee_id = ?', [employeeId]);
    console.log('✅ Deleted all certifications');
    
    await connection.query('DELETE FROM publications WHERE employee_id = ?', [employeeId]);
    console.log('✅ Deleted all publications');
    
    await connection.query('DELETE FROM employment_history WHERE employee_id = ?', [employeeId]);
    console.log('✅ Deleted all employment history');

    console.log('\n✨ Cleanup complete! Now add fresh data through the UI.\n');
    
    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

cleanup();
