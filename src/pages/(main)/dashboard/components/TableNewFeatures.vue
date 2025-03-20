<template>
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead class="min-w-[200px] w-full pl-0">Funcionalidade</TableHead>
        <TableHead class="min-w-28">Taxa De Uso</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow
        v-for="(newFeature, index) in newFeaturesTable"
        :key="newFeature.id"
        :class="index % 2 === 0 ? 'bg-card' : 'bg-background'">
        <TableCell class="text-base">{{ newFeature.feature }}</TableCell>
        <TableCell class="text-end text-base text-accent font-bold"
          >{{ newFeature.tax }}%</TableCell
        >
      </TableRow>
    </TableBody>
  </Table>
</template>

<script setup lang="ts">
export type NewFeature = {
  id: number;
  feature: string;
  tax: number;
};

defineProps<{
  newFeaturesTable: NewFeature[];
}>();
</script>
