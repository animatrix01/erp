import { DashboardStatistics } from '../types';

export const mockDashboardStats: DashboardStatistics = {
  totalFaculty: 245,
  phdHolders: 187,
  facultyDistribution: {
    'Professor': 45,
    'Associate Professor': 78,
    'Assistant Professor': 92,
    'Lecturer': 30,
  },
};

export const getDashboardStatistics = async (): Promise<DashboardStatistics> => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return mockDashboardStats;
};
