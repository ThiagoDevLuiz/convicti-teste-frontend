import { ref } from 'vue';

export interface ErrorStats {
  total: number;
  android: number;
  ios: number;
  variation: number;
}

export interface ErrorItem {
  id: number;
  device_id: number;
  details: string;
  created_at: string;
  updated_at: string;
  platform: 'ANDROID' | 'IOS';
}

export interface ErrorResponse {
  data: {
    current_page: number;
    data: ErrorItem[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
  };
}

export interface ErrorStatsResponse {
  total: number;
  platforms: {
    ANDROID: number;
    IOS: number;
  };
  variation: number;
}

interface ErrorUtils {
  stats: Ref<ErrorStats>;
  loading: Ref<boolean>;
  error: Ref<string | null>;
  fetchErrorsStats: () => Promise<ErrorStats>;
}

export function useErrors(): ErrorUtils {
  const stats = ref<ErrorStats>({
    total: 0,
    android: 0,
    ios: 0,
    variation: 0,
  });

  const loading = ref(false);
  const error = ref<string | null>(null);

  const countPlatformItems = (
    items: ErrorItem[],
  ): { android: number; ios: number } => {
    let androidCount = 0;
    let iosCount = 0;

    for (const item of items) {
      if (item.platform === 'ANDROID') {
        androidCount++;
      } else if (item.platform === 'IOS') {
        iosCount++;
      }
    }

    return { android: androidCount, ios: iosCount };
  };

  const fetchAdditionalPages = async (
    pages: number[],
    baseUrl: string,
  ): Promise<ErrorItem[]> => {
    const { $fetchWithAuth } = useNuxtApp();

    const pagePromises = pages.map(page =>
      $fetchWithAuth(`${baseUrl}?page=${page}`, { method: 'GET' }),
    );

    const responses = (await Promise.all(pagePromises)) as ErrorResponse[];

    return responses.flatMap(response => response.data.data);
  };

  const fetchErrorsStats = async (): Promise<ErrorStats> => {
    loading.value = true;
    error.value = null;

    try {
      const { $fetchWithAuth } = useNuxtApp();

      const firstPageResponse = (await $fetchWithAuth('/errors', {
        method: 'GET',
      })) as ErrorResponse;

      const total = firstPageResponse.data.total;

      if (total === 0) {
        stats.value = {
          total: 0,
          android: 0,
          ios: 0,
          variation: 0,
        };
        return stats.value;
      }

      const firstPageItems = firstPageResponse.data.data;
      const { android: firstPageAndroid, ios: firstPageIos } =
        countPlatformItems(firstPageItems);

      const lastPage = firstPageResponse.data.last_page;
      let androidCount = firstPageAndroid;
      let iosCount = firstPageIos;
      let itemsProcessed = firstPageItems.length;

      if (lastPage > 1) {
        let additionalItems: ErrorItem[] = [];

        if (lastPage <= 3) {
          const additionalPages = Array.from(
            { length: lastPage - 1 },
            (_, i) => i + 2,
          );
          additionalItems = await fetchAdditionalPages(
            additionalPages,
            '/errors',
          );
        } else {
          const middlePage = Math.ceil(lastPage / 2);
          const pagesToFetch = [middlePage, lastPage].filter(p => p !== 1);
          additionalItems = await fetchAdditionalPages(pagesToFetch, '/errors');
        }

        const { android, ios } = countPlatformItems(additionalItems);
        androidCount += android;
        iosCount += ios;
        itemsProcessed += additionalItems.length;
      }

      const variation = -5;

      if (lastPage <= 3) {
        stats.value = {
          total,
          android: androidCount,
          ios: iosCount,
          variation,
        };
      } else {
        const sampleAndroidRatio = androidCount / itemsProcessed;
        const sampleIosRatio = iosCount / itemsProcessed;

        stats.value = {
          total,
          android: Math.round(total * sampleAndroidRatio),
          ios: Math.round(total * sampleIosRatio),
          variation,
        };
      }

      return stats.value;
    } catch (err: any) {
      error.value =
        err.data?.message || 'Falha ao buscar estatísticas de erros';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    stats,
    loading,
    error,
    fetchErrorsStats,
  };
}
