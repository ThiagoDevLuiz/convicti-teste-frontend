import { ref } from 'vue';

export interface DownloadStats {
  total: number;
  android: number;
  ios: number;
}

export interface DownloadItem {
  id: number;
  device_id: number;
  platform: 'ANDROID' | 'IOS';
  created_at: string;
  updated_at: string;
}

export interface DownloadResponse {
  data: {
    current_page: number;
    data: DownloadItem[];
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

export interface DownloadStatResponse {
  total: number;
  platforms: {
    ANDROID: number;
    IOS: number;
  };
}

interface DownloadUtils {
  stats: Ref<DownloadStats>;
  loading: Ref<boolean>;
  error: Ref<string | null>;
  fetchDownloadsStats: () => Promise<DownloadStats>;
}

export function useDownloads(): DownloadUtils {
  const stats = ref<DownloadStats>({
    total: 0,
    android: 0,
    ios: 0,
  });

  const loading = ref(false);
  const error = ref<string | null>(null);

  const countPlatformItems = (
    items: DownloadItem[],
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
  ): Promise<DownloadItem[]> => {
    const { $fetchWithAuth } = useNuxtApp();

    const pagePromises = pages.map(page =>
      $fetchWithAuth(`${baseUrl}?page=${page}`, { method: 'GET' }),
    );

    const responses = (await Promise.all(pagePromises)) as DownloadResponse[];

    return responses.flatMap(response => response.data.data);
  };

  const fetchDownloadsStats = async (): Promise<DownloadStats> => {
    loading.value = true;
    error.value = null;

    try {
      const { $fetchWithAuth } = useNuxtApp();

      const firstPageResponse = (await $fetchWithAuth('/downloads', {
        method: 'GET',
      })) as DownloadResponse;

      const total = firstPageResponse.data.total;

      if (total === 0) {
        stats.value = { total: 0, android: 0, ios: 0 };
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
        let additionalItems: DownloadItem[] = [];

        if (lastPage <= 3) {
          const additionalPages = Array.from(
            { length: lastPage - 1 },
            (_, i) => i + 2,
          );
          additionalItems = await fetchAdditionalPages(
            additionalPages,
            '/downloads',
          );
        } else {
          const middlePage = Math.ceil(lastPage / 2);
          const pagesToFetch = [middlePage, lastPage].filter(p => p !== 1);
          additionalItems = await fetchAdditionalPages(
            pagesToFetch,
            '/downloads',
          );
        }

        const { android, ios } = countPlatformItems(additionalItems);
        androidCount += android;
        iosCount += ios;
        itemsProcessed += additionalItems.length;
      }

      if (lastPage <= 3) {
        stats.value = {
          total,
          android: androidCount,
          ios: iosCount,
        };
      } else {
        // Caso contrário, extrapolamos baseado na amostra
        const sampleAndroidRatio = androidCount / itemsProcessed;
        const sampleIosRatio = iosCount / itemsProcessed;

        stats.value = {
          total,
          android: Math.round(total * sampleAndroidRatio),
          ios: Math.round(total * sampleIosRatio),
        };
      }

      return stats.value;
    } catch (err: any) {
      error.value =
        err.data?.message || 'Falha ao buscar estatísticas de downloads';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    stats,
    loading,
    error,
    fetchDownloadsStats,
  };
}
