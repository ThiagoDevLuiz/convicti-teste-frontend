<template>
  <div class="space-y-4">
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead class="min-w-[300px] pl-0">Avaliação</TableHead>
          <TableHead class="min-w-[100px] 2xl:min-w-[120px]">Data</TableHead>
          <TableHead class="min-w-[100px] 2xl:min-w-[120px]">
            Avaliação
          </TableHead>
          <TableHead class="min-w-[300px]"> Melhorias </TableHead>
          <TableHead class="2xl:min-w-[120px]"> Plataforma </TableHead>
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
              <div class="h-4 bg-muted/40 rounded-md"></div>
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
                    v-for="(improvement, index) in feedback.improvements"
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

          <!-- Páginas -->
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
  loadFeedbacksData();
};

// Função para mapear os dados de avaliações para o formato da tabela
const mapEvaluationsToFeedbacks = (evaluations: EvaluationItem[]) => {
  return evaluations.map((item: EvaluationItem) => {
    // Formata a data (ex: 2025-03-19T15:50:19.000000Z -> 19/03/25)
    const dateObj = new Date(item.created_at);
    const formattedDate = dateObj.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    });

    // Extrai as melhorias do item, se existirem
    const improvements = item.improvements
      ? Array.isArray(item.improvements)
        ? item.improvements
        : typeof item.improvements === 'string'
        ? [item.improvements]
        : []
      : [];

    return {
      id: item.id,
      avaliation: item.description || '',
      date: formattedDate,
      rating: String(item.evaluation || item.score || '0'),
      improvements: improvements,
      platform: item.platform === 'ANDROID' ? 'Android' : 'IOS',
    };
  });
};

// Função para buscar os dados para a tabela de feedbacks
const loadFeedbacksData = async () => {
  loading.value = true;
  error.value = null;

  try {
    const { $fetchWithAuth } = useNuxtApp();

    console.log(
      `Buscando página ${pagination.value.currentPage} de feedbacks...`,
    );

    // Buscar dados com paginação
    const response = (await $fetchWithAuth(
      `/evaluations?page=${pagination.value.currentPage}`,
      {
        method: 'GET',
      },
    )) as any;

    console.log('Resposta recebida:', response);

    // Atualiza informações de paginação
    if (response && response.data) {
      pagination.value = {
        currentPage: response.data.current_page || 1,
        lastPage: response.data.last_page || 1,
        perPage: response.data.per_page || 15,
        total: response.data.total || 0,
      };

      console.log('Informações de paginação:', pagination.value);

      // Se a resposta tiver os dados no formato esperado
      if (Array.isArray(response.data.data)) {
        feedbacks.value = mapEvaluationsToFeedbacks(response.data.data);
        console.log(`Mapeados ${feedbacks.value.length} feedbacks.`);
      } else {
        console.error('Formato de dados inesperado:', response.data);
        error.value = 'Formato de dados inesperado';
      }
    } else {
      console.error('Estrutura de resposta inválida:', response);
      error.value = 'Estrutura de resposta inválida';
    }
  } catch (err: any) {
    console.error('Erro ao carregar dados de feedbacks:', err);
    // Mostrar mensagem detalhada do erro
    if (err.data && err.data.message) {
      error.value = `Erro: ${err.data.message}`;
    } else if (err.message) {
      error.value = `Erro: ${err.message}`;
    } else {
      error.value = 'Falha ao carregar feedbacks';
    }
  } finally {
    loading.value = false;
  }
};

// Carrega os dados quando o componente for montado
onMounted(() => {
  loadFeedbacksData();
});
</script>
