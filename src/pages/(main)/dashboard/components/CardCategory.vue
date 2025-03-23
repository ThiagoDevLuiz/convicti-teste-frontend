<template>
  <div class="w-full bg-card rounded-lg px-4 lg:px-7 py-2 space-y-1">
    <div class="flex items-center justify-between gap-2">
      <h2 class="text-[20px] text-secondary/50 font-semibold">
        {{ card.title }}
      </h2>
      <NuxtImg class="w-[26px]" :src="card.icon" alt="Icon" />
    </div>
    <h1 class="text-[40px] font-bold">
      {{ formatCardValue(card.value) }}
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
          {{ formatPlatformValue(card.android) }}
        </p>
        <p class="flex items-center gap-1.5">
          <NuxtImg
            class="w-4 h-4 -mt-1"
            :src="AppImages.AppleIcon"
            alt="Apple Icon" />
          {{ formatPlatformValue(card.apple) }}
        </p>
      </div>
      <span
        v-if="card.variation !== undefined"
        class="text-accent font-semibold flex items-center gap-0.5">
        {{ formatVariation(card.variation) }}%
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

const props = defineProps<{
  card: Card;
}>();

const isValidNumber = (value: number | undefined): boolean => {
  return (
    value !== undefined && value !== null && !isNaN(value) && isFinite(value)
  );
};

const formatCardValue = (value: number) => {
  if (!isValidNumber(value)) return 0;
  return props.card.title === 'Avaliações' ? value.toFixed(1) : value;
};

const formatPlatformValue = (value: number) => {
  if (!isValidNumber(value))
    return props.card.title === 'Avaliações' ? '0.0' : 0;
  return props.card.title === 'Avaliações' ? value.toFixed(1) : value;
};

const formatVariation = (variation: number | undefined) => {
  return isValidNumber(variation) ? variation : 0;
};
</script>
