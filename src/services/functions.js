import { supabase } from './supabase'

// Ejemplo para obtener los perfiles
async function getProfiles() {
  const { data, error } = await supabase
    .from('profiles') // Cambia 'profiles' por tu nombre de tabla
    .select('*') // Selecciona todos los campos
  if (error) {
    console.log('Error fetching profiles:', error)
    alert('Error fetching profiles')
  } else {
    console.log('Profiles:', data)
    alert('¡Hecho!')
  }
}

// getProfiles() // Llamada a la función para ver los perfiles

async function addProfile() {
  const { data, error } = await supabase
    .from('profiles')
    .insert([{ name: 'Juan', email: 'juan@correo.com' }])
  if (error) {
    console.log('Error adding profile:', error)
  } else {
    console.log('Profile added:', data)
  }
}

// addProfile()

async function updateProfile(id) {
  const { data, error } = await supabase.from('profiles').update({ name: 'Juanito' }).match({ id })
  if (error) {
    console.log('Error updating profile:', error)
  } else {
    console.log('Profile updated:', data)
  }
}

// updateProfile(1) // Cambiar el nombre del perfil con id 1
