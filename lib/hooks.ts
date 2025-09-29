import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

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

export function useDeleteUrl() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slug: string): Promise<{ message: string }> => {
      const response = await fetch(`/api/delete/${slug}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete URL');
      }
      return response.json();
    },
    onSuccess: (_, slug) => {
      // Invalidate and refetch the URLs list immediately
      queryClient.invalidateQueries({ queryKey: ['urls'] });
      // Also invalidate stats for the deleted URL
      queryClient.invalidateQueries({ queryKey: ['stats', slug] });
      // Force refetch to get immediate updated data
      queryClient.refetchQueries({ queryKey: ['urls'] });
    },
  });
}

export function useCreateUrl() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ originalUrl, customSlug }: { originalUrl: string; customSlug?: string }): Promise<{ shortUrl: string }> => {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          originalUrl,
          customSlug: customSlug || undefined,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to shorten URL');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidate and immediately refetch the URLs list when a new URL is created
      queryClient.invalidateQueries({ queryKey: ['urls'] });
      // Force refetch to get the new URL immediately
      queryClient.refetchQueries({ queryKey: ['urls'] });
    },
  });
}

// Hook to manually invalidate all caches (useful for refresh scenarios)
export function useInvalidateCache() {
  const queryClient = useQueryClient();

  return {
    invalidateUrls: () => queryClient.invalidateQueries({ queryKey: ['urls'] }),
    invalidateStats: (slug?: string) => {
      if (slug) {
        queryClient.invalidateQueries({ queryKey: ['stats', slug] });
      } else {
        queryClient.invalidateQueries({ queryKey: ['stats'] });
      }
    },
    invalidateAll: () => queryClient.invalidateQueries(),
  };
}