<template>
  <div class="space-y-4">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead class="min-w-[300px] pl-0">Avaliação</TableHead>
          <TableHead class="min-w-[100px] 2xl:min-w-[120px]">Data</TableHead>
          <TableHead class="min-w-[100px] 2xl:min-w-[120px]"
            >Avaliação</TableHead
          >
          <TableHead class="min-w-[300px]">Melhorias</TableHead>
          <TableHead class="2xl:min-w-[120px]">Plataforma</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <template v-if="loading">
          <TableRow
            v-for="index in 3"
            :key="`skeleton-${index}`"
            class="animate-pulse">
            <TableCell
              v-for="col in 5"
              :key="`skeleton-cell-${col}`"
              class="py-4">
              <Skeleton class="h-4 w-full" />
            </TableCell>
          </TableRow>
        </template>
        <template v-else-if="error">
          <TableRow>
            <TableCell colspan="5" class="text-center py-8 text-destructive">
              {{ error }}
            </TableCell>
          </TableRow>
        </template>
        <template v-else>
          <TableRow
            v-for="(feedback, index) in feedbacks"
            :key="feedback.id"
            :class="index % 2 === 0 ? 'bg-background' : 'bg-card'">
            <TableCell>
              <div class="line-clamp-2 hover:line-clamp-none">
                {{ feedback.avaliation }}
              </div>
            </TableCell>
            <TableCell>{{ feedback.date }}</TableCell>
            <TableCell>{{ feedback.rating }}</TableCell>
            <TableCell>
              <template v-if="feedback.improvements.length > 0">
                <div class="line-clamp-2 hover:line-clamp-none">
                  <span
                    v-for="improvement in feedback.improvements"
                    :key="improvement"
                    class="block mb-1">
                    {{ improvement }}
                  </span>
                </div>
              </template>
              <template v-else> - </template>
            </TableCell>
            <TableCell>{{ feedback.platform }}</TableCell>
          </TableRow>
        </template>
      </TableBody>
    </Table>

    <div
      v-if="!loading && !error && pagination.lastPage > 1"
      class="flex items-center justify-center pt-2">
      <Pagination
        :items-per-page="pagination.perPage"
        :total="pagination.total"
        :default-page="pagination.currentPage"
        :page="pagination.currentPage"
        @update:page="changePage"
        :sibling-count="1"
        show-edges>
        <PaginationList class="flex items-center gap-1">
          <PaginationListItem class="h-9" :value="pagination.currentPage - 1">
            <PaginationPrev class="hover:bg-primary hover:text-card" />
          </PaginationListItem>

          <template v-for="page in displayedPages" :key="page">
            <PaginationListItem v-if="page > 0" :value="page" as-child>
              <Button
                size="icon"
                class="h-9 w-9 hover:bg-primary hover:text-card"
                :variant="
                  pagination.currentPage === page ? 'default' : 'outline'
                "
                @click="changePage(page)">
                {{ page }}
              </Button>
            </PaginationListItem>
            <PaginationListItem v-else :value="0">
              <PaginationEllipsis />
            </PaginationListItem>
          </template>

          <PaginationListItem class="h-9" :value="pagination.currentPage + 1">
            <PaginationNext class="hover:bg-primary hover:text-card" />
          </PaginationListItem>
        </PaginationList>
      </Pagination>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import type { EvaluationItem } from '~/composables/useEvaluations';
import {
  Pagination,
  PaginationList,
  PaginationListItem,
  PaginationNext,
  PaginationPrev,
  PaginationEllipsis,
} from '~/components/ui/pagination';

export type Feedback = {
  id: number;
  avaliation: string;
  date: string;
  rating: string;
  improvements: string[];
  platform: string;
};

const feedbacks = ref<Feedback[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);

const pagination = ref({
  currentPage: 1,
  lastPage: 1,
  perPage: 15,
  total: 0,
});

const displayedPages = computed(() => {
  const { lastPage, currentPage } = pagination.value;

  if (lastPage <= 7) {
    return Array.from({ length: lastPage }, (_, i) => i + 1);
  }

  const pages = [1];

  if (currentPage > 3) {
    pages.push(-1);
  }

  const startPage = Math.max(2, currentPage - 1);
  const endPage = Math.min(lastPage - 1, currentPage + 1);

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  if (currentPage < lastPage - 2) {
    pages.push(-2);
  }

  if (lastPage > 1) {
    pages.push(lastPage);
  }

  return pages;
});

const changePage = (page: number) => {
  pagination.value.currentPage = page;
  loadFeedbacksData();
};

const mapEvaluationsToFeedbacks = (
  evaluations: EvaluationItem[],
): Feedback[] => {
  return evaluations.map(item => ({
    id: item.id,
    avaliation: item.description || '',
    date: formatDate(item.created_at),
    rating: String(item.evaluation || item.score || '0'),
    improvements: extractImprovements(item.improvements),
    platform: item.platform === 'ANDROID' ? 'Android' : 'IOS',
  }));
};

const formatDate = (dateString: string): string => {
  const dateObj = new Date(dateString);
  return dateObj.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
  });
};

const extractImprovements = (improvements: any): string[] => {
  if (!improvements) return [];

  if (Array.isArray(improvements)) {
    return improvements;
  }

  return typeof improvements === 'string' ? [improvements] : [];
};

const loadFeedbacksData = async () => {
  loading.value = true;
  error.value = null;

  try {
    const { $fetchWithAuth } = useNuxtApp();
    const response = (await $fetchWithAuth(
      `/evaluations?page=${pagination.value.currentPage}`,
      { method: 'GET' },
    )) as any;

    if (response?.data) {
      updatePaginationInfo(response.data);

      if (Array.isArray(response.data.data)) {
        feedbacks.value = mapEvaluationsToFeedbacks(response.data.data);
      } else {
        error.value = 'Formato de dados inesperado';
      }
    } else {
      error.value = 'Estrutura de resposta inválida';
    }
  } catch (err: any) {
    handleError(err);
  } finally {
    loading.value = false;
  }
};

const updatePaginationInfo = (data: any) => {
  pagination.value = {
    currentPage: data.current_page || 1,
    lastPage: data.last_page || 1,
    perPage: data.per_page || 15,
    total: data.total || 0,
  };
};

const handleError = (err: any) => {
  if (err.data?.message) {
    error.value = `Erro: ${err.data.message}`;
  } else if (err.message) {
    error.value = `Erro: ${err.message}`;
  } else {
    error.value = 'Falha ao carregar feedbacks';
  }
};

onMounted(loadFeedbacksData);
</script>
