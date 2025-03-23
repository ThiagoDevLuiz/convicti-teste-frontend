<template>
  <div class="space-y-4">
    <h1 class="text-[32px] font-bold">Estatísticas</h1>
    <div class="grid grid-cols-1 gap-3 lg:gap-6 md:grid-cols-2 lg:grid-cols-3">
      <template v-if="isLoading">
        <CardSkeleton v-for="index in 3" :key="`skeleton-${index}`" />
      </template>
      <template v-else>
        <CardCategory
          v-for="card in filteredCardsCategory"
          :key="card.title"
          :card="card" />
      </template>
    </div>

    <div
      v-if="hasPermission('Feedbacks')"
      class="w-full bg-card rounded-lg px-4 lg:px-7 pt-4 pb-6 space-y-1">
      <h1 class="text-xl font-semibold">Feedbacks</h1>
      <TableFeedbacks />
    </div>

    <div
      v-if="hasPermission('Novas Funcionalidades')"
      class="w-full bg-card rounded-lg px-4 lg:px-7 pt-4 pb-6 space-y-1">
      <h1 class="text-xl font-semibold">Novas Funcionalidades</h1>
      <TableNewFeatures />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import AppImages from '~~/public/images';
import CardCategory, { type Card } from './components/CardCategory.vue';
import CardSkeleton from './components/CardSkeleton.vue';
import TableFeedbacks from './components/TableFeedbacks.vue';
import TableNewFeatures from './components/TableNewFeatures.vue';
import { useDownloads } from '~/composables/useDownloads';
import { useEvaluations } from '~/composables/useEvaluations';
import { useErrors } from '~/composables/useErrors';
import { usePermissions } from '~/composables/usePermissions';
import { useAuthStore } from '~/stores/auth';

const { hasPermission, getUserPermissions } = usePermissions();
const userPermissions = computed(() => getUserPermissions());

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

const filteredCardsCategory = computed(() => {
  const permissionMap = {
    Downloads: 'Downloads',
    Avaliações: 'Avaliações',
    Erros: 'Erros',
  };

  return cardsCategory.value.filter(card =>
    hasPermission(
      permissionMap[card.title as keyof typeof permissionMap] || '',
    ),
  );
});

const {
  stats: downloadStats,
  loading: downloadsLoading,
  fetchDownloadsStats,
} = useDownloads();

const {
  stats: evaluationStats,
  loading: evaluationsLoading,
  fetchEvaluationsStats,
} = useEvaluations();

const {
  stats: errorStats,
  loading: errorsLoading,
  fetchErrorsStats,
} = useErrors();

const isLoading = computed(
  () =>
    downloadsLoading.value || evaluationsLoading.value || errorsLoading.value,
);

const isValidNumber = (value: number | undefined): boolean =>
  value !== undefined && value !== null && !isNaN(value) && isFinite(value);

const updateCardData = (
  title: string,
  mainValue: number | undefined,
  androidValue: number | undefined,
  iosValue: number | undefined,
  variationValue?: number | undefined,
) => {
  const card = cardsCategory.value.find(card => card.title === title);
  if (card) {
    card.value = isValidNumber(mainValue) ? Number(mainValue) : 0;
    card.android = isValidNumber(androidValue) ? Number(androidValue) : 0;
    card.apple = isValidNumber(iosValue) ? Number(iosValue) : 0;

    if (variationValue !== undefined && 'variation' in card) {
      card.variation = isValidNumber(variationValue)
        ? Number(variationValue)
        : 0;
    }
  }
};

const loadData = async () => {
  try {
    await Promise.all([
      loadDownloadsData(),
      loadEvaluationsData(),
      loadErrorsData(),
    ]);
  } catch (error) {
    console.error('Erro ao carregar dados do dashboard:', error);
  }
};

const loadDownloadsData = async () => {
  try {
    await fetchDownloadsStats();
    updateCardData(
      'Downloads',
      downloadStats.value.total,
      downloadStats.value.android,
      downloadStats.value.ios,
    );
  } catch (error) {
    console.error('Erro ao carregar dados de downloads:', error);
  }
};

const loadEvaluationsData = async () => {
  try {
    await fetchEvaluationsStats();
    updateCardData(
      'Avaliações',
      evaluationStats.value.average,
      evaluationStats.value.android,
      evaluationStats.value.ios,
    );
  } catch (error) {
    console.error('Erro ao carregar dados de avaliações:', error);
  }
};

const loadErrorsData = async () => {
  try {
    await fetchErrorsStats();
    updateCardData(
      'Erros',
      errorStats.value.total,
      errorStats.value.android,
      errorStats.value.ios,
      errorStats.value.variation,
    );
  } catch (error) {
    console.error('Erro ao carregar dados de erros:', error);
  }
};

onMounted(loadData);
</script>
