import { MedicalData } from '../types';

export const mockMedicalData: MedicalData = {
  emergencyContacts: [
    {
      id: '1',
      name: 'Sunita Kumar',
      relationship: 'Spouse',
      phone: '+919876543220',
    },
    {
      id: '2',
      name: 'Ramesh Kumar',
      relationship: 'Father',
      phone: '+919876543221',
    },
  ],
  allergies: ['Penicillin', 'Peanuts'],
  bloodGroup: 'O+',
  dependents: [
    {
      id: '1',
      name: 'Aarav Kumar',
      relationship: 'Son',
      dateOfBirth: new Date('2010-04-12'),
    },
    {
      id: '2',
      name: 'Ananya Kumar',
      relationship: 'Daughter',
      dateOfBirth: new Date('2013-09-25'),
    },
  ],
};

export const getMedicalData = async (): Promise<MedicalData> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockMedicalData;
};

export const saveMedicalData = async (data: MedicalData): Promise<MedicalData> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('Saving medical data:', data);
  return data;
};
