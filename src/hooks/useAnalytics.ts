import { useQuery } from '@tanstack/react-query';

interface AnalyticsData {
  users: number;
  revenue: number;
  growth: number;
  chartData: { name: string; value: number }[];
}

const fetchAnalytics = async (): Promise<AnalyticsData> => {
  // Simulated API call
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        users: 12500,
        revenue: 45000,
        growth: 23.5,
        chartData: [
          { name: 'Jan', value: 400 },
          { name: 'Feb', value: 300 },
          { name: 'Mar', value: 600 },
          { name: 'Apr', value: 800 },
          { name: 'May', value: 500 },
          { name: 'Jun', value: 900 },
        ],
      });
    }, 1000);
  });
};

export const useAnalytics = () => {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: fetchAnalytics,
    staleTime: 5 * 60 * 1000,
  });
};