<template>
  <div class="w-full bg-card rounded-lg px-4 lg:px-7 py-2 space-y-1">
    <div class="flex items-center justify-between gap-2">
      <h2 class="text-[20px] text-secondary/50 font-semibold">
        {{ card.title }}
      </h2>
      <NuxtImg class="w-[26px]" :src="card.icon" alt="Icon" />
    </div>
    <h1 class="text-[40px] font-bold">
      {{
        isValidNumber(card.value)
          ? card.title === 'Avaliações'
            ? card.value.toFixed(1)
            : card.value
          : 0
      }}
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
            card.title === 'Avaliações'
              ? isValidNumber(card.android)
                ? card.android.toFixed(1)
                : '0.0'
              : isValidNumber(card.android)
              ? card.android
              : 0
          }}
        </p>
        <p class="flex items-center gap-1.5">
          <NuxtImg
            class="w-4 h-4 -mt-1"
            :src="AppImages.AppleIcon"
            alt="Apple Icon" />
          {{
            card.title === 'Avaliações'
              ? isValidNumber(card.apple)
                ? card.apple.toFixed(1)
                : '0.0'
              : isValidNumber(card.apple)
              ? card.apple
              : 0
          }}
        </p>
      </div>
      <span
        v-if="card.variation"
        class="text-accent font-semibold flex items-center gap-0.5">
        {{ isValidNumber(card.variation) ? card.variation : 0 }}%
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
  variation?: number;
};

defineProps<{
  card: Card;
}>();

const isValidNumber = (value: number | undefined): boolean => {
  return (
    value !== undefined && value !== null && !isNaN(value) && isFinite(value)
  );
};
</script>
