import { Qualification } from '../types';

export const mockQualifications: Qualification[] = [
  {
    id: '1',
    degreeName: 'Ph.D. in Computer Science',
    institution: 'Indian Institute of Technology, Delhi',
    passingYear: 2015,
    percentage: 85.5,
    isPHD: true,
    thesisTitle: 'Machine Learning Algorithms for Natural Language Processing',
    researchGuide: 'Dr. Suresh Menon',
    researchArea: 'Artificial Intelligence',
  },
  {
    id: '2',
    degreeName: 'M.Tech in Computer Science',
    institution: 'Indian Institute of Technology, Bombay',
    passingYear: 2010,
    percentage: 82.0,
    isPHD: false,
  },
  {
    id: '3',
    degreeName: 'B.Tech in Computer Engineering',
    institution: 'Delhi College of Engineering',
    passingYear: 2008,
    percentage: 78.5,
    isPHD: false,
  },
];

export const getQualifications = async (): Promise<Qualification[]> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockQualifications;
};

export const saveQualifications = async (qualifications: Qualification[]): Promise<Qualification[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log('Saving qualifications:', qualifications);
  return qualifications;
};
