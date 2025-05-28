<script setup>
import { ref, computed, onMounted } from 'vue'
// import { useUserStore } from './store/user'
import {
  Users as UsersIcon,
  Star as StarIcon,
  Search as SearchIcon,
  ArrowLeft as ArrowLeftIcon,
  ThumbsUp as ThumbsUpIcon,
  ThumbsDown as ThumbsDownIcon,
  DollarSign,
  Star,
  Rocket,
  TrendingUp,
  Flame
} from 'lucide-vue-next'
import HeaderComponent from '../src/components/HeaderComponent.vue'
import FooterComponent from '../src/components/FooterComponent.vue'
import { supabase } from './services/supabase'
const profilesSup = ref([])
const perfilesOrdenados = computed(() => {
  return [...filteredProfiles.value].sort((a, b) => b.averageRating - a.averageRating).slice(0, 3)
})

/* const isMenuOpen = ref(false) */
const currentView = ref('home')
/* const darkMode = ref(false) */

// Estado de la aplicación
const searchQuery = ref('')
const selectedProfileId = ref(null)
const newReview = ref({
  rating: 0,
  comment: '',
  type: '',
  votes: 0
})

const email = ref('')
const password = ref('')
const isSigningUp = ref(false)

const selectedImageFile = ref(null)

const roadmap = ref([
  {
    title: 'Usuarios ganan dinero por aportar valor',
    description: 'Sistema de recompensas por reseñas útiles, divertidas o muy votadas.',
    icon: DollarSign,
    date: 'Junio 2025',
    status: 'progreso'
  },
  {
    title: 'Perfiles destacados y reseñas premium',
    description: 'Los usuarios podrán pagar para destacar su reseña o su perfil (¡si se atreven!).',
    icon: Star,
    date: 'Julio 2025',
    status: 'futuro'
  },
  {
    title: 'Sistema de votos y rankings de exs',
    description: '¿Top 10 de exs inolvidables? Viene el ranking con más salseo que Eurovisión.',
    icon: TrendingUp,
    date: 'Agosto 2025',
    status: 'futuro'
  },
  {
    title: 'Comunidades temáticas (zodiaco, tóxicos, intensitos...)',
    description: 'Agrupamos reseñas por estilos relacionales para que encuentres tu "tribu de exs".',
    icon: UsersIcon,
    date: 'Septiembre 2025',
    status: 'futuro'
  },
  {
    title: 'Reseñas de audio (¡sí, vas a poder contarla con tu voz!)',
    description: 'Exprésate como quieras. Voz, drama y arte para la posteridad.',
    icon: Flame,
    date: 'Noviembre 2025',
    status: 'futuro'
  },
  {
    title: 'Internacionalización y multilenguaje',
    description: '¡Que el drama no tenga fronteras! Traducimos MyPartner al inglés, francés, etc.',
    icon: Rocket,
    date: 'Diciembre 2025',
    status: 'futuro'
  }
])

const filters = ref({
  ageMin: 18,
  ageMax: 99,
  minReviews: 0,
  category: '',
  relationshipType: ''
})

const exploredFilteredProfiles = computed(() => {
  return profilesSup.value.filter(profile => {
    const query = searchQuery.value.toLowerCase()
    const matchesSearch = !searchQuery.value ||
      profile.name.toLowerCase().includes(query) ||
      profile.location?.toLowerCase().includes(query)

    const ageOk = profile.age >= filters.value.ageMin && profile.age <= filters.value.ageMax
    const reviewsOk = (profile.reviews?.length || 0) >= filters.value.minReviews
    const categoryOk = !filters.value.category || profile.categories?.includes(filters.value.category)
    const relationOk = !filters.value.relationshipType || profile.relationshipType === filters.value.relationshipType

    return matchesSearch && ageOk && reviewsOk && categoryOk && relationOk
  })
})

const showSurpriseModal = ref(false)
const surpriseProfile = ref(null)

