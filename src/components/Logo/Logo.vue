<template>
  <header
    class="fixed z-[100] top-6 left-1/2 -translate-x-1/2 lg:left-auto lg:translate-x-0 flex flex-col items-center hover:scale-105 duration-300">
    <NuxtImg class="w-20" :src="AppImages.Logo" alt="Logo" />
    <h1 class="text-xl font-semibold font-nunito">
      CONVIC<span class="text-primary">TI</span>
    </h1>
  </header>
</template>

<script setup>
import AppImages from '../../../public/images';
</script>
