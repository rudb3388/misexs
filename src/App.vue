<script setup>
import { ref, computed } from 'vue'
import {
  Users as UsersIcon,
  Cake as CakeIcon,
  Star as StarIcon,
  Search as SearchIcon,
  ArrowLeft as ArrowLeftIcon,
  ThumbsUp as ThumbsUpIcon,
  ThumbsDown as ThumbsDownIcon
} from 'lucide-vue-next'

// Estado de la aplicación
const currentView = ref('home')
const searchQuery = ref('')
const selectedDessertId = ref(null)
const newReview = ref({
  author: '',
  rating: 0,
  comment: ''
})

// Datos de ejemplo
const desserts = ref([
  {
    id: 1,
    name: 'Tarta de Chocolate',
    description: 'Deliciosa tarta de chocolate con ganache y base de galleta. Perfecta para los amantes del chocolate intenso.',
    averageRating: 4.5,
    reviews: [
      { id: 1, author: 'María García', rating: 5, comment: 'La mejor tarta de chocolate que he probado. El sabor es intenso y la textura perfecta.', votes: 12 },
      { id: 2, author: 'Juan Pérez', rating: 4, comment: 'Muy buena, aunque un poco empalagosa para mi gusto.', votes: 5 }
    ]
  },
  {
    id: 2,
    name: 'Tiramisú',
    description: 'Clásico postre italiano con capas de bizcocho empapado en café, mascarpone y cacao en polvo.',
    averageRating: 4.8,
    reviews: [
      { id: 3, author: 'Ana Martínez', rating: 5, comment: 'Auténtico sabor italiano. El equilibrio entre el café y el mascarpone es perfecto.', votes: 8 },
      { id: 4, author: 'Carlos Rodríguez', rating: 5, comment: 'Increíble. Me transportó directamente a Italia.', votes: 10 },
      { id: 5, author: 'Laura Sánchez', rating: 4, comment: 'Muy bueno, aunque prefiero un poco más de café.', votes: 3 }
    ]
  },
  {
    id: 3,
    name: 'Cheesecake de Fresa',
    description: 'Cremoso cheesecake con cobertura de fresas naturales y base de galleta crujiente.',
    averageRating: 4.2,
    reviews: [
      { id: 6, author: 'Pedro López', rating: 4, comment: 'Muy cremoso y con buen sabor a fresa, aunque la base podría ser más crujiente.', votes: 6 },
      { id: 7, author: 'Sofía Fernández', rating: 5, comment: 'El equilibrio perfecto entre dulce y ácido. Las fresas estaban muy frescas.', votes: 9 }
    ]
  },
  {
    id: 4,
    name: 'Crème Brûlée',
    description: 'Postre francés con suave crema de vainilla y una capa de caramelo crujiente por encima.',
    averageRating: 4.7,
    reviews: [
      { id: 8, author: 'Miguel Torres', rating: 5, comment: 'El contraste entre la crema suave y el caramelo crujiente es espectacular.', votes: 15 },
      { id: 9, author: 'Carmen Ruiz', rating: 4, comment: 'Muy buena, aunque prefiero un poco más de vainilla en la crema.', votes: 7 }
    ]
  },
  {
    id: 5,
    name: 'Coulant de Chocolate',
    description: 'Bizcocho de chocolate con interior fundido. Servido caliente con helado de vainilla.',
    averageRating: 4.9,
    reviews: [
      { id: 10, author: 'David Gómez', rating: 5, comment: 'Espectacular. El chocolate fundido en el interior es pura magia.', votes: 20 },
      { id: 11, author: 'Elena Díaz', rating: 5, comment: 'La combinación con el helado de vainilla es perfecta. No puedo pedir más.', votes: 18 },
      { id: 12, author: 'Roberto Moreno', rating: 5, comment: 'El mejor coulant que he probado en mi vida.', votes: 14 }
    ]
  },
  {
    id: 6,
    name: 'Flan de Caramelo',
    description: 'Tradicional flan casero con caramelo líquido y textura sedosa.',
    averageRating: 4.0,
    reviews: [
      { id: 13, author: 'Isabel Navarro', rating: 4, comment: 'Muy cremoso y con buen sabor, aunque un poco simple.', votes: 5 },
      { id: 14, author: 'Francisco Jiménez', rating: 4, comment: 'Buen flan tradicional, me recordó al que hacía mi abuela.', votes: 8 }
    ]
  }
])

