<!-- NavButton.vue -->
<script setup>
const props = defineProps({
  label: String,
  view: String,
  currentView: String
})

const emit = defineEmits(['navigate'])

function navigate() {
  emit('navigate', props.view)
}
</script>

<template>
  <button
    class="cursor-pointer hover:underline transition duration-200"
    @click="navigate"
  >
    {{ label }}
  </button>
</template>
