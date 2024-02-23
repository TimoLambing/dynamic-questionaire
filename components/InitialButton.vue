<template>
  <!-- Show the initial button to create the first question -->
  <div>
    <UButton
      icon="i-heroicons-pencil-square"
      size="sm"
      color="primary"
      variant="solid"
      label="Loo esimene küsimus"
      :trailing="false"
      class="text-white"
      @click="() => { showInput = true; }"
    />
  </div>
</template>

<script setup lang="ts">
const showInputState = () => useState<boolean>('showInput', () => false)

const showInput = showInputState()
</script>