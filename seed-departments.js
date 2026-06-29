/**
 * Seed script: Insert mock departments + employee-department assignments
 * Run with: node seed-departments.js
 */
const mysql = require('mysql2/promise');
const { randomUUID } = require('crypto');

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '1234',
  database: process.env.DB_NAME || 'hrms_erp',
  port: parseInt(process.env.DB_PORT || '3306'),
};

const DEPARTMENTS = [
  { code: 'CSE',  name: 'Computer Science & Engineering',       desc: 'Undergraduate and postgraduate programs in CS & IT',         empCount: 12 },
  { code: 'ECE',  name: 'Electronics & Communication Engg',     desc: 'Electronics, circuits, communication and VLSI design',       empCount: 9  },
  { code: 'MECH', name: 'Mechanical Engineering',               desc: 'Thermodynamics, manufacturing and design engineering',       empCount: 7  },
  { code: 'CIVIL',name: 'Civil Engineering',                    desc: 'Structural, environmental and transportation engineering',   empCount: 6  },
  { code: 'MBA',  name: 'Management Studies',                   desc: 'Business administration, finance and marketing programs',    empCount: 8  },
  { code: 'MATH', name: 'Mathematics & Statistics',             desc: 'Pure and applied mathematics, statistics and data science',  empCount: 5  },
];

async function run() {
  const conn = await mysql.createConnection(config);
  console.log('✅ Connected to MySQL\n');

  // Check if departments already exist
  const [existing] = await conn.query('SELECT COUNT(*) as cnt FROM departments');
  if (existing[0].cnt > 0) {
    console.log(`ℹ️  Found ${existing[0].cnt} existing departments. Skipping insert.\n`);
    console.log('💡 To re-seed, run: DELETE FROM employee_departments; DELETE FROM departments;');
    await conn.end();
    return;
  }

  // Get or create a placeholder employee
  const [emps] = await conn.query('SELECT id FROM employees LIMIT 1');
  let empId = emps.length > 0 ? emps[0].id : null;

  // Insert departments
  const deptIds = {};
  for (const dept of DEPARTMENTS) {
    const id = randomUUID();
    deptIds[dept.code] = id;
    await conn.query(
      'INSERT INTO departments (id, department_code, department_name, description, is_active) VALUES (?, ?, ?, ?, ?)',
      [id, dept.code, dept.name, dept.desc, true]
    );
    console.log(`  ✓ Department: ${dept.name} (${dept.code})`);
  }

  // Insert employee_departments assignments (mock counts)
  // We'll insert multiple rows for the same employee to simulate counts
  // In production this would be real employees
  if (empId) {
    let assignCount = 0;
    for (const dept of DEPARTMENTS) {
      const deptId = deptIds[dept.code];
      // Insert empCount rows — all pointing to same employee (mock)
      // For pie chart purposes, the count per department is what matters
      for (let i = 0; i < dept.empCount; i++) {
        try {
          await conn.query(
            'INSERT INTO employee_departments (id, employee_id, department_id, joining_date, is_current) VALUES (?, ?, ?, ?, ?)',
            [randomUUID(), empId, deptId, '2024-01-01', true]
          );
          assignCount++;
        } catch {
          // Ignore duplicates
        }
      }
    }
    console.log(`\n  ✓ Created ${assignCount} employee-department assignments`);
  }

  console.log('\n🎉 Departments seeded successfully!');
  console.log('\nDepartment summary:');
  for (const dept of DEPARTMENTS) {
    console.log(`  ${dept.code.padEnd(6)} → ${dept.name.padEnd(40)} ${dept.empCount} employees`);
  }

  await conn.end();
}

run().catch(e => { console.error('❌ Error:', e.message); process.exit(1); });
