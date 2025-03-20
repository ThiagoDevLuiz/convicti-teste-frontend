<template>
  <div class="space-y-4">
    <h1 class="text-[32px] font-bold mb-5">Estatísticas</h1>
    <div class="grid grid-cols-1 gap-3 lg:gap-6 md:grid-cols-2 lg:grid-cols-3">
      <CardCategory
        v-for="card in cardsCategory"
        :key="card.title"
        :card="card" />
    </div>

    <div class="w-full bg-card rounded-lg px-4 lg:px-7 pt-4 pb-6 space-y-1">
      <h1 class="text-xl font-semibold">Feedbacks</h1>
      <TableFeedbacks :feedbacks-table="feedbacksTable" />
    </div>

    <div class="w-full bg-card rounded-lg px-4 lg:px-7 pt-4 pb-6 space-y-1">
      <h1 class="text-xl font-semibold">Novas Funcionalidades</h1>
      <TableNewFeatures :new-features-table="newFeaturesTable" />
    </div>
  </div>
</template>

<script setup lang="ts">
import AppImages from '~~/public/images';
import CardCategory, { type Card } from './components/CardCategory.vue';
import TableFeedbacks, { type Feedback } from './components/TableFeedbacks.vue';
import TableNewFeatures, {
  type NewFeature,
} from './components/TableNewFeatures.vue';

const cardsCategory: Card[] = [
  {
    title: 'Downloads',
    icon: AppImages.DownloadIcon,
    value: 330,
    android: 240,
    apple: 90,
  },
  {
    title: 'Avaliações',
    icon: AppImages.AvaliacoesIcon,
    value: 4.2,
    android: 5.0,
    apple: 4.0,
  },
  {
    title: 'Erros',
    icon: AppImages.ErrorIcon,
    value: 4,
    android: 2,
    apple: 1,
  },
];

const feedbacksTable: Feedback[] = [
  {
    id: 1,
    avaliation:
      'Aplicativo muito bom, porém poderiam atualizar mensalmente com os dados da qualidade do leite. Quando vira o mês o aplicativo apaga os dados da produção dos meses anteriores, não sendo possível consultar os meses anteriores. Antes não tinha esse problema.',
    date: '01/04/24',
    rating: '4',
    improvements: ['Dados de Produção', 'Suporte ao Usuário'],
    platform: 'Android',
  },
  {
    id: 2,
    avaliation:
      'Aplicativo muito bom, porém poderiam atualizar mensalmente com os dados da qualidade do leite.',
    date: '30/03/24',
    rating: '5',
    improvements: [],
    platform: 'IOS',
  },
];

const newFeaturesTable: NewFeature[] = [
  {
    id: 1,
    feature: 'Veículo em Rota',
    tax: 92,
  },
  {
    id: 2,
    feature: 'Avaliação De Coleta',
    tax: 78,
  },
];
</script>
