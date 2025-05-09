<script setup>
// Aquí puedes importar otros componentes, definir variables reactivas, funciones, etc.
import UsersIcon from '@heroicons/vue/24/solid/UserIcon';

// Por ejemplo, una variable reactiva
import { ref } from 'vue';
const currentView = ref('login');

// Y una función
const saludar = () => {
  alert('Hola');
};
</script>

<template>
  <nav class="bg-blue-800 text-white p-4 shadow-md">
    <div class="container mx-auto flex justify-between items-center">
      <h1 class="text-2xl font-bold flex items-center">
        <UsersIcon class="mr-2" />
        mypartner
      </h1>
      <button @click="currentView = 'home'" class="px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors">
        Iniciar sesión
      </button>
      <button @click="saludar">Saludar</button>
    </div>
  </nav>
</template>
