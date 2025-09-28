import { useQuery } from '@tanstack/react-query';

interface UrlRecord {
  slug: string;
  originalUrl: string;
  hitCount: number;
  createdAt: string;
}

interface DetailStatsData {
  slug: string;
  url: string;
  createdAt: string;
  totalClicks: number;
  clicksOverTime: Array<{ timestamp: string; clicks: number }>;
  browserDeviceStats: Array<{ browser: string; device: string; clicks: number }>;
  topReferrers: Array<{ referrer: string; clicks: number }>;
  interval: string;
}

export function useUrls() {
  return useQuery({
    queryKey: ['urls'],
    queryFn: async (): Promise<UrlRecord[]> => {
      const response = await fetch('/api/urls');
      if (!response.ok) {
        throw new Error('Failed to fetch URLs');
      }
      return response.json();
    },
  });
}

export function useStats(slug: string, interval: string) {
  return useQuery({
    queryKey: ['stats', slug, interval],
    queryFn: async (): Promise<DetailStatsData> => {
      const response = await fetch(`/api/stats/${slug}?interval=${interval}`);
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      return response.json();
    },
    enabled: !!slug,
  });
}