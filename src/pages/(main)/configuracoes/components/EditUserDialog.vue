<template>
  <DialogContent class="sm:max-w-[506px] px-4 md:px-8 pt-8">
    <DialogHeader>
      <DialogTitle class="text-start text-xl font-semibold"
        >Editar Usuário</DialogTitle
      >
    </DialogHeader>

    <div class="-mt-3 space-y-2">
      <Input placeholder="Nome do usuário" v-model="userData.name" />
      <Input placeholder="Email" v-model="userData.email" />
    </div>

    <div class="space-y-2 mb-5">
      <p class="text-muted/40 text-sm">Perfil</p>
      <RadioGroup v-model="userData.profile_id">
        <div class="space-y-3">
          <div
            v-for="profile in profiles"
            :key="profile.id"
            class="flex items-center justify-between">
            <p>{{ profile.name }}</p>
            <RadioGroupItem :value="profile.id" />
          </div>
          <div v-if="isLoadingProfiles" class="text-sm text-muted-foreground">
            Carregando perfis...
          </div>
          <div
            v-if="!isLoadingProfiles && profiles.length === 0"
            class="text-sm text-muted-foreground">
            Nenhum perfil disponível
          </div>
        </div>
      </RadioGroup>
    </div>

    <DialogFooter class="gap-3">
      <DialogClose asChild>
        <Button
          class="w-full md:w-44 bg-[#7C7C7C]/20 text-[#606060] hover:bg-[#7C7C7C]/30"
          >Voltar</Button
        >
      </DialogClose>
      <Button
        class="flex-1 bg-[#1400FF]/20 text-[#7F43FF] hover:text-white"
        :disabled="isLoading"
        @click="salvarUsuario">
        {{ isLoading ? 'Salvando...' : 'Salvar' }}
      </Button>
    </DialogFooter>
  </DialogContent>
</template>

<script setup lang="ts">
import {
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { ApiUser } from './TableUsers.vue';
import type { ApiProfile } from './TableProfiles.vue';
import { ref, nextTick, onMounted, watch } from 'vue';
import { useToast } from '@/components/ui/toast';

const props = defineProps<{
  user: ApiUser;
  open?: boolean;
}>();

const emit = defineEmits(['userUpdated', 'update:open', 'refreshProfiles']);
const isLoading = ref(false);
const isLoadingProfiles = ref(false);
const { toast } = useToast();

const profiles = ref<ApiProfile[]>([]);

const userData = ref({
  id: props.user.id,
  name: props.user.name,
  email: props.user.email,
  profile_id: props.user.profile_id,
});

async function carregarPerfis() {
  try {
    isLoadingProfiles.value = true;
    const { $fetchWithAuth } = useNuxtApp();

    interface ProfilesResponse {
      data: ApiProfile[];
    }

    const response = (await $fetchWithAuth('/profiles', {
      method: 'GET',
    })) as ProfilesResponse;

    if (response && response.data) {
      profiles.value = response.data;
    }
  } catch (error) {
    toast({
      title: 'Erro',
      description: 'Não foi possível carregar a lista de perfis',
      variant: 'destructive',
    });
  } finally {
    isLoadingProfiles.value = false;
  }
}

watch(
  () => props.open,
  newValue => {
    if (newValue) {
      carregarPerfis();
    }
  },
);

onMounted(() => {
  carregarPerfis();
});

const closeDialog = () => {
  emit('update:open', false);
};

const salvarUsuario = async () => {
  try {
    if (!userData.value.name || userData.value.name.trim() === '') {
      toast({
        title: 'Erro',
        description: 'Por favor, preencha o nome do usuário',
        variant: 'destructive',
      });
      return;
    }

    if (!userData.value.email || userData.value.email.trim() === '') {
      toast({
        title: 'Erro',
        description: 'Por favor, preencha o email do usuário',
        variant: 'destructive',
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.value.email)) {
      toast({
        title: 'Erro',
        description: 'Por favor, insira um email válido',
        variant: 'destructive',
      });
      return;
    }

    if (!userData.value.profile_id) {
      toast({
        title: 'Erro',
        description: 'Por favor, selecione um perfil para o usuário',
        variant: 'destructive',
      });
      return;
    }

    isLoading.value = true;

    const { $fetchWithAuth } = useNuxtApp();

    const dadosParaEnviar = {
      name: userData.value.name.trim(),
      profile_id: Number(userData.value.profile_id),
      email: userData.value.email.trim(),
    };

    try {
      const response = await $fetchWithAuth(`/users/${userData.value.id}`, {
        method: 'PUT',
        body: dadosParaEnviar,
      });

      toast({
        title: 'Sucesso',
        description: 'Usuário atualizado com sucesso',
        variant: 'default',
      });

      emit('userUpdated', true);
      emit('refreshProfiles', true);

      closeDialog();

      await nextTick();
    } catch (apiError: any) {
      let errorMsg = 'Erro ao atualizar usuário';

      if (apiError.data?.errors) {
        const errors = apiError.data.errors;

        if (errors.email?.length) {
          errorMsg = `Erro no email: ${errors.email[0]}`;
        } else if (errors.name?.length) {
          errorMsg = `Erro no nome: ${errors.name[0]}`;
        } else if (errors.profile_id?.length) {
          errorMsg = `Erro no perfil: ${errors.profile_id[0]}`;
        } else {
          const firstErrorField = Object.keys(errors)[0];
          if (firstErrorField) {
            errorMsg = `Erro: ${errors[firstErrorField][0]}`;
          }
        }
      } else if (apiError.data?.message) {
        errorMsg = `Erro: ${apiError.data.message}`;
      } else if (apiError.message) {
        errorMsg = `Erro: ${apiError.message}`;
      }

      toast({
        title: 'Erro na atualização',
        description: errorMsg,
        variant: 'destructive',
      });
    }
  } catch (error: any) {
    toast({
      title: 'Erro',
      description: `Erro ao atualizar usuário: ${
        error.message || 'Falha desconhecida'
      }`,
      variant: 'destructive',
    });
  } finally {
    isLoading.value = false;
  }
};
</script>
