<template>
  <div class="relative">
    <Input
      :type="visible ? 'text' : 'password'"
      v-bind="$attrs"
      class="pr-10" />
    <button
      type="button"
      @click="toggleVisibility"
      class="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground focus:outline-none">
      <EyeIcon v-if="!visible" class="h-4 w-4" />
      <EyeOffIcon v-else class="h-4 w-4" />
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { Input } from '@/components/ui/input';
import { EyeIcon, EyeOffIcon } from 'lucide-vue-next';

const visible = ref(false);

const toggleVisibility = () => {
  visible.value = !visible.value;
};
</script>
