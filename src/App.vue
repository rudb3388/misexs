<script setup>
import { ref, computed, onMounted } from 'vue'
import {
  Users as UsersIcon,
  Star as StarIcon,
  Search as SearchIcon,
  ArrowLeft as ArrowLeftIcon,
  ThumbsUp as ThumbsUpIcon,
  ThumbsDown as ThumbsDownIcon
} from 'lucide-vue-next'
import HeaderComponent from '../src/components/HeaderComponent.vue'
import FooterComponent from '../src/components/FooterComponent.vue'
import { supabase } from './services/supabase'
const profilesSup = ref([])

const currentView = ref('home')

// Estado de la aplicación
const searchQuery = ref('')
const selectedProfileId = ref(null)
const newReview = ref({
  rating: 0,
  comment: '',
  type: '',
  votes: 0
})

const selectedImageFile = ref(null)

async function getProfilesSup() {
  const { data, error } = await supabase.from('profiles').select('*, reviews(*)')
  profilesSup.value = data;

  if (error) {
    console.error('Error al obtener perfiles:', error)
    return
  }


  // Aquí procesamos los datos para asegurarnos de que tengan la forma correcta
  profilesSup.value = data.map(profile => ({
    ...profile,
    reviews: profile.reviews || []  // Aseguramos que siempre haya un array de reviews, aunque esté vacío
  }))
}

onMounted(() => {
  getProfilesSup()
})

// Computed properties
const filteredProfiles = computed(() => {
  if (!searchQuery.value) return profilesSup.value

  const query = searchQuery.value.toLowerCase()
  return profilesSup.value.filter(profileSup =>
    profileSup.name.toLowerCase().includes(query)
  )
})

const selectedProfile = computed(() => {
  if (!selectedProfileId.value) return null
  return profilesSup.value.find(p => p.id === selectedProfileId.value)
})

const newProfile = ref({
  name: '',
  age: '',
  location: '',
})

// Método para enviar el perfil al backend
async function submitProfile() {
  if (!newProfile.value.name || !newProfile.value.age || !newProfile.value.location || !selectedImageFile.value) {
    alert('Por favor, completa todos los campos')
    return
  }

  const uploadedPath = await uploadImage(selectedImageFile.value)
  if (!uploadedPath) return

  const publicURL = supabase.storage.from('profiles-images').getPublicUrl(uploadedPath).data.publicUrl

  const { error } = await supabase
    .from('profiles')
    .insert([
      {
        name: newProfile.value.name,
        age: newProfile.value.age,
        location: newProfile.value.location,
        averageRating: 0, // Esto lo puedes definir como 0 o calcularlo después,
        pic: publicURL,
      }
    ])

  if (error) {
    console.error('Error al subir el perfil:', error)
    alert('Hubo un error al subir el perfil')
  } else {
    alert('Perfil subido con éxito!')
    newProfile.value = { name: '', age: '', location: '' } // Resetear formulario
    currentView.value = 'home' // Volver a la vista principal
    selectedImageFile.value = null
    getProfilesSup() // Actualizar la lista de perfiles
  }
}

async function uploadImage(file) {
  const username = newProfile.value.name.toLowerCase().replace(/\s+/g, '-') // Ej: "Pepito Grillo" → "pepito-grillo"
  const fileExt = file.name.split('.').pop()
  const uniqueSuffix = Date.now() // o incluso un UUID si quieres máxima seguridad
  const fileName = `${username}-${uniqueSuffix}.${fileExt}`
  const filePath = `profiles/${fileName}`

  const { error } = await supabase.storage
    .from('profiles-images')
    .upload(filePath, file)

  if (!file || !file.name) {
    console.error('Archivo inválido o sin nombre:', file)
    alert('El archivo de imagen es inválido')
    return null
  }

  if (error) {
    console.error('Error al subir imagen:', error.message)
    alert('No se pudo subir la imagen.')
    return null
  }

  return filePath

}

function handleFileChange(event) {
  selectedImageFile.value = event.target.files[0]
}



