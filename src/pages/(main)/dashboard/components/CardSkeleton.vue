<template>
  <div class="w-full bg-card rounded-lg px-4 lg:px-7 py-2 space-y-1">
    <div class="flex items-center justify-between gap-2">
      <Skeleton class="h-7 w-32" />
      <Skeleton class="w-[26px] h-[26px]" />
    </div>
    <Skeleton class="h-10 w-20" />
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-7">
        <Skeleton class="h-5 w-20" />
        <Skeleton class="h-5 w-20" />
      </div>
      <Skeleton class="h-5 w-16" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Skeleton } from '~/components/ui/skeleton';
</script>
