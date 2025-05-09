<script setup>
import { StarIcon, UsersIcon } from 'lucide-vue-next'
defineProps(['profile'])
defineEmits(['click'])
</script>

<template>
  <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
    @click="$emit('click')">
    <div class="h-48 bg-blue-200 relative">
      <div class="absolute inset-0 flex items-center justify-center text-amber-800">
        <UsersIcon size="64" />
      </div>
    </div>
    <div class="p-4">
      <h3 class="text-xl font-bold text-amber-900">{{ profile.name }}</h3>
      <div class="flex items-center mt-2">
        <div class="flex">
          <StarIcon v-for="i in 5" :key="i" :class="[
            'w-5 h-5',
            i <= Math.round(profile.averageRating) ? 'text-yellow-500 fill-current' : 'text-gray-300']" />
        </div>
        <span class="ml-2 text-gray-600">
          (❤️ {{ profile.reviews.length }} reseñas sentimentales)
        </span>
      </div>
      <div class="flex items-center mt-2">
        <div class="flex">
          <StarIcon v-for="i in 5" :key="i" :class="[
            'w-5 h-5',
            i <= Math.round(profile.averageRating) ? 'text-yellow-500 fill-current' : 'text-gray-300']" />
        </div>
        <span class="ml-2 text-gray-600">
          (💼 {{ profile.reviews.length }} reseñas profesionales)
        </span>
      </div>
      <p class="mt-2 text-gray-600 line-clamp-2">{{ profile.description }}</p>
    </div>
  </div>
</template>