// Computed properties
const filteredDesserts = computed(() => {
  if (!searchQuery.value) return desserts.value

  const query = searchQuery.value.toLowerCase()
  return desserts.value.filter(dessert =>
    dessert.name.toLowerCase().includes(query) ||
    dessert.description.toLowerCase().includes(query)
  )
})

const selectedDessert = computed(() => {
  if (!selectedDessertId.value) return null
  return desserts.value.find(d => d.id === selectedDessertId.value)
})

// Métodos
function viewDessert(id) {
  selectedDessertId.value = id
  currentView.value = 'detail'
  // Resetear el formulario de reseña
  newReview.value = {
    author: '',
    rating: 0,
    comment: ''
  }
}

function addReview() {
  if (!newReview.value.author || !newReview.value.rating || !newReview.value.comment) {
    alert('Por favor, completa todos los campos de la reseña')
    return
  }

  const dessert = desserts.value.find(d => d.id === selectedDessertId.value)
  if (dessert) {
    // Crear nueva reseña
    const newReviewObj = {
      id: Date.now(), // ID único basado en timestamp
      author: newReview.value.author,
      rating: newReview.value.rating,
      comment: newReview.value.comment,
      votes: 0
    }

    // Añadir la reseña al postre
    dessert.reviews.push(newReviewObj)

    // Recalcular la puntuación media
    const totalRating = dessert.reviews.reduce((sum, review) => sum + review.rating, 0)
    dessert.averageRating = totalRating / dessert.reviews.length

    // Resetear el formulario
    newReview.value = {
      author: '',
      rating: 0,
      comment: ''
    }

    alert('¡Gracias por tu reseña!')
  }
}

function voteReview(reviewId, voteType) {
  const dessert = desserts.value.find(d => d.id === selectedDessertId.value)
  if (dessert) {
    const review = dessert.reviews.find(r => r.id === reviewId)
    if (review) {
      if (voteType === 'up') {
        review.votes++
      } else if (voteType === 'down' && review.votes > 0) {
        review.votes--
      }
    }
  }
}
</script>