function getRandomProfile() {
  const profiles = exploredFilteredProfiles.value
  if (profiles.length === 0) {
    // Puedes usar un modal también aquí si quieres
    alert("No hay perfiles que coincidan con los filtros.")
    return
  }
  const random = profiles[Math.floor(Math.random() * profiles.length)]
  surpriseProfile.value = random
  showSurpriseModal.value = true
}

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


onMounted(async () => {
  getProfilesSup()
  const { data: { user: currentUser } } = await supabase.auth.getUser()
  user.value = currentUser
  supabase.auth.onAuthStateChange((_event, session) => {
    user.value = session?.user || null
  })

  /*   // Detectar preferencia del usuario o estado guardado
    const savedMode = localStorage.getItem('darkMode')
    darkMode.value = savedMode === 'true' */
})

// Computed properties
const filteredProfiles = computed(() => {
  if (!searchQuery.value) return profilesSup.value

  const query = searchQuery.value.toLowerCase()
  return profilesSup.value.filter(profileSup =>
    profileSup.name.toLowerCase().includes(query) ||
    profileSup.location?.toLowerCase().includes(query)
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
  if (!newProfile.value.name || !newProfile.value.age || !newProfile.value.location || !selectedImageFile.value || !newProfile.value.relationshipType) {
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
        relationshipType: newProfile.value.relationshipType,
        averageRating: 0, // Esto lo puedes definir como 0 o calcularlo después,
        pic: publicURL,
      }
    ])

  if (error) {
    console.error('Error al subir el perfil:', error)
    alert('Hubo un error al subir el perfil')
  } else {
    alert('Perfil subido con éxito!')
    newProfile.value = { name: '', age: '', location: '', relationshipType: '' } // Resetear formulario
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

  if (!file || !file.name) {
    console.error('Archivo inválido o sin nombre:', file)
    alert('El archivo de imagen es inválido')
    return null
  }

  const { error } = await supabase.storage
    .from('profiles-images')
    .upload(filePath, file)

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

async function viewProfile(id) {
  selectedProfileId.value = id
  // Incrementar contador de vistas en Supabase
  const { data, error } = await supabase
    .from('profiles')
    .select('views')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error al obtener vistas:', error)
    return
  }

  const currentViews = data.views || 0

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ views: currentViews + 1 })
    .eq('id', id)

  if (updateError) {
    console.error('Error al actualizar vistas:', updateError)
  } else {
    console.log(`Vistas actualizadas: ${currentViews + 1}`)

    // ⚡️ Actualizar localmente el número de vistas para que se muestre al momento
    const profile = profilesSup.value.find(p => p.id === id)
    if (profile) {
      profile.views = currentViews + 1
    }
  }

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

    const updatedReviews = [...profileSup.reviews, newReviewObj]
    const totalRating = updatedReviews.reduce((sum, review) => sum + review.rating, 0)
    const nuevoPromedio = totalRating / updatedReviews.length

    await supabase
      .from('profiles')
      .update({ averageRating: nuevoPromedio })
      .eq('id', selectedProfileId.value)


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
  // 1. Traer la reseña directamente de Supabase (más seguro)
  const { data: review, error: fetchError } = await supabase
    .from('reviews')
    .select('votes')
    .eq('id', reviewId)
    .single()

  if (fetchError || !review) {
    console.error('No se pudo obtener la reseña:', fetchError)
    return
  }

  let newVotes = review.votes || 0

  if (voteType === 'up') {
    newVotes++
  } else if (voteType === 'down' && newVotes > 0) {
    newVotes--
  }

  const { error: updateError } = await supabase
    .from('reviews')
    .update({ votes: newVotes })
    .eq('id', reviewId)

  if (updateError) {
    console.error('Error al guardar el voto:', updateError)
  } else {
    console.log('Voto guardado con éxito')
  }

  const profileSup = profilesSup.value.find(p => p.id === selectedProfileId.value)
  if (profileSup) {
    const reviewInList = profileSup.reviews.find(r => r.id === reviewId)
    if (reviewInList) {
      reviewInList.votes = newVotes // actualiza la vista al momento
    }
  }
}

const user = ref(null)

