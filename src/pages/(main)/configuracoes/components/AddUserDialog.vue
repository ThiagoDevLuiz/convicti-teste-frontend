<template>
  <DialogContent class="sm:max-w-[506px] px-4 md:px-8 pt-8">
    <DialogHeader>
      <DialogTitle class="text-start text-xl font-semibold"
        >Novo Usuário</DialogTitle
      >
    </DialogHeader>

    <div class="-mt-3 space-y-2">
      <Input placeholder="Nome do usuário" />
      <Input placeholder="Email" />
    </div>

    <div class="space-y-2 mb-5">
      <p class="text-muted/40 text-sm">Perfil</p>
      <RadioGroup value="desenvolvedor">
        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <p>Admin</p>
            <RadioGroupItem value="admin" />
          </div>
          <div class="flex items-center justify-between">
            <p>Desenvolvedor</p>
            <RadioGroupItem value="desenvolvedor" />
          </div>
          <div class="flex items-center justify-between">
            <p>Recursos Humanos</p>
            <RadioGroupItem value="rh" />
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
      <Button class="flex-1 bg-[#1400FF]/20 text-[#7F43FF] hover:text-white"
        >Adicionar</Button
      >
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
</script>