// Métodos
function viewProfile(id) {
  selectedProfileId.value = id
  currentView.value = 'detail'
  // Resetear el formulario de reseña
  newReview.value = {
    rating: 0,
    comment: '',
    type: '',
    votes: 0
  }
}

async function addReview() {
  if (!newReview.value.rating || !newReview.value.comment || !newReview.value.type) {
    alert('Por favor, completa todos los campos de la reseña')
    return
  }

  const profileSup = profilesSup.value.find(p => p.id === selectedProfileId.value)
  if (profileSup) {
    // Crear nueva reseña
    const newReviewObj = {
      profile_id: selectedProfileId.value,
      rating: newReview.value.rating,
      comment: newReview.value.comment,
      type: newReview.value.type,
      votes: 0
    }

    const { error } = await supabase
      .from('reviews')
      .insert([newReviewObj])

    if (error) {
      console.error('Error al subir reseña:', error)
      alert('No se pudo subir la reseña')
      return
    }

    // Recalcular la puntuación media
    const totalRating = profileSup.reviews.reduce((sum, review) => sum + review.rating, 0)
    profileSup.averageRating = totalRating / profileSup.reviews.length

    // Resetear el formulario
    newReview.value = {
      rating: 0,
      comment: '',
      type: '',
      votes: 0,
    }
    getProfilesSup()

    alert('¡Gracias por tu reseña!')
  }
}

async function voteReview(reviewId, voteType) {
  const profileSup = profilesSup.value.find(p => p.id === selectedProfileId.value)
  if (!profileSup) return

  const review = profileSup.reviews.find(r => r.id === reviewId)
  if (!review) return

  if (voteType === 'up') {
    review.votes++
  } else if (voteType === 'down' && review.votes > 0) {
    review.votes--
  }

  const { error } = await supabase
    .from('reviews')
    .update({ votes: review.votes })
    .eq('id', reviewId)

  if (error) {
    console.error('Error al votar la reseña:', error)
  }
}

</script>

