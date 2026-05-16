import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      token:   null,
      isAdmin: false,
      loading: false,
      error:   null,

      login: async (username, password) => {
        set({ loading: true, error: null })
        try {
          const { data } = await axios.post(`${API}/auth/login`, { username, password })
          set({ token: data.token, isAdmin: true, loading: false })
          return true
        } catch (err) {
          const msg = err.response?.data?.error || 'Login failed. Check your credentials.'
          set({ error: msg, loading: false })
          return false
        }
      },

      logout: () => set({ token: null, isAdmin: false, error: null }),

      clearError: () => set({ error: null }),
    }),
    {
      name: '--admin-auth',
      partialize: (s) => ({ token: s.token, isAdmin: s.isAdmin }),
    }
  )
)