/* async function loginWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
  })
  if (error) console.error('Error login:', error.message)
} */
async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  if (error) {
    alert('Error al registrar: ' + error.message)
    return null
  }
  alert('¡Registro exitoso! Revisa tu email para verificar tu cuenta.')
  return data
}

async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) {
    alert('Error al iniciar sesión: ' + error.message)
    return null
  }
  alert('¡Bienvenido de nuevo!')
  currentView.value = 'home' // O lo que sea
  return data
}

async function handleEmailAuth() {
  if (isSigningUp.value) {
    await signUp(email.value, password.value)
  } else {
    await signIn(email.value, password.value)
  }
  email.value = ''
  password.value = ''
}


</script>

<template>
  <div class="min-h-screen w-full overflow-x-hidden">
    <!-- Menú móvil mejorado -->
    <nav
      class="bg-blue-800 text-white shadow-md py-4 rounded-b-2xl rounded-t-2xl w-full fixed top-0 left-0 right-0 z-50">
      <div class="w-full flex justify-between items-center px-4">
        <!-- Logo -->
        <h1 @click="currentView = 'home'"
          class="text-3xl font-extrabold tracking-wide cursor-pointer transition-transform hover:scale-105">
          mypartner
        </h1>

        <!-- Menú en desktop -->
        <div class="hidden md:flex gap-4 items-center">
          <!-- Redes -->
          <a href="https://www.tiktok.com/@mypartner.club" target="_blank"
            class="flex items-center gap-2 bg-white/10 hover:bg-white/20 font-semibold py-2 px-4 rounded-xl transition duration-200 shadow-md hover:shadow-lg leading-none">
            <svg class="w-5 h-5 fill-white" viewBox="0 0 256 256">
              <path
                d="M224,72a72,72,0,0,1-72-72h32a40,40,0,0,0,40,40v32Zm-88-48v132a28,28,0,1,1-28-28,8,8,0,0,0,0-16,44,44,0,1,0,44,44V72a103.6,103.6,0,0,0,40,8V48A72.1,72.1,0,0,1,136,24Z" />
            </svg>
            <span class="text-white leading-none">TikTok</span>
          </a>

          <a href="https://www.instagram.com/mypartner.club" target="_blank"
            class="flex items-center gap-2 bg-white/10 hover:bg-white/20 font-semibold py-2 px-4 rounded-xl transition duration-200 shadow-md hover:shadow-lg leading-none">
            <svg class="w-5 h-5 fill-white" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.849.07..." />
            </svg>
            <span class="text-white leading-none">Instagram</span>
          </a>

          <!-- Botones -->
          <button @click="currentView = 'createProfile'"
            class="bg-white/10 hover:bg-white/20 font-semibold py-2 px-4 rounded-xl transition duration-200 shadow-md hover:shadow-lg">
            Subir Perfil
          </button>
          <button @click="currentView = 'info'"
            class="bg-white/10 hover:bg-white/20 font-semibold py-2 px-4 rounded-xl transition duration-200 shadow-md hover:shadow-lg">
            Info
          </button>
          <button @click="currentView = 'contacto'"
            class="bg-white/10 hover:bg-white/20 font-semibold py-2 px-4 rounded-xl transition duration-200 shadow-md hover:shadow-lg">
            Contacto
          </button>
        </div>
      </div>

      <!-- Menú móvil -->
      <div
        class="fixed bottom-0 left-0 right-0 bg-blue-800 text-white shadow-md px-4 py-2 md:hidden flex justify-around items-center z-50 rounded-t-2xl">
        <button @click="currentView = 'home'" class="flex flex-col items-center text-xs">
          <span class="text-2xl">🏠</span>
          <span>Inicio</span>
        </button>
        <button @click="currentView = 'createProfile'" class="flex flex-col items-center text-xs">
          <span class="text-2xl">➕</span>
          <span>Subir</span>
        </button>
        <button @click="currentView = 'info'" class="flex flex-col items-center text-xs">
          <span class="text-2xl">ℹ️</span>
          <span>Info</span>
        </button>
        <button @click="currentView = 'contacto'" class="flex flex-col items-center text-xs">
          <span class="text-2xl">📞</span>
          <span>Contacto</span>
        </button>
      </div>
    </nav>


    <HeaderComponent />

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">

      <!-- Home View - List of Profiles -->
      <div v-if="currentView === 'home'" class="space-y-6">

        <div class="flex justify-between items-center">
          <h2 class="text-4xl font-extrabold tracking-tight text-amber-800">TOP Perfiles</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="(perfil, index) in perfilesOrdenados" :key="perfil.id" :class="[
            'transition-transform duration-300 ease-in-out p-4 rounded-xl shadow-md cursor-pointer',
            index === 0 ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 text-black scale-105 shadow-lg animate-pulse' : '',
            index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-black scale-105 shadow-lg animate-pulse' : '',
            index === 2 ? 'bg-gradient-to-br from-orange-200 to-orange-400 text-black scale-105 shadow-lg animate-pulse' : '',
            index > 2 ? 'bg-white dark:bg-gray-800' : ''
          ]" @click="viewProfile(perfil.id)">
            <img :src="perfil.pic" alt="Foto de perfil" class="w-full h-64 object-contain rounded-md mb-2" />
            <h3 class="text-xl font-semibold">{{ perfil.name }}</h3>
            <p class="text-sm text-gray-600 dark:text-gray-300">{{ perfil.location }}</p>
            <p class="text-sm mt-1">Edad: {{ perfil.age }}</p>
            <p class="text-sm">Puntuación media: ⭐ {{ perfil.averageRating.toFixed(2) }}</p>
            <p class="text-sm">Vistas: 👁️ {{ perfil.views }}</p>
          </div>

        </div>

        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 w-full">
          <h2 class="text-4xl font-extrabold tracking-tight text-amber-800">
            Perfiles
          </h2>

          <div class="relative w-full sm:w-auto">
            <SearchIcon class="absolute left-3 top-3 text-gray-500" size="18" />
            <input v-model="searchQuery" type="text" placeholder="Buscar por nombre o ciudad"
              class="w-full sm:w-[300px] pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition" />
          </div>
        </div>


        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div v-for="profileSup in filteredProfiles" :key="profileSup.id" @click="viewProfile(profileSup.id)"
            class="bg-white rounded-xl shadow hover:shadow-xl transition duration-300 border border-gray-100 overflow-hidden group cursor-pointer">
            <div class="h-auto bg-gradient-to-br from-blue-100 to-blue-200 relative">

              <img v-if="profileSup.pic" :src="profileSup.pic" alt="Foto de perfil"
                class="object-contain w-full h-64" />
              <div v-else class="absolute inset-0 flex items-center justify-center text-amber-800">
                <UsersIcon size="64" />
              </div>
            </div>
            <div class="p-4">
              <h3 class="text-xl font-semibold text-gray-900 group-hover:text-amber-700 transition">{{ profileSup.name
                }}, {{ profileSup.age }}</h3>
              <h4 class="text-sm mt-2 text-gray-500">{{ profileSup.location }}</h4>

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
      <div v-if="currentView === 'explore'" class="p-6 space-y-6">
        <h2 class="text-2xl font-bold text-black">🔍 Explorar Perfiles</h2>

        <!-- FILTROS -->
        <div class="bg-white/10 p-4 rounded-xl shadow-md grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label class="block mb-1 text-sm font-medium text-black">Edad mínima</label>
            <input v-model="filters.ageMin" type="number" min="18"
              class="w-full rounded px-3 py-1 bg-white/20 text-black">
          </div>
          <div>
            <label class="block mb-1 text-sm font-medium text-black">Edad máxima</label>
            <input v-model="filters.ageMax" type="number" max="99"
              class="w-full rounded px-3 py-1 bg-white/20 text-black">
          </div>
          <div>
            <label class="block mb-1 text-sm font-medium text-black">Mínimo de reseñas</label>
            <input v-model="filters.minReviews" type="number" min="0"
              class="w-full rounded px-3 py-1 bg-white/20 text-black">
          </div>
          <div>
            <label class="block mb-1 text-sm font-medium text-black">Categorías</label>
            <select v-model="filters.category" class="w-full rounded px-3 py-1 bg-white/20 text-black">
              <option value="">Todas</option>
              <option>Tóxico</option>
              <option>Inolvidable</option>
              <option>Gracioso</option>
              <option>Mentiroso</option>
            </select>
          </div>
          <div>
            <label class="block mb-1 text-sm font-medium text-black">Tipo de relación</label>
            <select v-model="filters.relationshipType" class="w-full rounded px-3 py-1 bg-white/20 text-black">
              <option value="">Todas</option>
              <option>Exnovi@</option>
              <option>Follamig@</option>
              <option>Abierta</option>
              <option>Ghosting</option>
            </select>
          </div>
          <div class="flex items-end">
            <button @click="getRandomProfile"
              class="w-full bg-pink-600 hover:bg-pink-700 text-black font-bold py-2 px-4 rounded-xl transition">
              🎁 Sorpresa del día
            </button>
          </div>
          <div v-if="showSurpriseModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div class="bg-white rounded-2xl p-6 w-[90%] max-w-md text-center shadow-lg relative">
              <button @click="showSurpriseModal = false"
                class="absolute top-2 right-2 text-black text-xl hover:text-red-500 transition">
                &times;
              </button>

              <h2 class="text-2xl font-bold mb-4">🎁 Sorpresa del día</h2>

              <div v-if="surpriseProfile" class="space-y-2">
                <img :src="surpriseProfile.pic || '/default-avatar.png'"
                  class="w-24 h-24 rounded-full mx-auto object-cover border border-black/10" />
                <h3 class="text-xl font-semibold text-black">
                  {{ surpriseProfile.name }} ({{ surpriseProfile.age }} años)
                </h3>
                <p class="text-black/70">Relación: {{ surpriseProfile.relationshipType }}</p>
                <p class="text-black font-medium">⭐ {{ surpriseProfile.reviews?.length || 0 }} reseñas</p>
              </div>
            </div>
          </div>
        </div>

        <!-- RESULTADOS -->
        <div class="space-y-4">
          <div v-for="profile in exploredFilteredProfiles" :key="profile.id"
            class="bg-white/10 rounded-xl p-4 shadow-md hover:shadow-lg transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <img :src="profile.pic || '/default-avatar.png'" alt="Avatar"
                class="w-20 h-20 rounded-full object-cover border border-black/20" />
              <h3 class="text-lg font-semibold text-black">{{ profile.name }} ({{ profile.age }} años)</h3>
              <p class="text-sm text-black/80">Relación: {{ profile.relationshipType }}</p>
              <div class="flex gap-2 mt-1 flex-wrap">
                <span v-for="tag in profile.categories" :key="tag"
                  class="bg-white/20 text-black text-xs px-2 py-1 rounded-xl">
                  #{{ tag }}
                </span>
              </div>
            </div>
            <div class="text-black font-semibold">⭐ {{ profile.reviews.length }} reseñas</div>
          </div>
        </div>

      </div>
      <!-- Login View -->
      <div v-if="currentView === 'login'">
        <button @click="currentView = 'home'" class="flex items-center text-amber-700 hover:text-amber-900">
          <ArrowLeftIcon class="mr-1" size="18" /> Volver a la lista
        </button>
        <h2 class="text-2xl font-bold text-amber-900">Iniciar Sesión / Registrarse</h2>

        <form @submit.prevent="handleEmailAuth" class="bg-white rounded-xl shadow p-6 space-y-5">
          <input v-model="email" type="email" placeholder="Email" required class="w-full p-2 border rounded" />
          <input v-model="password" type="password" placeholder="Contraseña" required
            class="w-full p-2 border rounded" />

          <button type="submit"
            class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition duration-300">
            {{ isSigningUp ? 'Registrarse' : 'Iniciar Sesión' }}
          </button>
        </form>

        <button @click="isSigningUp = !isSigningUp" class="mt-2 text-blue-500 underline">
          {{ isSigningUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate' }}
        </button>
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
            <label for="relationshipType" class="block text-sm font-medium text-gray-700">Tipo de relación</label>
            <select id="relationshipType" v-model="newProfile.relationshipType" required
              class="mt-1 p-2 w-full border border-gray-300 rounded-md">
              <option value="">Selecciona una opción</option>
              <option value="follamig@">Follamig@</option>
              <option value="estable">Estable</option>
              <option value="exnovi@">Exnovi@</option>
              <option value="abierta">Abierta</option>
              <option value="casual">Ghosting</option>
            </select>
          </div>
          <div class="mb-4">
            <label for="image" class="block text-sm font-medium text-gray-700">Imagen</label>
            <input id="image" type="file" @change="handleFileChange" required
              class="mt-1 p-2 w-full border border-gray-300 rounded-md" />
          </div>
          <button type="submit" class="bg-amber-600 text-white px-4 py-2 rounded-md hover:bg-amber-700">Subir
            perfil</button>
        </form>
      </div>


      <!-- Profile Detail View -->
      <div v-else-if="currentView === 'detail' && selectedProfile" class="space-y-6">
        <button @click="currentView = 'home'"
          class="flex cursor-pointer items-center text-amber-700 hover:text-amber-900">
          <ArrowLeftIcon class="mr-1" size="18" />
          Volver a la lista
        </button>
        <p class="text-sm text-gray-500">👀 Visto {{ selectedProfile.views }} veces</p>

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
                  <select v-model="newReview.type"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500">
                    <option value="love">❤️ Sentimental</option>
                    <option value="work">💼 Profesional</option>
                  </select>
                </div>
                <div class="mt-2">
                  <label class="block text-sm font-medium text-gray-700">Puntuación</label>
                  <div class="flex mt-1">
                    <button v-for="i in 5" :key="i" @click="newReview.rating = i" class="focus:outline-none">
                      <StarIcon :class="[
                        'w-6 h-6 cursor-pointer transition-colors duration-200',
                        i <= newReview.rating ? 'text-yellow-500' : 'text-gray-300'
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
      <div v-else-if="currentView === 'info'" class="min-h-screen overflow-x-hidden bg-white text-gray-800 p-8">
        <button @click="currentView = 'home'"
          class="flex cursor-pointer items-center text-amber-700 hover:text-amber-900">
          <ArrowLeftIcon class="mr-1" size="18" />
          Volver a la lista
        </button>
        <div class="max-w-3xl mx-auto text-center">
          <h2 class="text-4xl font-extrabold mb-4 text-pink-600">¿Qué es MyPartner?</h2>
          <p class="text-lg mb-6 leading-relaxed">
            MyPartner es la primera plataforma donde puedes dejar <span class="font-semibold text-pink-500">reseñas
              anónimas</span> sobre personas, puede ser tu expareja, un@ amig@ o cualquier persona que hayas conocido..
            Con humor, respeto y sinceridad, ayudamos a crear un ecosistema más honesto en las relaciones. ❤️‍🔥
          </p>
          <p class="text-lg mb-6 leading-relaxed">
            MyPartner es un MVP (Producto Mínimo Viable), es una plataforma en etapa de <span
              class="font-semibold text-pink-500">idea
              materializada</span> que tiene un objetivo muy claro. MyPartner está basada en el dolor de muchas personas
            que han sido engañadas por personas sin responsabilidad afectiva.
          </p>
          <p class="text-lg mb-6 leading-relaxed">
            Por eso, decidí crear esta web, para poder ayudar a toda persona que quiera saber el <span
              class="font-semibold text-pink-500">historial amoroso</span>
            de una persona en concreto antes de conocerla. La mejor forma es dejar reseñas de las personas que
            conocemos, para que otras puedan ver si la persona que pretenden conocer es <span
              class="font-semibold text-pink-500">la persona ideal</span>
            y es el perfil que están buscando o no.
          </p>
          <p class="text-lg mb-6 leading-relaxed">La web está en fase de prueba, pero con <span
              class="font-semibold text-pink-500">vuestro apoyo</span>, sé que podemos crear una web potente y que ayude
            a muchas personas.</p>
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
          <!-- Timeline Roadmap -->
          <div class="max-w-3xl mx-auto mt-16">
            <h2 class="text-3xl font-bold text-center text-pink-600 mb-6">🔮 Roadmap de MyPartner</h2>
            <p class="text-center text-gray-600 mb-12">Estas son las mejoras que vienen para revolucionar las
              relaciones... y el salseo 🧂</p>

            <ol class="relative border-l border-pink-300">
              <li v-for="(item, index) in roadmap" :key="index" class="mb-10 ml-6">
                <span
                  class="absolute flex items-center justify-center w-6 h-6 bg-pink-100 rounded-full -left-3 ring-8 ring-white">
                  <component :is="item.icon" class="w-3 h-3 text-pink-600" />
                </span>
                <h3 class="flex items-center mb-1 text-lg font-semibold text-pink-700">
                  {{ item.title }}
                  <span v-if="item.status === 'progreso'"
                    class="bg-yellow-100 text-yellow-800 text-xs font-medium mr-2 ml-3 px-2.5 py-0.5 rounded">
                    En progreso
                  </span>
                  <span v-if="item.status === 'hecho'"
                    class="bg-green-100 text-green-800 text-xs font-medium mr-2 ml-3 px-2.5 py-0.5 rounded">
                    Hecho
                  </span>
                  <span v-if="item.status === 'futuro'"
                    class="bg-gray-100 text-gray-800 text-xs font-medium mr-2 ml-3 px-2.5 py-0.5 rounded">
                    Próximamente
                  </span>
                </h3>
                <p class="mb-2 text-base font-normal text-gray-600">{{ item.description }}</p>
                <time class="block mb-2 text-sm font-normal leading-none text-gray-400">📅 {{ item.date }}</time>
              </li>
            </ol>
          </div>

        </div>
      </div>

      <div v-else-if="currentView === 'contacto'" class="min-h-screen bg-white text-gray-800 p-8">
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
              <p class="text-sm text-gray-600">info@myparnter.club</p>
            </div>

            <form action="https://formsubmit.co/info@myparnter.club" method="POST"
              class="mt-8 bg-white border border-pink-100 shadow-lg rounded-2xl p-8 space-y-6 text-left w-full mx-auto">
              <div>
                <label class="block mb-1 text-sm font-medium text-pink-600">Nombre</label>
                <input type="text" name="nombre" required
                  class="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-pink-300">
              </div>

              <div>
                <label class="block mb-1 text-sm font-medium text-pink-600">Email</label>
                <input type="email" name="email" required
                  class="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-pink-300">
              </div>

              <div>
                <label class="block mb-1 text-sm font-medium text-pink-600">Tipo de asunto</label>
                <select name="tipo" required
                  class="w-full border border-gray-300 rounded-xl p-3 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-300">
                  <option disabled selected value="">Selecciona una opción</option>
                  <option value="sugerencia">Sugerencia</option>
                  <option value="queja">Queja</option>
                  <option value="desarrollo">Desarrollo</option>
                </select>
              </div>

              <div>
                <label class="block mb-1 text-sm font-medium text-pink-600">Asunto</label>
                <input type="text" name="asunto" required
                  class="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-pink-300">
              </div>

              <div>
                <label class="block mb-1 text-sm font-medium text-pink-600">Mensaje</label>
                <textarea name="mensaje" rows="5" required
                  class="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-pink-300"></textarea>
              </div>

              <!-- Botón sexy -->
              <div class="text-center">
                <button type="submit"
                  class="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all duration-300 ease-in-out hover:scale-105">
                  🚀 Enviar mensaje
                </button>
              </div>

              <!-- Anti spam de FormSubmit -->
              <input type="hidden" name="_captcha" value="false">
              <input type="hidden" name="_template" value="box">
            </form>

          </div>

        </div>
      </div>
    </main>

    <!-- Footer -->
    <FooterComponent />
  </div>
</template>