<template>
  <div class="min-h-screen bg-blue-50">
    <!-- Navbar -->
    <nav class="bg-blue-800 text-white p-4 shadow-md">
      <div class="container mx-auto flex justify-between items-center">
        <h1 class="text-2xl font-bold flex items-center">
          <UsersIcon class="mr-2" />
          mypartner
        </h1>
        <button @click="currentView = 'home'" class="px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors">
          Iniciar sesión
        </button>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="container mx-auto p-4">
      <!-- Home View - List of Desserts -->
      <div v-if="currentView === 'home'" class="space-y-6">
        <div class="flex justify-between items-center">
          <h2 class="text-3xl font-bold text-amber-900">Perfiles Populares</h2>
          <div class="relative">
            <SearchIcon class="absolute left-3 top-3 text-gray-500" size="18" />
            <input v-model="searchQuery" type="text" placeholder="Buscar perfil por nombre"
              class="pl-10 pr-4 py-2 rounded-lg border border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="dessert in filteredDesserts" :key="dessert.id"
            class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            @click="viewDessert(dessert.id)">
            <div class="h-48 bg-blue-200 relative">
              <div class="absolute inset-0 flex items-center justify-center text-amber-800">
                <UsersIcon size="64" />
              </div>
            </div>
            <div class="p-4">
              <h3 class="text-xl font-bold text-amber-900">{{ dessert.name }}</h3>
              <div class="flex items-center mt-2">
                <div class="flex">
                  <StarIcon v-for="i in 5" :key="i" :class="[
                    'w-5 h-5',
                    i <= Math.round(dessert.averageRating)
                      ? 'text-yellow-500 fill-current'
                      : 'text-gray-300'
                  ]" />
                </div>
                <span class="ml-2 text-gray-600">
                  ({{ dessert.reviews.length }} reseñas)
                </span>
              </div>
              <p class="mt-2 text-gray-600 line-clamp-2">{{ dessert.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Dessert Detail View -->
      <div v-else-if="currentView === 'detail' && selectedDessert" class="space-y-6">
        <button @click="currentView = 'home'" class="flex items-center text-amber-700 hover:text-amber-900">
          <ArrowLeftIcon class="mr-1" size="18" />
          Volver a la lista
        </button>

        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="h-64 bg-amber-200 relative">
            <div class="absolute inset-0 flex items-center justify-center text-amber-800">
              <CakeIcon size="96" />
            </div>
          </div>
          <div class="p-6">
            <h2 class="text-3xl font-bold text-amber-900">{{ selectedDessert.name }}</h2>
            <div class="flex items-center mt-2">
              <div class="flex">
                <StarIcon v-for="i in 5" :key="i" :class="[
                  'w-5 h-5',
                  i <= Math.round(selectedDessert.averageRating)
                    ? 'text-yellow-500 fill-current'
                    : 'text-gray-300'
                ]" />
              </div>
              <span class="ml-2 text-gray-600">
                ({{ selectedDessert.reviews.length }} reseñas)
              </span>
            </div>
            <p class="mt-4 text-gray-700">{{ selectedDessert.description }}</p>

            <div class="mt-8">
              <h3 class="text-2xl font-bold text-amber-900">Reseñas</h3>

              <!-- Add Review Form -->
              <div class="mt-4 bg-amber-50 p-4 rounded-lg">
                <h4 class="text-lg font-semibold text-amber-900">Añadir una reseña</h4>
                <div class="mt-2">
                  <label class="block text-sm font-medium text-gray-700">Puntuación</label>
                  <div class="flex mt-1">
                    <button v-for="i in 5" :key="i" @click="newReview.rating = i" class="focus:outline-none">
                      <StarIcon :class="[
                        'w-6 h-6',
                        i <= newReview.rating
                          ? 'text-yellow-500 fill-current'
                          : 'text-gray-300'
                      ]" />
                    </button>
                  </div>
                </div>
                <div class="mt-3">
                  <label class="block text-sm font-medium text-gray-700">Nombre</label>
                  <input v-model="newReview.author" type="text"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-500 focus:ring-opacity-50"
                    placeholder="Tu nombre" />
                </div>
                <div class="mt-3">
                  <label class="block text-sm font-medium text-gray-700">Comentario</label>
                  <textarea v-model="newReview.comment" rows="3"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring focus:ring-amber-500 focus:ring-opacity-50"
                    placeholder="Comparte tu experiencia con este postre..."></textarea>
                </div>
                <button @click="addReview"
                  class="mt-4 bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50">
                  Publicar Reseña
                </button>
              </div>

              <!-- Reviews List -->
              <div class="mt-6 space-y-4">
                <div v-for="review in selectedDessert.reviews" :key="review.id"
                  class="bg-white p-4 rounded-lg shadow border border-gray-100">
                  <div class="flex justify-between items-start">
                    <div>
                      <div class="flex items-center">
                        <div class="flex">
                          <StarIcon v-for="i in 5" :key="i" :class="[
                            'w-5 h-5',
                            i <= review.rating
                              ? 'text-yellow-500 fill-current'
                              : 'text-gray-300'
                          ]" />
                        </div>
                        <span class="ml-2 font-semibold">{{ review.author }}</span>
                      </div>
                      <p class="mt-2 text-gray-700">{{ review.comment }}</p>
                    </div>
                    <div class="flex flex-col items-center">
                      <button @click="voteReview(review.id, 'up')" class="text-gray-500 hover:text-amber-600">
                        <ThumbsUpIcon size="18" />
                      </button>
                      <span class="my-1 font-semibold">{{ review.votes }}</span>
                      <button @click="voteReview(review.id, 'down')" class="text-gray-500 hover:text-amber-600">
                        <ThumbsDownIcon size="18" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="bg-blue-800 text-white p-4 mt-12">
      <div class="container mx-auto text-center">
        <p>© 2025 mypartner - Todos los derechos reservados</p>
      </div>
    </footer>
  </div>
</template>

<style>
/* Estilos adicionales si son necesarios */
</style>
