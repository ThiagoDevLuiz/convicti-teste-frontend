import { ref } from 'vue';

export interface EvaluationStats {
  average: number;
  android: number;
  ios: number;
  total: number;
}

export interface EvaluationItem {
  id: number;
  device_id: number;
  score?: number;
  evaluation?: number;
  comment?: string;
  description?: string;
  improvements?: string[] | string;
  created_at: string;
  updated_at: string;
  platform: 'ANDROID' | 'IOS';
}

export interface EvaluationResponse {
  data: {
    current_page: number;
    data: EvaluationItem[];
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

export interface EvaluationStatsResponse {
  total: number;
  average: number;
  platforms: {
    ANDROID: {
      count: number;
      average: number;
    };
    IOS: {
      count: number;
      average: number;
    };
  };
}

interface EvaluationUtils {
  stats: Ref<EvaluationStats>;
  loading: Ref<boolean>;
  error: Ref<string | null>;
  fetchEvaluationsStats: () => Promise<EvaluationStats>;
}

export function useEvaluations(): EvaluationUtils {
  const stats = ref<EvaluationStats>({
    average: 0,
    android: 0,
    ios: 0,
    total: 0,
  });

  const loading = ref(false);
  const error = ref<string | null>(null);

  const ensureValidNumber = (value: any): number => {
    if (typeof value === 'string') {
      value = parseFloat(value);
    }

    if (
      isNaN(value) ||
      value === undefined ||
      value === null ||
      !isFinite(value)
    ) {
      return 0;
    }
    return value;
  };

  const safeRoundToOneDecimal = (value: number): number => {
    const validValue = ensureValidNumber(value);
    return Math.round(validValue * 10) / 10;
  };

  const getScore = (item: EvaluationItem): number => {
    if (item.score !== undefined) {
      return ensureValidNumber(item.score);
    } else if (item.evaluation !== undefined) {
      return ensureValidNumber(item.evaluation);
    }
    return 0;
  };

  const countPlatformScores = (
    items: EvaluationItem[],
  ): {
    androidCount: number;
    iosCount: number;
    androidSum: number;
    iosSum: number;
  } => {
    let androidCount = 0;
    let iosCount = 0;
    let androidSum = 0;
    let iosSum = 0;

    for (const item of items) {
      const validScore = getScore(item);

      if (item.platform === 'ANDROID') {
        androidCount++;
        androidSum += validScore;
      } else if (item.platform === 'IOS') {
        iosCount++;
        iosSum += validScore;
      }
    }

    return { androidCount, iosCount, androidSum, iosSum };
  };

  const fetchAdditionalPages = async (
    pages: number[],
    baseUrl: string,
  ): Promise<EvaluationItem[]> => {
    const { $fetchWithAuth } = useNuxtApp();

    const pagePromises = pages.map(page =>
      $fetchWithAuth(`${baseUrl}?page=${page}`, { method: 'GET' }),
    );

    const responses = (await Promise.all(pagePromises)) as EvaluationResponse[];

    return responses.flatMap(response => response.data.data);
  };

  const calculateStats = (
    androidCount: number,
    iosCount: number,
    androidSum: number,
    iosSum: number,
    totalItems?: number,
  ): EvaluationStats => {
    const androidAverage = androidCount > 0 ? androidSum / androidCount : 0;
    const iosAverage = iosCount > 0 ? iosSum / iosCount : 0;
    const totalCount = totalItems ?? androidCount + iosCount;
    const weightedAverage =
      totalCount > 0 ? (androidSum + iosSum) / totalCount : 0;

    return {
      average: safeRoundToOneDecimal(weightedAverage),
      android: safeRoundToOneDecimal(androidAverage),
      ios: safeRoundToOneDecimal(iosAverage),
      total: totalCount,
    };
  };

  const fetchEvaluationsStats = async (): Promise<EvaluationStats> => {
    loading.value = true;
    error.value = null;

    try {
      const { $fetchWithAuth } = useNuxtApp();

      const firstPageResponse = (await $fetchWithAuth('/evaluations', {
        method: 'GET',
      })) as EvaluationResponse;

      const total = firstPageResponse.data.total;

      if (total === 0) {
        stats.value = {
          average: 0,
          android: 0,
          ios: 0,
          total: 0,
        };
        return stats.value;
      }

      const firstPageItems = firstPageResponse.data.data;
      const firstPageStats = countPlatformScores(firstPageItems);
      let { androidCount, iosCount, androidSum, iosSum } = firstPageStats;

      const lastPage = firstPageResponse.data.last_page;
      let itemsProcessed = firstPageItems.length;

      if (lastPage > 1) {
        let additionalItems: EvaluationItem[] = [];

        if (lastPage <= 3) {
          const additionalPages = Array.from(
            { length: lastPage - 1 },
            (_, i) => i + 2,
          );
          additionalItems = await fetchAdditionalPages(
            additionalPages,
            '/evaluations',
          );
        } else {
          const middlePage = Math.ceil(lastPage / 2);
          const pagesToFetch = [middlePage, lastPage].filter(p => p !== 1);
          additionalItems = await fetchAdditionalPages(
            pagesToFetch,
            '/evaluations',
          );
        }

        const additionalStats = countPlatformScores(additionalItems);
        androidCount += additionalStats.androidCount;
        iosCount += additionalStats.iosCount;
        androidSum += additionalStats.androidSum;
        iosSum += additionalStats.iosSum;
        itemsProcessed += additionalItems.length;
      }

      if (lastPage <= 3) {
        stats.value = calculateStats(
          androidCount,
          iosCount,
          androidSum,
          iosSum,
        );
      } else {
        const totalCount = androidCount + iosCount;
        const sampleAndroidRatio =
          totalCount > 0 ? androidCount / totalCount : 0;
        const sampleIosRatio = totalCount > 0 ? iosCount / totalCount : 0;

        const estimatedAndroidCount = Math.round(total * sampleAndroidRatio);
        const estimatedIosCount = Math.round(total * sampleIosRatio);

        const androidAverage = androidCount > 0 ? androidSum / androidCount : 0;
        const iosAverage = iosCount > 0 ? iosSum / iosCount : 0;

        const weightedAverage =
          total > 0
            ? (safeRoundToOneDecimal(androidAverage) * estimatedAndroidCount +
                safeRoundToOneDecimal(iosAverage) * estimatedIosCount) /
              total
            : 0;

        stats.value = {
          average: safeRoundToOneDecimal(weightedAverage),
          android: safeRoundToOneDecimal(androidAverage),
          ios: safeRoundToOneDecimal(iosAverage),
          total: total,
        };
      }

      if (isNaN(stats.value.average)) stats.value.average = 0;
      if (isNaN(stats.value.android)) stats.value.android = 0;
      if (isNaN(stats.value.ios)) stats.value.ios = 0;

      return stats.value;
    } catch (err: any) {
      error.value =
        err.data?.message || 'Falha ao buscar estatísticas de avaliações';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    stats,
    loading,
    error,
    fetchEvaluationsStats,
  };
}
