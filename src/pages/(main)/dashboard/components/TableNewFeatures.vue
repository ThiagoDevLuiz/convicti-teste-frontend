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

// Configuração de paginação
const pagination = ref({
  currentPage: 1,
  lastPage: 1,
  perPage: 15,
  total: 0,
});

// Função para determinar quais páginas exibir na paginação
const displayedPages = computed(() => {
  const totalPages = pagination.value.lastPage;
  const currentPage = pagination.value.currentPage;

  if (totalPages <= 7) {
    // Se tiver 7 páginas ou menos, mostra todas
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // Sempre mostra a primeira página, a última página, a atual e uma ou duas páginas antes e depois
  const pages = [1];

  // Adiciona "..." se necessário antes da página atual
  if (currentPage > 3) {
    pages.push(-1); // -1 representa "..."
  }

  // Calcula o range ao redor da página atual
  const startPage = Math.max(2, currentPage - 1);
  const endPage = Math.min(totalPages - 1, currentPage + 1);

  // Adiciona as páginas ao redor da atual
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  // Adiciona "..." se necessário depois da página atual
  if (currentPage < totalPages - 2) {
    pages.push(-2); // -2 representa "..." após a página atual
  }

  // Adiciona a última página se não for a mesma que a endPage
  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return pages;
});

// Função para mudar de página
const changePage = (page: number) => {
  pagination.value.currentPage = page;
  loadFeaturesData();
};

// Função para mapear os dados da API para o formato da tabela
const mapApiToFeatures = (features: FeatureItem[]): NewFeature[] => {
  return features.map((item: FeatureItem) => {
    return {
      id: item.id,
      feature: item.name,
      tax: item.total_usage,
    };
  });
};

// Função para buscar os dados para a tabela de funcionalidades
const loadFeaturesData = async () => {
  loading.value = true;
  error.value = null;

  try {
    const { $fetchWithAuth } = useNuxtApp();

    // Buscar dados com paginação
    const response = (await $fetchWithAuth(
      `/features?is_new=1&page=${pagination.value.currentPage}`,
      {
        method: 'GET',
      },
    )) as any;

    // Atualiza informações de paginação
    if (response && response.data) {
      pagination.value = {
        currentPage: response.data.current_page || 1,
        lastPage: response.data.last_page || 1,
        perPage: response.data.per_page || 15,
        total: response.data.total || 0,
      };

      // Se a resposta tiver os dados no formato esperado
      if (Array.isArray(response.data.data)) {
        newFeatures.value = mapApiToFeatures(response.data.data);
      } else {
        error.value = 'Formato de dados inesperado';
      }
    } else {
      error.value = 'Estrutura de resposta inválida';
    }
  } catch (err: any) {
    // Mostrar mensagem detalhada do erro
    if (err.data && err.data.message) {
      error.value = `Erro: ${err.data.message}`;
    } else if (err.message) {
      error.value = `Erro: ${err.message}`;
    } else {
      error.value = 'Falha ao carregar funcionalidades';
    }
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadFeaturesData();
});
</script>
