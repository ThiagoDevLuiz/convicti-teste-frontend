<template>
  <DialogContent class="sm:max-w-[506px] px-4 md:px-8 pt-8">
    <DialogHeader>
      <DialogTitle class="text-start text-xl font-semibold"
        >Novo Perfil</DialogTitle
      >
    </DialogHeader>

    <Input class="-mt-3" placeholder="Novo Perfil" />

    <div class="space-y-2 mb-5">
      <p class="text-muted/40 text-sm">Dashboard</p>
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <p>Downloads</p>
          <Switch />
        </div>
        <div class="flex items-center justify-between">
          <p>Avaliações</p>
          <Switch />
        </div>
        <div class="flex items-center justify-between">
          <p>Erros</p>
          <Switch />
        </div>
        <div class="flex items-center justify-between">
          <p>Feedbacks</p>
          <Switch />
        </div>
        <div class="flex items-center justify-between">
          <p>Novas Funcionalidades</p>
          <Switch />
        </div>
      </div>
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
