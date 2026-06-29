import { Certification } from '../types';

export const mockCertifications: Certification[] = [
  {
    id: '1',
    certificationName: 'AWS Certified Solutions Architect',
    issuingOrganization: 'Amazon Web Services',
    issueDate: new Date('2022-03-15'),
    expiryDate: new Date('2025-03-15'),
  },
  {
    id: '2',
    certificationName: 'Certified Kubernetes Administrator',
    issuingOrganization: 'Cloud Native Computing Foundation',
    issueDate: new Date('2021-09-20'),
    expiryDate: new Date('2024-09-20'),
  },
];

export const getCertifications = async (): Promise<Certification[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockCertifications;
};

export const saveCertifications = async (certifications: Certification[]): Promise<Certification[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('Saving certifications:', certifications);
  return certifications;
};
