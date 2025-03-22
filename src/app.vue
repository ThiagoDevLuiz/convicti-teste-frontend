<template>
  <NuxtLayout>
    <NuxtRouteAnnouncer />
    <NuxtPage />
    <Toaster />
  </NuxtLayout>
</template>

<script setup>
import { Toaster } from '@/components/ui/toast';
</script>
