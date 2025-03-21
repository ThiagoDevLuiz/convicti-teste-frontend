<script setup lang="ts">
import type { RadioGroupItemProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-vue-next';
import { RadioGroupIndicator, RadioGroupItem, useForwardProps } from 'reka-ui';
import { computed } from 'vue';

const props = defineProps<
  RadioGroupItemProps & { class?: HTMLAttributes['class'] }
>();

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props;

  return delegated;
});

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <RadioGroupItem
    v-bind="forwardedProps"
    :class="
      cn(
        'peer aspect-square bg-[#7C7C7C]/20 h-4 w-4 rounded-full border border-[#2C2C2C] text-primary shadow focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        props.class,
      )
    ">
    <RadioGroupIndicator class="flex items-center justify-center">
      <div class="bg-[#7F43FF] h-2.5 w-2.5 rounded-full"></div>
    </RadioGroupIndicator>
  </RadioGroupItem>
</template>
