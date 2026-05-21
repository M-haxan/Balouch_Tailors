import { create } from 'zustand';

const useAuthStore = create((set) => ({
  user: null, // Shuru mein koi user nahi hoga
  isAuthenticated: false, // Shuru mein user logged in nahi hai

  // Action 1: Jab admin successfully login ho jaye
  loginSuccess: (userData) => set({
    user: userData,
    isAuthenticated: true
  }),

  // Action 2: Jab admin logout kare
  logout: () => set({ 
    user: null, 
    isAuthenticated: false 
  }),
}));

export default useAuthStore;