<template>
  <div class="min-h-screen bg-blue-50">
    <nav class="bg-blue-800 text-white p-4 shadow-md">
      <div class="container mx-auto flex justify-between items-center">
        <h1 @click="currentView = 'home'" class="text-2xl cursor-pointer font-bold flex items-center">
          mypartner
        </h1>
        <div class="flex space-x-6">
          <button class="cursor-pointer" @click="currentView = 'createProfile'">Subir Perfil</button>
          <button class="cursor-pointer" @click="currentView = 'info'">Info</button>
          <button class="cursor-pointer" @click="currentView = 'contacto'">Contacto</button>
        </div>
      </div>
    </nav>
    <HeaderComponent />

    <!-- Main Content -->
    <main class="container mx-auto p-4">

      <!-- Home View - List of Profiles -->
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
          <div v-for="profileSup in filteredProfiles" :key="profileSup.id"
            class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            @click="viewProfile(profileSup.id)">
            <div class="h-48 bg-blue-200 relative">
              <img v-if="profileSup.pic" :src="profileSup.pic" alt="Foto de perfil"
                class="object-cover w-full h-full" />
              <div v-else class="absolute inset-0 flex items-center justify-center text-amber-800">
                <UsersIcon size="64" />
              </div>
            </div>
            <div class="p-4">
              <h3 class="text-xl font-bold text-amber-900">{{ profileSup.name }}, {{ profileSup.age }}</h3>
              <h4 class="text-sm mt-5 font-bold text-amber-900">{{ profileSup.location }}</h4>

              <div class="flex items-center mt-2">
                <div class="flex">
                  <StarIcon v-for="i in 5" :key="i" :class="[
                    'w-5 h-5',
                    i <= Math.round(profileSup.averageRating)
                      ? 'text-yellow-500 fill-current'
                      : 'text-gray-300'
                  ]" />
                </div>
                <span class="ml-2 text-gray-600">
                  (❤️ {{ profileSup.reviews.length }} reseñas || ⭐ {{ profileSup.averageRating.toFixed(1) }})
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Nueva Vista: Crear Perfil -->
      <div v-if="currentView === 'createProfile'" class="space-y-6">
        <button @click="currentView = 'home'"
          class="flex cursor-pointer items-center text-amber-700 hover:text-amber-900">
          <ArrowLeftIcon class="mr-1" size="18" />
          Volver a la lista
        </button>
        <h2 class="text-3xl font-bold text-amber-900">Crear Perfil</h2>

        <!-- Formulario para crear un perfil -->
        <form @submit.prevent="submitProfile" class="bg-white p-6 rounded-lg shadow-md">
          <div class="mb-4">
            <label for="name" class="block text-sm font-medium text-gray-700">Nombre</label>
            <input id="name" v-model="newProfile.name" type="text" required
              class="mt-1 p-2 w-full border border-gray-300 rounded-md" />
          </div>
          <div class="mb-4">
            <label for="age" class="block text-sm font-medium text-gray-700">Edad</label>
            <input id="age" v-model="newProfile.age" type="number" required
              class="mt-1 p-2 w-full border border-gray-300 rounded-md" />
          </div>
          <div class="mb-4">
            <label for="location" class="block text-sm font-medium text-gray-700">Ubicación</label>
            <input id="location" v-model="newProfile.location" type="text" required
              class="mt-1 p-2 w-full border border-gray-300 rounded-md" />
          </div>
          <div class="mb-4">
            <label for="image" class="block text-sm font-medium text-gray-700">Imagen</label>
            <input id="image" type="file" @change="handleFileChange" required
              class="mt-1 p-2 w-full border border-gray-300 rounded-md" />
          </div>
          <button type="submit" class="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700">Subir
            Perfil</button>
        </form>
      </div>


      <!-- Profile Detail View -->
      <div v-else-if="currentView === 'detail' && selectedProfile" class="space-y-6">
        <button @click="currentView = 'home'"
          class="flex cursor-pointer items-center text-amber-700 hover:text-amber-900">
          <ArrowLeftIcon class="mr-1" size="18" />
          Volver a la lista
        </button>

        <div class="bg-white rounded-lg shadow-md overflow-hidden">
          <div class="h-64 bg-amber-200 relative">
            <div v-if="selectedProfile.pic" class="absolute inset-0">
              <img :src="selectedProfile.pic" alt="Foto de perfil" class="object-cover w-full h-full" />
            </div>
            <div v-else class="absolute inset-0 flex items-center justify-center text-amber-800">
              <UsersIcon size="96" />
            </div>
          </div>
          <div class="p-6">
            <h2 class="text-3xl font-bold text-amber-900">{{ selectedProfile.name }}</h2>
            <h2 class="text-3xl font-bold text-amber-900">{{ selectedProfile.location }}</h2>
            <div class="flex items-center mt-2">
              <div class="flex">
                <StarIcon v-for="i in 5" :key="i" :class="[
                  'w-5 h-5',
                  i <= Math.round(selectedProfile.averageRating)
                    ? 'text-yellow-500 fill-current'
                    : 'text-gray-300'
                ]" />
              </div>
              <span class="ml-2 text-gray-600">
                ({{ selectedProfile.reviews.length }} reseñas)
              </span>
            </div>

            <div class="mt-8">
              <h3 class="text-2xl font-bold text-amber-900">Reseñas</h3>

              <!-- Add Review Form -->
              <div class="mt-4 bg-amber-50 p-4 rounded-lg">
                <h4 class="text-lg font-semibold text-amber-900">Añadir una reseña</h4>
                <div class="mt-3">
                  <label class="block text-sm font-medium text-gray-700">Tipo de reseña</label>
                  <select v-model="newReview.type">
                    <option value="love">❤️ Sentimental</option>
                    <option value="work">💼 Profesional</option>
                  </select>
                </div>
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
                <div v-for="review in selectedProfile.reviews" :key="review.id"
                  class="bg-white p-4 rounded-lg shadow border border-gray-100">
                  <div class="flex justify-between items-start">

                    <div> <!-- Stars -->
                      <div class="flex items-center">
                        <div class="flex">
                          <StarIcon v-for="i in 5" :key="i" :class="[
                            'w-5 h-5',
                            i <= review.rating
                              ? 'text-yellow-500 fill-current'
                              : 'text-gray-300'
                          ]" />
                        </div>
                      </div>
                      <p class="text-sm text-gray-500 mt-1">
                        {{ review.type === 'love' ? '❤️ Sentimental' : '💼 Profesional' }}
                      </p>
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

      <!-- Info View-->
      <div v-else-if="currentView === 'info'"
        class="min-h-screen bg-gradient-to-b from-pink-50 to-white text-gray-800 p-8">
        <button @click="currentView = 'home'"
          class="flex cursor-pointer items-center text-amber-700 hover:text-amber-900">
          <ArrowLeftIcon class="mr-1" size="18" />
          Volver a la lista
        </button>
        <div class="max-w-3xl mx-auto text-center">
          <h2 class="text-4xl font-extrabold mb-4 text-pink-600">¿Qué es MisExs?</h2>
          <p class="text-lg mb-6 leading-relaxed">
            MisExs es la primera plataforma donde puedes dejar <span class="font-semibold text-pink-500">reseñas
              anónimas</span> sobre tus exparejas.
            Con humor, respeto y sinceridad, ayudamos a crear un ecosistema más honesto en las relaciones. ❤️‍🔥
          </p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mt-10">
            <div class="bg-white rounded-2xl shadow-lg p-6 border border-pink-100 hover:shadow-pink-200 transition">
              <h3 class="text-xl font-semibold mb-2 text-pink-600">💌 Anonimato garantizado</h3>
              <p class="text-sm text-gray-600">Tu identidad está protegida. Tú cuentas tu versión y el sistema se
                encarga de mantener la paz.</p>
            </div>
            <div class="bg-white rounded-2xl shadow-lg p-6 border border-pink-100 hover:shadow-pink-200 transition">
              <h3 class="text-xl font-semibold mb-2 text-pink-600">🧠 Inteligencia emocional</h3>
              <p class="text-sm text-gray-600">No se trata de vengarse, sino de comprender patrones, mejorar y compartir
                aprendizajes.</p>
            </div>
            <div class="bg-white rounded-2xl shadow-lg p-6 border border-pink-100 hover:shadow-pink-200 transition">
              <h3 class="text-xl font-semibold mb-2 text-pink-600">🧂 Un poco de salseo</h3>
              <p class="text-sm text-gray-600">¡Sí! Aquí también se viene a leer y a soltar. Que no todo sea zen, ¿no?
              </p>
            </div>
            <div class="bg-white rounded-2xl shadow-lg p-6 border border-pink-100 hover:shadow-pink-200 transition">
              <h3 class="text-xl font-semibold mb-2 text-pink-600">🔍 Transparencia relacional</h3>
              <p class="text-sm text-gray-600">Lo que no se cuenta en Instagram, aquí sí se sabe. ¡Pero con
                responsabilidad!</p>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="currentView === 'contacto'"
        class="min-h-screen bg-gradient-to-b from-pink-50 to-white text-gray-800 p-8">
        <button @click="currentView = 'home'"
          class="flex items-center cursor-pointer text-amber-700 hover:text-amber-900">
          <ArrowLeftIcon class="mr-1" size="18" />
          Volver a la lista
        </button>
        <div class="max-w-3xl mx-auto text-center">
          <h2 class="text-4xl font-extrabold mb-4 text-pink-600">Contacto</h2>
          <p class="text-lg mb-6 leading-relaxed">
            Te puedes poner con nosotros <span class="font-semibold text-pink-500"> para cualquier asunto</span>, ya sea
            sugerencias de la web, inversiones o simplemente agradecimientos por el servicio gratuito.
          </p>

          <div class="grid grid-cols-1 text-center mt-10">
            <div class="bg-white rounded-2xl shadow-lg p-6 border border-pink-100 hover:shadow-pink-200 transition">
              <h3 class="text-xl font-semibold mb-2 text-pink-600">💌 Email</h3>
              <p class="text-sm text-gray-600">info@myparnter.info</p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <FooterComponent />
  </div>
</template>
