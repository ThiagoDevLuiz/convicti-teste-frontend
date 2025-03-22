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

export function useDownloads() {
  const stats = ref<DownloadStats>({
    total: 0,
    android: 0,
    ios: 0,
  });

  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchDownloadsStats = async () => {
    loading.value = true;
    error.value = null;

    try {
      const { $fetchWithAuth } = useNuxtApp();

      const firstPageResponse = (await $fetchWithAuth('/downloads', {
        method: 'GET',
      })) as DownloadResponse;

      const total = firstPageResponse.data.total;

      if (total === 0) {
        stats.value = {
          total: 0,
          android: 0,
          ios: 0,
        };
        return stats.value;
      }

      let androidCount = 0;
      let iosCount = 0;
      let itemsProcessed = 0;

      for (const item of firstPageResponse.data.data) {
        if (item.platform === 'ANDROID') {
          androidCount++;
        } else if (item.platform === 'IOS') {
          iosCount++;
        }
        itemsProcessed++;
      }

      const lastPage = firstPageResponse.data.last_page;

      if (lastPage > 1 && lastPage <= 3) {
        const pagePromises = [];

        for (let page = 2; page <= lastPage; page++) {
          pagePromises.push(
            $fetchWithAuth(`/downloads?page=${page}`, {
              method: 'GET',
            }),
          );
        }

        const responses = (await Promise.all(
          pagePromises,
        )) as DownloadResponse[];

        for (const response of responses) {
          for (const item of response.data.data) {
            if (item.platform === 'ANDROID') {
              androidCount++;
            } else if (item.platform === 'IOS') {
              iosCount++;
            }
            itemsProcessed++;
          }
        }

        stats.value = {
          total,
          android: androidCount,
          ios: iosCount,
        };
      } else if (lastPage > 3) {
        const middlePage = Math.ceil(lastPage / 2);

        const pages = [middlePage, lastPage];
        const uniquePages = pages.filter(p => p !== 1);

        const pagePromises = uniquePages.map(page =>
          $fetchWithAuth(`/downloads?page=${page}`, {
            method: 'GET',
          }),
        );

        const responses = (await Promise.all(
          pagePromises,
        )) as DownloadResponse[];

        for (const response of responses) {
          for (const item of response.data.data) {
            if (item.platform === 'ANDROID') {
              androidCount++;
            } else if (item.platform === 'IOS') {
              iosCount++;
            }
            itemsProcessed++;
          }
        }

        const sampleAndroidRatio = androidCount / itemsProcessed;
        const sampleIosRatio = iosCount / itemsProcessed;

        stats.value = {
          total,
          android: Math.round(total * sampleAndroidRatio),
          ios: Math.round(total * sampleIosRatio),
        };
      } else {
        stats.value = {
          total,
          android: androidCount,
          ios: iosCount,
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
