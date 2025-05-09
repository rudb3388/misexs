<script setup>
import { StarIcon } from 'lucide-vue-next'
defineProps(['reviews'])
defineEmits(['vote'])
</script>

<template>
  <div class="space-y-4">
    <div v-for="review in reviews" :key="review.id" class="bg-amber-50 p-4 rounded-lg shadow">
      <div class="flex items-center mb-2">
        <StarIcon v-for="i in 5" :key="i" :class="[
          'w-4 h-4',
          i <= review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300']" />
      </div>
      <p class="text-gray-800">{{ review.comment }}</p>
      <div class="flex items-center mt-2 space-x-2 text-sm">
        <button @click="$emit('vote', review.id, 'up')" class="text-green-600 hover:underline">
          👍 {{ review.votes }}
        </button>
        <button @click="$emit('vote', review.id, 'down')" class="text-red-600 hover:underline">
          👎
        </button>
      </div>
    </div>
  </div>
</template>
