<script setup>
import { StarIcon } from 'lucide-vue-next'
defineProps({ rating: Number })
</script>


<template>
  <div class="flex">
    <StarIcon v-for="i in 5" :key="i" :class="[
      'w-5 h-5',
      i <= Math.round(rating)
        ? 'text-yellow-500 fill-current'
        : 'text-gray-300'
    ]" />
  </div>
</template>
