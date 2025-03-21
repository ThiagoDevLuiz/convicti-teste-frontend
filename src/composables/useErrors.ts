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

// Nova interface para resposta de estatísticas
export interface ErrorStatsResponse {
  total: number;
  platforms: {
    ANDROID: number;
    IOS: number;
  };
  variation: number;
}

export function useErrors() {
  const stats = ref<ErrorStats>({
    total: 0,
    android: 0,
    ios: 0,
    variation: 0,
  });

  const loading = ref(false);
  const error = ref<string | null>(null);

  const fetchErrorsStats = async () => {
    loading.value = true;
    error.value = null;

    try {
      const { $fetchWithAuth } = useNuxtApp();

      // Busca apenas a primeira página para obter informações de paginação
      const firstPageResponse = (await $fetchWithAuth('/errors', {
        method: 'GET',
      })) as ErrorResponse;

      // Obter total de erros do sistema
      const total = firstPageResponse.data.total;

      // Se não tiver dados, retorna zeros
      if (total === 0) {
        stats.value = {
          total: 0,
          android: 0,
          ios: 0,
          variation: 0,
        };
        return stats.value;
      }

      // Acompanha contadores por plataforma
      let androidCount = 0;
      let iosCount = 0;
      let itemsProcessed = 0;

      // Processa primeira página
      for (const item of firstPageResponse.data.data) {
        if (item.platform === 'ANDROID') {
          androidCount++;
        } else if (item.platform === 'IOS') {
          iosCount++;
        }
        itemsProcessed++;
      }

      // Informações sobre a paginação
      const lastPage = firstPageResponse.data.last_page;

      // Se tiver mais de 1 página, mas no máximo 3, buscamos todas
      if (lastPage > 1 && lastPage <= 3) {
        const pagePromises = [];

        for (let page = 2; page <= lastPage; page++) {
          pagePromises.push(
            $fetchWithAuth(`/errors?page=${page}`, {
              method: 'GET',
            }),
          );
        }

        const responses = (await Promise.all(pagePromises)) as ErrorResponse[];

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

        // Atualiza com valores exatos
        stats.value = {
          total,
          android: androidCount,
          ios: iosCount,
          variation: -5, // Valor simulado
        };
      }
      // Se tiver mais de 3 páginas, fazemos uma amostragem estratégica
      else if (lastPage > 3) {
        // Busca apenas mais duas páginas estratégicas: meio e última
        const middlePage = Math.ceil(lastPage / 2);

        const pages = [middlePage, lastPage];
        const uniquePages = pages.filter(p => p !== 1); // Remove a primeira página se estiver duplicada

        const pagePromises = uniquePages.map(page =>
          $fetchWithAuth(`/errors?page=${page}`, {
            method: 'GET',
          }),
        );

        const responses = (await Promise.all(pagePromises)) as ErrorResponse[];

        // Processa as respostas
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

        // A proporção na amostra (primeira, meio, última páginas)
        const sampleAndroidRatio = androidCount / itemsProcessed;
        const sampleIosRatio = iosCount / itemsProcessed;

        // Aplica a proporção ao total geral
        stats.value = {
          total,
          android: Math.round(total * sampleAndroidRatio),
          ios: Math.round(total * sampleIosRatio),
          variation: -5, // Valor simulado
        };
      }
      // Só tem 1 página
      else {
        stats.value = {
          total,
          android: androidCount,
          ios: iosCount,
          variation: -5, // Valor simulado
        };
      }

      return stats.value;
    } catch (err: any) {
      console.error('Erro ao buscar estatísticas de erros:', err);
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
