<template>
  <div class="space-y-4">
    <h1 class="text-[32px] font-bold">Estatísticas</h1>
    <div class="grid grid-cols-1 gap-3 lg:gap-6 md:grid-cols-2 lg:grid-cols-3">
      <CardCategory
        v-for="card in cardsCategory"
        :key="card.title"
        :card="card" />
    </div>

    <div class="w-full bg-card rounded-lg px-4 lg:px-7 pt-4 pb-6 space-y-1">
      <h1 class="text-xl font-semibold">Feedbacks</h1>
      <TableFeedbacks />
    </div>

    <div class="w-full bg-card rounded-lg px-4 lg:px-7 pt-4 pb-6 space-y-1">
      <h1 class="text-xl font-semibold">Novas Funcionalidades</h1>
      <TableNewFeatures />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AppImages from '~~/public/images';
import CardCategory, { type Card } from './components/CardCategory.vue';
import TableFeedbacks from './components/TableFeedbacks.vue';
import TableNewFeatures from './components/TableNewFeatures.vue';
import { useDownloads } from '~/composables/useDownloads';
import { useEvaluations } from '~/composables/useEvaluations';
import { useErrors } from '~/composables/useErrors';

const cardsCategory = ref<Card[]>([
  {
    title: 'Downloads',
    icon: AppImages.DownloadIcon,
    value: 0,
    android: 0,
    apple: 0,
  },
  {
    title: 'Avaliações',
    icon: AppImages.AvaliacoesIcon,
    value: 0,
    android: 0,
    apple: 0,
  },
  {
    title: 'Erros',
    icon: AppImages.ErrorIcon,
    value: 0,
    android: 0,
    apple: 0,
    variation: 0,
  },
]);

const {
  stats: downloadStats,
  loading: downloadsLoading,
  error: downloadsError,
  fetchDownloadsStats,
} = useDownloads();

const {
  stats: evaluationStats,
  loading: evaluationsLoading,
  error: evaluationsError,
  fetchEvaluationsStats,
} = useEvaluations();

const {
  stats: errorStats,
  loading: errorsLoading,
  error: errorsError,
  fetchErrorsStats,
} = useErrors();

const loadDownloadsData = async () => {
  try {
    await fetchDownloadsStats();

    const downloadsCard = cardsCategory.value.find(
      card => card.title === 'Downloads',
    );
    if (downloadsCard) {
      const total = downloadStats.value.total;
      const android = downloadStats.value.android;
      const ios = downloadStats.value.ios;

      downloadsCard.value = isValidNumber(total) ? total : 0;
      downloadsCard.android = isValidNumber(android) ? android : 0;
      downloadsCard.apple = isValidNumber(ios) ? ios : 0;
    }
  } catch (error) {
    // Erro ao carregar dados de downloads
  }
};

const loadEvaluationsData = async () => {
  try {
    await fetchEvaluationsStats();

    const evaluationsCard = cardsCategory.value.find(
      card => card.title === 'Avaliações',
    );
    if (evaluationsCard) {
      const average = evaluationStats.value.average;
      const android = evaluationStats.value.android;
      const ios = evaluationStats.value.ios;

      evaluationsCard.value = isValidNumber(average) ? average : 0;
      evaluationsCard.android = isValidNumber(android) ? android : 0;
      evaluationsCard.apple = isValidNumber(ios) ? ios : 0;
    }
  } catch (error) {
    // Erro ao carregar dados de avaliações
  }
};

const isValidNumber = (value: number | undefined): boolean => {
  return (
    value !== undefined && value !== null && !isNaN(value) && isFinite(value)
  );
};

const loadErrorsData = async () => {
  try {
    await fetchErrorsStats();

    const errorsCard = cardsCategory.value.find(card => card.title === 'Erros');
    if (errorsCard) {
      const total = errorStats.value.total;
      const android = errorStats.value.android;
      const ios = errorStats.value.ios;
      const variation = errorStats.value.variation;

      errorsCard.value = isValidNumber(total) ? total : 0;
      errorsCard.android = isValidNumber(android) ? android : 0;
      errorsCard.apple = isValidNumber(ios) ? ios : 0;
      errorsCard.variation = isValidNumber(variation) ? variation : 0;
    }
  } catch (error) {
    // Erro ao carregar dados de erros
  }
};

onMounted(() => {
  loadDownloadsData();
  loadEvaluationsData();
  loadErrorsData();
});
</script>
