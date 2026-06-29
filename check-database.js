const mysql = require('mysql2/promise');

async function checkDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '1234',
      database: 'hrms_erp',
      port: 3306
    });

    console.log('✅ Connected to MySQL database: hrms_erp\n');
    console.log('=' .repeat(80));
    
    // Check employees
    console.log('\n📋 EMPLOYEES TABLE:');
    console.log('-'.repeat(80));
    const [employees] = await connection.query('SELECT * FROM employees');
    if (employees.length === 0) {
      console.log('  (No employees found)');
    } else {
      employees.forEach((emp, index) => {
        console.log(`\n  Employee ${index + 1}:`);
        console.log(`    ID: ${emp.employee_id}`);
        console.log(`    Name: ${emp.first_name} ${emp.last_name}`);
        console.log(`    Email: ${emp.email}`);
        console.log(`    Phone: ${emp.phone}`);
        console.log(`    Gender: ${emp.gender}`);
        console.log(`    Blood Group: ${emp.blood_group}`);
        console.log(`    DOB: ${emp.date_of_birth}`);
        console.log(`    Photo URL: ${emp.photo_url || '(not set)'}`);
      });
    }
    
    // Check qualifications
    console.log('\n\n🎓 QUALIFICATIONS TABLE:');
    console.log('-'.repeat(80));
    const [qualifications] = await connection.query('SELECT * FROM qualifications');
    if (qualifications.length === 0) {
      console.log('  (No qualifications found)');
    } else {
      qualifications.forEach((qual, index) => {
        console.log(`\n  Qualification ${index + 1}:`);
        console.log(`    Degree: ${qual.degree_name}`);
        console.log(`    Institution: ${qual.institution}`);
        console.log(`    Year: ${qual.passing_year}`);
        console.log(`    Percentage: ${qual.percentage}%`);
        console.log(`    PhD: ${qual.is_phd ? 'Yes' : 'No'}`);
      });
    }
    
    // Check certifications
    console.log('\n\n📜 CERTIFICATIONS TABLE:');
    console.log('-'.repeat(80));
    const [certifications] = await connection.query('SELECT * FROM certifications');
    if (certifications.length === 0) {
      console.log('  (No certifications found)');
    } else {
      certifications.forEach((cert, index) => {
        console.log(`\n  Certification ${index + 1}:`);
        console.log(`    Name: ${cert.certification_name}`);
        console.log(`    Organization: ${cert.issuing_organization}`);
        console.log(`    Issue Date: ${cert.issue_date}`);
      });
    }
    
    // Check publications
    console.log('\n\n📚 PUBLICATIONS TABLE:');
    console.log('-'.repeat(80));
    const [publications] = await connection.query('SELECT * FROM publications');
    if (publications.length === 0) {
      console.log('  (No publications found)');
    } else {
      publications.forEach((pub, index) => {
        console.log(`\n  Publication ${index + 1}:`);
        console.log(`    Journal: ${pub.journal_title}`);
        console.log(`    DOI: ${pub.doi}`);
        console.log(`    Year: ${pub.publication_year}`);
        console.log(`    Impact Factor: ${pub.impact_factor}`);
      });
    }
    
    // Check employment history
    console.log('\n\n💼 EMPLOYMENT HISTORY TABLE:');
    console.log('-'.repeat(80));
    const [employment] = await connection.query('SELECT * FROM employment_history');
    if (employment.length === 0) {
      console.log('  (No employment records found)');
    } else {
      employment.forEach((emp, index) => {
        console.log(`\n  Employment ${index + 1}:`);
        console.log(`    Organization: ${emp.organization_name}`);
        console.log(`    Designation: ${emp.designation}`);
        console.log(`    From: ${emp.from_date} To: ${emp.to_date}`);
        console.log(`    Experience: ${emp.total_experience_years} years`);
      });
    }
    
    // Summary
    console.log('\n\n' + '='.repeat(80));
    console.log('📊 DATABASE SUMMARY:');
    console.log('='.repeat(80));
    console.log(`  Employees: ${employees.length}`);
    console.log(`  Qualifications: ${qualifications.length}`);
    console.log(`  Certifications: ${certifications.length}`);
    console.log(`  Publications: ${publications.length}`);
    console.log(`  Employment Records: ${employment.length}`);
    console.log('='.repeat(80));
    
    await connection.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkDatabase();
