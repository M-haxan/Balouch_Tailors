import { useQueryClient } from '@tanstack/react-query';
import API from '../api/axios';
import useAuthStore from '../Store/authStore';

export const useLogout = () => {
  const queryClient = useQueryClient();

  return async () => {
    try {
      // Tell the server to destroy the session
      await API.post('/auth/logout');
    } catch (error) {
      // Even if the server can't be reached, still log out on this device
      console.warn('Server logout failed:', error?.message);
    } finally {
      useAuthStore.getState().logout();
      // Remove cached data so the next person on this computer can't see it
      queryClient.clear();
    }
  };
};