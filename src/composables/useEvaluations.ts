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

// Nova interface para resposta de estatísticas
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

export function useEvaluations() {
  const stats = ref<EvaluationStats>({
    average: 0,
    android: 0,
    ios: 0,
    total: 0,
  });

  const loading = ref(false);
  const error = ref<string | null>(null);

  // Função auxiliar para verificar e garantir que um número é válido
  const ensureValidNumber = (value: any): number => {
    // Se for string, converte para número
    if (typeof value === 'string') {
      value = parseFloat(value);
    }

    // Verifica se é NaN, undefined, null, Infinity ou -Infinity
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

  // Função auxiliar para arredondar para 1 casa decimal com segurança
  const safeRoundToOneDecimal = (value: number): number => {
    const validValue = ensureValidNumber(value);
    return Math.round(validValue * 10) / 10;
  };

  // Função para obter a pontuação, independente do nome do campo
  const getScore = (item: EvaluationItem): number => {
    // Verifica se é score ou evaluation e retorna o valor
    if (item.score !== undefined) {
      return ensureValidNumber(item.score);
    } else if (item.evaluation !== undefined) {
      return ensureValidNumber(item.evaluation);
    }
    return 0;
  };

  const fetchEvaluationsStats = async () => {
    loading.value = true;
    error.value = null;

    try {
      const { $fetchWithAuth } = useNuxtApp();

      // Busca apenas a primeira página para obter informações de paginação
      console.log('Buscando dados de avaliações...');
      const firstPageResponse = (await $fetchWithAuth('/evaluations', {
        method: 'GET',
      })) as EvaluationResponse;

      console.log(
        'Resposta recebida:',
        JSON.stringify(firstPageResponse, null, 2),
      );

      // Obter total de avaliações do sistema
      const total = firstPageResponse.data.total;
      console.log('Total de avaliações:', total);

      // Se não tiver dados, retorna zeros
      if (total === 0) {
        console.log('Sem dados de avaliações, retornando zeros');
        stats.value = {
          average: 0,
          android: 0,
          ios: 0,
          total: 0,
        };
        return stats.value;
      }

      let androidCount = 0;
      let iosCount = 0;
      let androidSum = 0;
      let iosSum = 0;
      let itemsProcessed = 0;

      // Processa primeira página
      console.log(
        'Processando itens da primeira página:',
        firstPageResponse.data.data.length,
      );
      for (const item of firstPageResponse.data.data) {
        // Loga o item completo para debug
        console.log('Item completo:', JSON.stringify(item));

        const validScore = getScore(item);
        console.log('Score calculado:', validScore);

        if (item.platform === 'ANDROID') {
          androidCount++;
          androidSum += validScore;
        } else if (item.platform === 'IOS') {
          iosCount++;
          iosSum += validScore;
        }
        itemsProcessed++;
      }

      console.log('Após processar primeira página:');
      console.log('Android count:', androidCount, 'Android sum:', androidSum);
      console.log('iOS count:', iosCount, 'iOS sum:', iosSum);
      console.log('Items processados:', itemsProcessed);

      // Informações sobre a paginação
      const lastPage = firstPageResponse.data.last_page;

      // Se tiver mais de 1 página, mas no máximo 3, buscamos todas
      if (lastPage > 1 && lastPage <= 3) {
        const pagePromises = [];

        for (let page = 2; page <= lastPage; page++) {
          pagePromises.push(
            $fetchWithAuth(`/evaluations?page=${page}`, {
              method: 'GET',
            }),
          );
        }

        const responses = (await Promise.all(
          pagePromises,
        )) as EvaluationResponse[];

        for (const response of responses) {
          for (const item of response.data.data) {
            const validScore = getScore(item);

            if (item.platform === 'ANDROID') {
              androidCount++;
              androidSum += validScore;
            } else if (item.platform === 'IOS') {
              iosCount++;
              iosSum += validScore;
            }
            itemsProcessed++;
          }
        }

        // Calcula médias exatas com verificação de segurança
        const androidAverage = androidCount > 0 ? androidSum / androidCount : 0;
        const iosAverage = iosCount > 0 ? iosSum / iosCount : 0;
        const totalCount = androidCount + iosCount;
        const weightedAverage =
          totalCount > 0 ? (androidSum + iosSum) / totalCount : 0;

        // Atualiza com valores exatos
        stats.value = {
          average: safeRoundToOneDecimal(weightedAverage),
          android: safeRoundToOneDecimal(androidAverage),
          ios: safeRoundToOneDecimal(iosAverage),
          total: totalCount,
        };
      }
      // Se tiver mais de 3 páginas, fazemos uma amostragem estratégica
      else if (lastPage > 3) {
        // Busca apenas mais duas páginas estratégicas: meio e última
        const middlePage = Math.ceil(lastPage / 2);

        const pages = [middlePage, lastPage];
        const uniquePages = pages.filter(p => p !== 1); // Remove a primeira página se estiver duplicada

        const pagePromises = uniquePages.map(page =>
          $fetchWithAuth(`/evaluations?page=${page}`, {
            method: 'GET',
          }),
        );

        const responses = (await Promise.all(
          pagePromises,
        )) as EvaluationResponse[];

        // Processa as respostas
        for (const response of responses) {
          for (const item of response.data.data) {
            const validScore = getScore(item);

            if (item.platform === 'ANDROID') {
              androidCount++;
              androidSum += validScore;
            } else if (item.platform === 'IOS') {
              iosCount++;
              iosSum += validScore;
            }
            itemsProcessed++;
          }
        }

        // Calcula a média das amostras
        const androidAverage = androidCount > 0 ? androidSum / androidCount : 0;
        const iosAverage = iosCount > 0 ? iosSum / iosCount : 0;

        // Estima o total por plataforma a partir da amostra
        const sampleAndroidRatio =
          itemsProcessed > 0 ? androidCount / itemsProcessed : 0;
        const sampleIosRatio =
          itemsProcessed > 0 ? iosCount / itemsProcessed : 0;

        // Estima o número total de avaliações por plataforma
        const estimatedAndroidCount = Math.round(total * sampleAndroidRatio);
        const estimatedIosCount = Math.round(total * sampleIosRatio);

        // A média geral ponderada - usamos as médias da amostra, mas com a distribuição estimada
        const weightedAverage =
          total > 0
            ? (safeRoundToOneDecimal(androidAverage) * estimatedAndroidCount +
                safeRoundToOneDecimal(iosAverage) * estimatedIosCount) /
              total
            : 0;

        // Aplica os valores estimados
        stats.value = {
          average: safeRoundToOneDecimal(weightedAverage),
          android: safeRoundToOneDecimal(androidAverage),
          ios: safeRoundToOneDecimal(iosAverage),
          total: total,
        };
      }
      // Só tem 1 página
      else {
        // Calcula médias
        const androidAverage = androidCount > 0 ? androidSum / androidCount : 0;
        const iosAverage = iosCount > 0 ? iosSum / iosCount : 0;
        const totalCount = androidCount + iosCount;
        const weightedAverage =
          totalCount > 0 ? (androidSum + iosSum) / totalCount : 0;

        stats.value = {
          average: safeRoundToOneDecimal(weightedAverage),
          android: safeRoundToOneDecimal(androidAverage),
          ios: safeRoundToOneDecimal(iosAverage),
          total: totalCount,
        };
      }

      // Verificação final para garantir que não haja valores NaN
      if (isNaN(stats.value.average)) stats.value.average = 0;
      if (isNaN(stats.value.android)) stats.value.android = 0;
      if (isNaN(stats.value.ios)) stats.value.ios = 0;

      // Antes de retornar, loga os valores finais
      console.log('Valores finais:', stats.value);
      return stats.value;
    } catch (err: any) {
      console.error('Erro ao buscar estatísticas de avaliações:', err);
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
