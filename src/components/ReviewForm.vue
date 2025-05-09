<script setup>
defineProps(['review'])
defineEmits(['submit'])
</script>

<template>
  <form @submit.prevent="$emit('submit')" class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-gray-700">Puntuación:</label>
      <select v-model="review.rating" class="w-full mt-1 p-2 border border-gray-300 rounded">
        <option disabled value="0">Selecciona una puntuación</option>
        <option v-for="i in 5" :key="i" :value="i">{{ i }}</option>
      </select>
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700">Comentario:</label>
      <textarea v-model="review.comment" rows="3" class="w-full mt-1 p-2 border border-gray-300 rounded"></textarea>
    </div>
    <div>
      <label class="block text-sm font-medium text-gray-700">Tipo:</label>
      <select v-model="review.type" class="w-full mt-1 p-2 border border-gray-300 rounded">
        <option disabled value="">Selecciona un tipo</option>
        <option value="love">❤️ Sentimental</option>
        <option value="work">💼 Profesional</option>
      </select>
    </div>
    <button type="submit" class="px-4 py-2 bg-amber-600 text-white rounded hover:bg-amber-700">Enviar Reseña</button>
  </form>
</template>
