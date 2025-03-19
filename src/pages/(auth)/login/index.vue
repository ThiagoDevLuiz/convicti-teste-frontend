<template>
  <main
    class="relative w-full min-h-dvh flex items-center justify-center lg:justify-between gap-20">
    <div
      class="flex flex-col gap-7 w-full max-w-sm p-1 xl:p-4 xl:ml-10 2xl:ml-20">
      <div>
        <h1 class="text-2xl font-bold">Bem-vindo de Volta</h1>
        <p class="text-sm text-muted-foreground font-medium">
          Insira sua credenciais para acessar a plataforma
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

        <Button type="submit" class="w-full h-10">Entrar</Button>
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
import { ref } from 'vue';

definePageMeta({
  layout: 'auth-layout',
});

const email = ref('');
const password = ref('');
const errors = ref({});

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

const onSubmit = () => {
  if (validateForm()) {
    console.log({
      email: email.value,
      password: password.value,
    });
    // Implementar lógica de login
  }
};
</script>
