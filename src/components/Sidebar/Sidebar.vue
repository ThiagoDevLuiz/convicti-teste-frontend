<template>
  <div
    :class="
      cn(
        'bg-card border-r border-border shadow-lg duration-300 h-screen fixed hidden xl:block pt-8',
        open ? 'w-64' : 'w-20',
      )
    ">
    <div
      class="absolute cursor-pointer -right-7 top-9 rounded-r-lg p-1.5 duration-300 bg-card border-r border-border"
      @click="$emit('update:open', !open)">
      <ChevronLeft
        :class="
          cn(
            'w-[1.35rem] h-[1.35rem] text-[#2F4565] transition-transform',
            !open && 'rotate-180',
          )
        " />
    </div>

    <NuxtLink to="/dashboard">
      <NuxtImg
        :class="
          cn(
            'mx-auto hover:scale-105 duration-300',
            open ? 'w-[85px]' : 'w-[50px]',
          )
        "
        :src="AppImages.Logo"
        alt="Logo" />
    </NuxtLink>

    <h1
      :class="
        cn(
          'text-[#272964] tracking-[0.15em] text-sm font-bold text-center uppercase mt-10 mb-5',
          open ? 'block' : 'hidden',
        )
      ">
      Painel de dados
    </h1>

    <div :class="cn('pb-5', open ? 'px-6' : 'px-2 pt-10')">
      <ul class="space-y-4">
        <li v-for="item in sidebarItems" :key="item.id">
          <NuxtLink :to="item.path">
            <Button
              :class="
                cn(
                  'w-full h-[38px] flex items-center gap-x-3 cursor-pointer text-[#2F4565] text-sm py-2 px-5 hover:text-[#2F4565]',
                  route.path === item.path
                    ? 'bg-card-foreground text-[#2F4565]'
                    : '',
                  open ? 'justify-start' : 'justify-center',
                )
              "
              variant="ghost">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <NuxtImg
                      class="min-w-5 max-w-5 min-h-5 max-h-5"
                      :src="item.icon"
                      alt="Icon" />
                  </TooltipTrigger>
                  <TooltipContent
                    :class="cn('font-bold ml-7', open ? 'hidden' : '')"
                    side="right">
                    <p>{{ item.label }}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span
                :class="
                  cn(
                    'text-base font-medium origin-left duration-100 hover:text-secondary text-nowrap',
                    !open ? 'hidden' : '',
                  )
                ">
                {{ item.label }}
              </span>
            </Button>
          </NuxtLink>
        </li>
      </ul>
    </div>

    <div
      :class="
        cn(
          'w-full absolute bottom-10 space-y-4 pb-5',
          open ? 'px-6' : 'px-2 pt-10',
        )
      ">
      <NuxtLink to="/configuracoes">
        <Button
          :class="
            cn(
              'w-full h-[38px] flex items-center justify-start gap-x-3 cursor-pointer text-[#2F4565] text-sm py-2 px-5 hover:text-[#2F4565]',
              route.path === '/configuracoes'
                ? 'bg-card-foreground text-[#2F4565]'
                : '',
              open ? 'justify-start' : 'justify-center',
            )
          "
          variant="ghost">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Settings class="min-w-5 max-w-5 min-h-5 max-h-5" />
              </TooltipTrigger>
              <TooltipContent
                :class="cn('font-bold ml-7', open ? 'hidden' : '')"
                side="right">
                <p>Configurações</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <span
            :class="
              cn(
                'text-base font-medium origin-left duration-100 hover:text-secondary text-nowrap',
                !open ? 'hidden' : '',
              )
            ">
            Configurações
          </span>
        </Button>
      </NuxtLink>

      <Button
        :class="
          cn(
            'w-full h-[38px] flex items-center justify-start gap-x-3 cursor-pointer text-[#2F4565] text-sm py-2 px-5 hover:text-[#2F4565]',
            open ? 'justify-start' : 'justify-center',
          )
        "
        variant="ghost"
        @click="logout">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <NuxtImg
                :src="AppImages.LogoutIcon"
                alt="Logout icon"
                class="min-w-5 max-w-5 min-h-5 max-h-5" />
            </TooltipTrigger>
            <TooltipContent
              :class="cn('font-bold ml-7', open ? 'hidden' : '')"
              side="right">
              <p>Sair</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <span
          :class="
            cn(
              'text-base font-medium origin-left duration-100 hover:text-secondary',
              !open ? 'hidden' : '',
            )
          ">
          Sair
        </span>
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { ChevronLeft, PanelLeft, Settings } from 'lucide-vue-next';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import AppImages from '~~/public/images';
import { cn } from '~/lib/utils';

defineProps<{
  open: boolean;
}>();

defineEmits<{
  'update:open': [value: boolean];
}>();

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
  // TODO: Implementar lógica de logout
  console.log('Logout acionado');
}
</script>
