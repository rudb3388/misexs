// store/user.js (Pinia)
import { defineStore } from 'pinia'
import supabase from '../supabaseClient' // tu instancia supabase

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
  }),
  actions: {
    async fetchUser() {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()
      if (error) throw error
      this.user = user
    },
  },
})
