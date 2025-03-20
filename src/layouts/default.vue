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
      <main class="w-[95%] xl:w-[90%] mx-auto pt-8 pb-10 overflow-x-hidden">
        <Sheet>
          <SheetTrigger class="xl:hidden">
            <Menu class="w-[1.35rem] h-[1.35rem] text-[#2F4565]" />
          </SheetTrigger>
          <SidebarMobile />
        </Sheet>
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { cn } from '~/lib/utils';
import { Menu } from 'lucide-vue-next';

const open = ref(true);
</script>
