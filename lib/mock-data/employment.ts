import { EmploymentRecord } from '../types';

export const mockEmploymentHistory: EmploymentRecord[] = [
  {
    id: '1',
    organizationName: 'National Institute of Technology, Trichy',
    designation: 'Assistant Professor',
    fromDate: new Date('2015-07-01'),
    toDate: new Date('2018-06-30'),
    totalExperienceYears: 3.0,
  },
  {
    id: '2',
    organizationName: 'Tech Solutions Pvt Ltd',
    designation: 'Senior Software Engineer',
    fromDate: new Date('2010-08-15'),
    toDate: new Date('2015-06-30'),
    totalExperienceYears: 4.9,
  },
];

export const getEmploymentHistory = async (): Promise<EmploymentRecord[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockEmploymentHistory;
};

export const saveEmploymentHistory = async (records: EmploymentRecord[]): Promise<EmploymentRecord[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('Saving employment history:', records);
  return records;
};
