import { Publication } from '../types';

export const mockPublications: Publication[] = [
  {
    id: '1',
    journalTitle: 'IEEE Transactions on Neural Networks',
    conferenceDetails: 'International Conference on Machine Learning 2020',
    doi: 'https://doi.org/10.1109/TNNLS.2020.1234567',
    impactFactor: 8.5,
  },
  {
    id: '2',
    journalTitle: 'Journal of Artificial Intelligence Research',
    doi: 'https://doi.org/10.1613/jair.2019.987654',
    impactFactor: 6.2,
  },
];

export const getPublications = async (): Promise<Publication[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockPublications;
};

export const savePublications = async (publications: Publication[]): Promise<Publication[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('Saving publications:', publications);
  return publications;
};
