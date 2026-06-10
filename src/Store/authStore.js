import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const clearPersistedAuthState = () => {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('admin-token');
    localStorage.removeItem('admin-ui-state');
  } catch (error) {
    console.warn('Unable to clear persisted auth state:', error);
  }
};

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      loginSuccess: (userData, token = null) => {
        set({
          user: userData || null,
          token: token || null,
          isAuthenticated: true,
        });
      },

      logout: () => {
        clearPersistedAuthState();
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: 'admin-ui-state',
    }
  )
);

export default useAuthStore;