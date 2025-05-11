<template>
  <!-- Navbar -->
  <nav class="bg-blue-800 text-white p-4 shadow-md">
    <div class="container mx-auto flex justify-between items-center">
      <h1 class="text-2xl font-bold flex items-center">
        mypartner
      </h1>
      <div class="flex space-x-6">
        <button @click="currentView = 'home'">Inicio</button>
        <button @click="currentView = 'info'">Información</button>
        <button @click="currentView = 'contacto'">Información</button>
      </div>
    </div>
  </nav>
</template>
