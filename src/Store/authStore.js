import { create } from 'zustand';
import { persist } from 'zustand/middleware';
const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      loginSuccess: (userData, token) => set({
        user: token ? { ...userData, token } : userData,
        token: token || null,
        isAuthenticated: true
      }),

      logout: () => set({ 
        user: null,
        token: null,
        isAuthenticated: false 
      }),
    }),
    {
      name: 'admin-ui-state', // LocalStorage mein sirf UI ka status save hoga
    }
  )
);

export default useAuthStore;