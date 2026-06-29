async function testAPI() {
  try {
    console.log('🧪 Testing API endpoints...\n');
    
    // Test 1: Create an employee
    console.log('1. Creating test employee...');
    const createResponse = await fetch('http://localhost:3000/api/employees', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employeeId: 'EMP001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@college.edu',
        phone: '9876543210',
        dateOfBirth: '1990-05-15',
        gender: 'male',
        bloodGroup: 'O+'
      })
    });
    const createData = await createResponse.json();
    console.log('✅ Employee created:', createData);
    
    // Test 2: Get all employees
    console.log('\n2. Fetching all employees...');
    const getResponse = await fetch('http://localhost:3000/api/employees');
    const employees = await getResponse.json();
    console.log(`✅ Found ${employees.length} employee(s)`);
    console.log(employees);
    
    console.log('\n✨ API tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAPI();
