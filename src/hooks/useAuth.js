// src/hooks/useAuth.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import useAuthStore from '../Store/authStore';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios'; 

export const useLoginMutation = () => {
  const loginSuccess = useAuthStore((state) => state.loginSuccess);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async ({ email, password }) => {
      const response = await API.post('/auth/login', { email, password });
      return response.data;
    },

    onSuccess: (data) => {
      const payload = data?.data || data?.result || data;
      const token = payload?.token || payload?.accessToken || payload?.jwt || data?.token || data?.accessToken || data?.jwt || null;
      const userPayload = payload?.user || data?.user || {
        id: payload?._id || data?._id,
        name: payload?.name || data?.name,
        email: payload?.email || data?.email,
        role: payload?.role || data?.role,
      };

      loginSuccess(userPayload, token);
      toast.success('Login successful');
      navigate('/admin/dashboard');
    },

    onError: (error) => {
      const msg = error.response?.data?.message || error.message || 'Login failed';
      console.error('Login Process Failed:', msg);
      toast.error(msg);
    }
  });
};

export const useWorkerLoginMutation = () => {
  const loginSuccess = useAuthStore((state) => state.loginSuccess);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async ({ phone, password }) => {
      const response = await API.post('/auth/worker-login', { phone: Number(phone), password });
      return response.data;
    },

    onSuccess: (data) => {
      const payload = data?.data || data?.result || data;
      const token = payload?.token || payload?.accessToken || payload?.jwt || data?.token || data?.accessToken || data?.jwt || null;
      const userPayload = payload?.user || data?.user || {
        id: payload?._id || data?._id,
        name: payload?.name || data?.name,
        phone: payload?.phone || data?.phone,
        role: payload?.role || data?.role || 'worker',
      };

      loginSuccess(userPayload, token);
      toast.success('Worker login successful!');
      navigate('/worker/dashboard');
    },

    onError: (error) => {
      const msg = error.response?.data?.message || error.message || 'Worker login failed';
      console.error('Worker Login Process Failed:', msg);
      toast.error(msg);
    }
  });
};

// 3. GET Admin Profile
export const useGetAdminProfile = () => {
  return useQuery({
    queryKey: ['adminProfile'],
    queryFn: async () => {
      const response = await API.get('/auth/profile');
      return response.data;
    }
  });
};

// 4. UPDATE Admin Profile
export const useUpdateAdminProfile = () => {
  const queryClient = useQueryClient();
  const updateUserData = useAuthStore((state) => state.updateUserData);

  return useMutation({
    mutationFn: async (payload) => {
      const response = await API.put('/auth/profile', payload);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Admin profile updated successfully!');
      if (updateUserData) {
        updateUserData(data);
      }
      queryClient.invalidateQueries({ queryKey: ['adminProfile'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update admin profile');
    }
  });
};