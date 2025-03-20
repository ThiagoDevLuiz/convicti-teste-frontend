<template>
  <SheetContent
    side="left"
    class="bg-card border-r border-border shadow-lg duration-300 h-screen fixed pt-8">
    <NuxtLink to="/dashboard">
      <NuxtImg
        class="w-[85px] mx-auto hover:scale-105 duration-300"
        :src="AppImages.Logo"
        alt="Logo" />
    </NuxtLink>

    <h1
      class="block text-[#272964] tracking-[0.15em] text-sm font-bold text-center uppercase mt-10 mb-5">
      Painel de dados
    </h1>

    <div class="pb-5">
      <ul class="space-y-4">
        <li v-for="item in sidebarItems" :key="item.id">
          <NuxtLink :to="item.path">
            <Button
              :class="
                cn(
                  'w-full h-[38px] flex items-center justify-start gap-x-3 cursor-pointer text-[#2F4565] text-sm py-2 px-5 hover:text-[#2F4565]',
                  route.path === item.path
                    ? 'bg-card-foreground text-[#2F4565]'
                    : '',
                )
              "
              variant="ghost">
              <NuxtImg
                class="min-w-5 max-w-5 min-h-5 max-h-5"
                :src="item.icon"
                alt="Icon" />
              <span
                class="text-base font-medium origin-left duration-100 hover:text-secondary text-nowrap">
                {{ item.label }}
              </span>
            </Button>
          </NuxtLink>
        </li>
      </ul>
    </div>

    <div class="w-full absolute bottom-10 space-y-4 pb-5">
      <NuxtLink to="/configuracoes">
        <Button
          :class="
            cn(
              'w-full h-[38px] flex items-center justify-start gap-x-3 cursor-pointer text-[#2F4565] text-sm py-2 px-5 hover:text-[#2F4565]',
              route.path === '/configuracoes'
                ? 'bg-card-foreground text-[#2F4565]'
                : '',
            )
          "
          variant="ghost">
          <Settings class="min-w-5 max-w-5 min-h-5 max-h-5" />
          <span
            class="text-base font-medium origin-left duration-100 hover:text-secondary text-nowrap">
            Configurações
          </span>
        </Button>
      </NuxtLink>

      <Button
        class="w-full h-[38px] flex items-center justify-start gap-x-3 cursor-pointer text-[#2F4565] text-sm py-2 px-5 hover:text-[#2F4565]"
        variant="ghost"
        @click="logout">
        <NuxtImg
          :src="AppImages.LogoutIcon"
          alt="Logout icon"
          class="min-w-5 max-w-5 min-h-5 max-h-5" />
        <span
          class="text-base font-medium origin-left duration-100 hover:text-secondary">
          Sair
        </span>
      </Button>
    </div>
  </SheetContent>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { Settings } from 'lucide-vue-next';
import { Button } from '@/components/ui/button';
import AppImages from '~~/public/images';
import { cn } from '~/lib/utils';

const route = useRoute();

const sidebarItems = [
  {
    id: 1,
    label: 'Dashboard',
    path: '/dashboard',
    icon: AppImages.DashboardIcon,
  },
];

function logout() {
  // Lógica de logout aqui
}
</script>
