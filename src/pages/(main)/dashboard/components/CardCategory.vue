<template>
  <div class="w-full bg-card rounded-lg px-4 lg:px-7 py-2 space-y-1">
    <div class="flex items-center justify-between gap-2">
      <h2 class="text-[20px] text-secondary/50 font-semibold">
        {{ card.title }}
      </h2>
      <NuxtImg class="w-[26px]" :src="card.icon" alt="Icon" />
    </div>
    <h1 class="text-[40px] font-bold">
      {{ card.value }}
      <span
        v-if="card.title === 'Avaliações'"
        class="font-normal text-base -ml-2">
        /5
      </span>
    </h1>
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-7">
        <p class="flex items-center gap-1.5">
          <NuxtImg
            class="w-4 h-4"
            :src="AppImages.AndroidIcon"
            alt="Android Icon" />
          {{
            card.title === 'Avaliações' ? card.android.toFixed(1) : card.android
          }}
        </p>
        <p class="flex items-center gap-1.5">
          <NuxtImg
            class="w-4 h-4 -mt-1"
            :src="AppImages.AppleIcon"
            alt="Apple Icon" />
          {{ card.title === 'Avaliações' ? card.apple.toFixed(1) : card.apple }}
        </p>
      </div>
      <span
        v-if="card.title === 'Erros'"
        class="text-accent font-semibold flex items-center gap-0.5">
        -5%
        <MoveDown class="w-4 h-4" />
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppImages from '~~/public/images';
import { MoveDown } from 'lucide-vue-next';

export type Card = {
  title: string;
  icon: string;
  value: number;
  android: number;
  apple: number;
};

defineProps<{
  card: Card;
}>();
</script>
