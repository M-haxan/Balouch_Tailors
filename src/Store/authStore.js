import { create } from 'zustand';
import { persist } from 'zustand/middleware';
const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      loginSuccess: (userData) => set({
        user: userData,
        isAuthenticated: true
      }),

      logout: () => set({ 
        user: null, 
        isAuthenticated: false 
      }),
    }),
    {
      name: 'admin-ui-state', // LocalStorage mein sirf UI ka status save hoga
    }
  )
);

export default useAuthStore;