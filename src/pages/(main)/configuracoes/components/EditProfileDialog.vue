<template>
  <DialogContent class="sm:max-w-[506px] px-4 md:px-8 pt-8">
    <DialogHeader>
      <DialogTitle class="text-start text-xl font-semibold"
        >Editar Perfil</DialogTitle
      >
    </DialogHeader>

    <Input class="-mt-3" placeholder="Nome do Perfil" v-model="profileName" />

    <div class="space-y-2 mb-5">
      <p class="text-muted/40 text-sm">Dashboard</p>
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <p>Downloads</p>
          <Switch v-model="permissions.downloads" />
        </div>
        <div class="flex items-center justify-between">
          <p>Avaliações</p>
          <Switch v-model="permissions.avaliacoes" />
        </div>
        <div class="flex items-center justify-between">
          <p>Erros</p>
          <Switch v-model="permissions.erros" />
        </div>
        <div class="flex items-center justify-between">
          <p>Feedbacks</p>
          <Switch v-model="permissions.feedbacks" />
        </div>
        <div class="flex items-center justify-between">
          <p>Novas Funcionalidades</p>
          <Switch v-model="permissions.novasFuncionalidades" />
        </div>
      </div>
    </div>
    <DialogFooter class="gap-3">
      <DialogClose asChild>
        <Button
          class="w-full md:w-44 bg-[#7C7C7C]/20 text-[#606060] hover:bg-[#7C7C7C]/30 dialog-close"
          >Voltar</Button
        >
      </DialogClose>
      <Button
        class="flex-1 bg-[#1400FF]/20 text-[#7F43FF] hover:text-white"
        :disabled="isLoading"
        @click="salvarPerfil">
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
import { Switch } from '@/components/ui/switch';
import type { ApiProfile } from './TableProfiles.vue';
import { ref, onMounted } from 'vue';
import { useToast } from '@/components/ui/toast';

const props = defineProps<{
  profile: ApiProfile;
  open?: boolean;
}>();

const emit = defineEmits(['profileUpdated', 'update:open']);
const isLoading = ref(false);
const { toast } = useToast();

const profileName = ref(props.profile.name);
const permissions = ref({
  downloads: false,
  avaliacoes: false,
  erros: false,
  feedbacks: false,
  novasFuncionalidades: false,
});

onMounted(() => {
  permissions.value = {
    downloads: props.profile.permissions.some(p => p.name === 'Downloads'),
    avaliacoes: props.profile.permissions.some(p => p.name === 'Avaliações'),
    erros: props.profile.permissions.some(p => p.name === 'Erros'),
    feedbacks: props.profile.permissions.some(p => p.name === 'Feedbacks'),
    novasFuncionalidades: props.profile.permissions.some(
      p => p.name === 'Novas Funcionalidades',
    ),
  };
});

function mapPermissionsToApi() {
  const permissionIds = [];

  const permissionMapping = {
    Downloads: 1,
    Avaliações: 2,
    Erros: 3,
    Feedbacks: 4,
    'Novas Funcionalidades': 5,
  };

  if (permissions.value.downloads)
    permissionIds.push(permissionMapping['Downloads']);
  if (permissions.value.avaliacoes)
    permissionIds.push(permissionMapping['Avaliações']);
  if (permissions.value.erros) permissionIds.push(permissionMapping['Erros']);
  if (permissions.value.feedbacks)
    permissionIds.push(permissionMapping['Feedbacks']);
  if (permissions.value.novasFuncionalidades)
    permissionIds.push(permissionMapping['Novas Funcionalidades']);

  return permissionIds;
}

const closeDialog = () => {
  emit('update:open', false);
};

const salvarPerfil = async () => {
  try {
    if (!profileName.value) {
      toast({
        title: 'Erro',
        description: 'Por favor, informe o nome do perfil',
        variant: 'destructive',
      });
      return;
    }

    isLoading.value = true;

    const { $fetchWithAuth } = useNuxtApp();

    const dadosParaEnviar = {
      name: profileName.value.trim(),
      permissions: mapPermissionsToApi(),
    };

    try {
      const response = await $fetchWithAuth(`/profiles/${props.profile.id}`, {
        method: 'PUT',
        body: dadosParaEnviar,
      });

      toast({
        title: 'Sucesso',
        description: (response as { message: string }).message,
        variant: 'default',
      });

      emit('profileUpdated', true);

      closeDialog();
    } catch (apiError: any) {
      let errorMsg = 'Erro ao atualizar perfil';

      if (apiError.data?.errors) {
        const errors = apiError.data.errors;

        if (errors.name?.length) {
          errorMsg = `Erro no nome: ${errors.name[0]}`;
        } else if (errors.permissions?.length) {
          errorMsg = `Erro nas permissões: ${errors.permissions[0]}`;
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
        title: 'Erro',
        description: errorMsg,
        variant: 'destructive',
      });
    }
  } catch (error: any) {
    toast({
      title: 'Erro',
      description: `Erro ao atualizar perfil: ${
        error.message || 'Falha desconhecida'
      }`,
      variant: 'destructive',
    });
  } finally {
    isLoading.value = false;
  }
};
</script>
