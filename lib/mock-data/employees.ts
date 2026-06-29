import { Profile } from '../types';

export const mockEmployees: Profile[] = [
  {
    employeeId: 'EMP001',
    firstName: 'Rajesh',
    lastName: 'Kumar',
    email: 'rajesh.kumar@university.edu',
    phone: '+919876543210',
    dateOfBirth: new Date('1980-05-15'),
    gender: 'male',
    bloodGroup: 'O+',
  },
  {
    employeeId: 'EMP002',
    firstName: 'Priya',
    lastName: 'Sharma',
    email: 'priya.sharma@university.edu',
    phone: '+919876543211',
    dateOfBirth: new Date('1985-08-22'),
    gender: 'female',
    bloodGroup: 'A+',
  },
  {
    employeeId: 'EMP003',
    firstName: 'Amit',
    lastName: 'Patel',
    email: 'amit.patel@university.edu',
    phone: '+919876543212',
    dateOfBirth: new Date('1978-03-10'),
    gender: 'male',
    bloodGroup: 'B+',
  },
];

export const getEmployeeProfile = async (id: string): Promise<Profile> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  const employee = mockEmployees.find(e => e.employeeId === id);
  if (!employee) throw new Error('Employee not found');
  return employee;
};

export const getCurrentEmployee = async (): Promise<Profile> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockEmployees[0];
};

export const updateEmployeeProfile = async (data: Profile): Promise<Profile> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('Updating employee profile:', data);
  return data;
};
