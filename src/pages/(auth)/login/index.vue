<template>
  <main
    class="relative w-full min-h-dvh flex items-center justify-center lg:justify-between gap-20">
    <div
      class="flex flex-col gap-7 w-full max-w-sm p-1 xl:p-4 xl:ml-10 2xl:ml-20">
      <div>
        <h1 class="text-2xl font-bold">Bem-vindo de Volta</h1>
        <p class="text-sm text-muted-foreground font-medium">
          Insira suas credenciais para acessar a plataforma
        </p>
      </div>

      <form @submit.prevent="onSubmit" class="space-y-3">
        <div class="space-y-1">
          <Input
            v-model="email"
            type="email"
            placeholder="Seu e-mail"
            @blur="validateEmail"
            :class="{
              'border-destructive focus-visible:ring-transparent': errors.email,
            }" />
          <p
            v-if="errors.email"
            class="text-[0.8rem] font-medium text-destructive">
            {{ errors.email }}
          </p>
        </div>

        <div class="space-y-1">
          <PasswordInput
            v-model="password"
            placeholder="Sua senha"
            @blur="validatePassword"
            :class="{
              'border-destructive focus-visible:ring-transparent':
                errors.password,
            }" />
          <p
            v-if="errors.password"
            class="text-[0.8rem] font-medium text-destructive">
            {{ errors.password }}
          </p>
        </div>

        <p
          v-if="authError || loginError"
          class="text-sm font-medium text-destructive">
          {{ loginError || authError }}
        </p>

        <Button type="submit" class="w-full h-10" :disabled="authStore.loading">
          <template v-if="authStore.loading"> Carregando... </template>
          <template v-else> Entrar </template>
        </Button>
      </form>
    </div>

    <div class="relative hidden lg:flex justify-center items-center">
      <div
        class="absolute border-2 border-primary/50 rounded-full p-10 xl:p-16">
        <div
          class="w-[540px] h-[540px] xl:w-[740px] xl:h-[740px] border-2 border-primary rounded-full" />
      </div>
      <img
        class="relative z-50"
        :src="AppImages.ImgDashboard"
        alt="Dashboard" />
    </div>
  </main>
</template>

<script setup>
import AppImages from '../../../../public/images';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Button } from '@/components/ui/button';
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';

definePageMeta({
  layout: 'auth-layout',
});

const authStore = useAuthStore();
const email = ref('');
const password = ref('');
const errors = ref({});
const loginError = ref('');

const authError = computed(() => authStore.error);

onMounted(() => {
  authStore.error = null;
  loginError.value = '';
});

const validateEmail = () => {
  if (!email.value) {
    errors.value.email = 'E-mail é obrigatório';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.value.email = 'E-mail inválido';
  } else {
    delete errors.value.email;
  }
};

const validatePassword = () => {
  if (!password.value || password.value.length < 6) {
    errors.value.password = 'Mínimo 6 caracteres obrigatório';
  } else {
    delete errors.value.password;
  }
};

const validateForm = () => {
  errors.value = {};
  let isValid = true;

  if (!email.value) {
    errors.value.email = 'E-mail é obrigatório';
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    errors.value.email = 'E-mail inválido';
    isValid = false;
  }

  if (!password.value || password.value.length < 6) {
    errors.value.password = 'Mínimo 6 caracteres obrigatório';
    isValid = false;
  }

  return isValid;
};

const onSubmit = async () => {
  loginError.value = '';

  if (validateForm()) {
    try {
      const success = await authStore.login(email.value, password.value);

      if (success) {
        navigateTo('/dashboard');
      } else {
        loginError.value = 'Falha na autenticação. Verifique suas credenciais.';
      }
    } catch (error) {
      if (error.message && error.message.includes('CORS')) {
        loginError.value =
          'Erro de conectividade com o servidor. Tente novamente mais tarde.';
      } else {
        loginError.value =
          error.message || 'Falha na autenticação. Tente novamente.';
      }
    }
  }
};
</script>
