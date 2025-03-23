<template>
  <div class="space-y-4">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead class="min-w-[200px] w-full pl-0"
            >Funcionalidade</TableHead
          >
          <TableHead class="min-w-28">Taxa De Uso</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <template v-if="loading">
          <TableRow
            v-for="index in 3"
            :key="`skeleton-${index}`"
            class="animate-pulse">
            <TableCell
              v-for="col in 2"
              :key="`skeleton-cell-${col}`"
              class="py-4">
              <Skeleton class="h-4 w-full" />
            </TableCell>
          </TableRow>
        </template>
        <template v-else-if="error">
          <TableRow>
            <TableCell colspan="2" class="text-center py-8 text-destructive">
              {{ error }}
            </TableCell>
          </TableRow>
        </template>
        <template v-else>
          <TableRow
            v-for="(newFeature, index) in newFeatures"
            :key="newFeature.id"
            :class="index % 2 === 0 ? 'bg-card' : 'bg-background'">
            <TableCell class="text-base">{{ newFeature.feature }}</TableCell>
            <TableCell class="text-end text-base text-accent font-bold">
              {{ newFeature.tax }}%
            </TableCell>
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
import {
  Pagination,
  PaginationList,
  PaginationListItem,
  PaginationNext,
  PaginationPrev,
  PaginationEllipsis,
} from '~/components/ui/pagination';

export type NewFeature = {
  id: number;
  feature: string;
  tax: number;
};

type FeatureItem = {
  id: number;
  name: string;
  is_new: number;
  created_at: string;
  updated_at: string;
  total_usage: number;
};

const newFeatures = ref<NewFeature[]>([]);
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
  loadFeaturesData();
};

const mapApiToFeatures = (features: FeatureItem[]): NewFeature[] => {
  return features.map(item => ({
    id: item.id,
    feature: item.name,
    tax: item.total_usage,
  }));
};

const loadFeaturesData = async () => {
  loading.value = true;
  error.value = null;

  try {
    const { $fetchWithAuth } = useNuxtApp();
    const response = (await $fetchWithAuth(
      `/features?is_new=1&page=${pagination.value.currentPage}`,
      { method: 'GET' },
    )) as any;

    if (response?.data) {
      updatePaginationInfo(response.data);

      if (Array.isArray(response.data.data)) {
        newFeatures.value = mapApiToFeatures(response.data.data);
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
    error.value = 'Falha ao carregar funcionalidades';
  }
};

onMounted(loadFeaturesData);
</script>
