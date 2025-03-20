<template>
  <div class="flex">
    <Sidebar :open="open" @update:open="open = $event" />

    <div
      :class="
        cn(
          'w-full flex-1 h-screen duration-300',
          open ? 'xl:pl-64' : 'xl:pl-20',
        )
      ">
      <main class="w-[90%] m-auto pb-10 overflow-x-hidden">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { cn } from '~/lib/utils';

const open = ref(true);
</script>
