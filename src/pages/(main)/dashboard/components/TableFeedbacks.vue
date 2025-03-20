<template>
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead class="min-w-[300px] pl-0">Avaliação</TableHead>
        <TableHead class="min-w-[100px] 2xl:min-w-[120px]">Data</TableHead>
        <TableHead class="min-w-[100px] 2xl:min-w-[120px]">
          Avaliação
        </TableHead>
        <TableHead class="min-w-[180px] 2xl:min-w-[200px]">
          Melhorias
        </TableHead>
        <TableHead class="2xl:min-w-[120px]"> Plataforma </TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow
        v-for="(feedback, index) in feedbacksTable"
        :key="feedback.id"
        :class="index % 2 === 0 ? 'bg-background' : 'bg-card'">
        <TableCell>{{ feedback.avaliation }}</TableCell>
        <TableCell>{{ feedback.date }}</TableCell>
        <TableCell>{{ feedback.rating }}</TableCell>
        <TableCell>
          <template v-if="feedback.improvements.length > 0">
            <span
              v-for="(improvement, index) in feedback.improvements"
              :key="improvement"
              class="block mb-1">
              {{ improvement }}
            </span>
          </template>
          <template v-else> - </template>
        </TableCell>
        <TableCell>{{ feedback.platform }}</TableCell>
      </TableRow>

      <!-- Linhas vazias adicionais -->
      <TableRow
        v-for="(_, index) in emptyRows"
        :key="`empty-${index}`"
        :class="
          (index + feedbacksTable.length) % 2 === 0
            ? 'bg-background'
            : 'bg-card'
        ">
        <TableCell v-for="n in 5" :key="n">&nbsp;</TableCell>
      </TableRow>
    </TableBody>
  </Table>
</template>

<script setup lang="ts">
export type Feedback = {
  id: number;
  avaliation: string;
  date: string;
  rating: string;
  improvements: string[];
  platform: string;
};

defineProps<{
  feedbacksTable: Feedback[];
}>();

// Array para linhas vazias adicionais
const emptyRows = Array(3).fill(null);
</script>
