<script setup lang="ts">
import { cn } from '@/lib/utils';
import {
  SwitchRoot,
  type SwitchRootEmits,
  type SwitchRootProps,
  SwitchThumb,
  useForwardPropsEmits,
} from 'reka-ui';
import { computed, type HTMLAttributes } from 'vue';

const props = defineProps<
  SwitchRootProps & { class?: HTMLAttributes['class'] }
>();

const emits = defineEmits<SwitchRootEmits>();

const delegatedProps = computed(() => {
  const { class: _, ...delegated } = props;

  return delegated;
});

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <SwitchRoot
    v-bind="forwarded"
    :class="
      cn(
        'peer inline-flex h-[18px] w-[30px] px-0.5 shrink-0 cursor-pointer items-center rounded-full border-2 border-black shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[#7F43FF]/50 data-[state=unchecked]:bg-transparent',
        props.class,
      )
    ">
    <SwitchThumb
      :class="
        cn(
          'pointer-events-none block h-2.5 w-2.5 rounded-full bg-background border-2 border-black shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-3 data-[state=unchecked]:translate-x-0',
        )
      ">
      <slot name="thumb" />
    </SwitchThumb>
  </SwitchRoot>
</template>
