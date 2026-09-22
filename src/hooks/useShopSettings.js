import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import API from '../api/axios';
import defaultLogo from '../assets/BT_Logo.png';

export const DEFAULT_SHOP_SETTINGS = {
  shopName: 'Balouch Tailors',
  tagline: 'Gents Shalwar Qameez Specialist',
  proprietor: 'Zubair Balouch',
  primaryPhone: '0313-4389192',
  secondaryPhone: '0306-7379919',
  address: 'Hazori Bagh Road, Street 1, Muhallah Muhammadi, Near Peer Muhammad Murad Masjid, Multan',
  logoUrl: defaultLogo
};

// 1. GET - Fetch active shop branding & contact settings
export const useGetShopSettings = () => {
  return useQuery({
    queryKey: ['shopSettings'],
    queryFn: async () => {
      try {
        const response = await API.get('/settings/shop');
        const data = response.data || {};
        return {
          ...DEFAULT_SHOP_SETTINGS,
          ...data,
          logoUrl: data.logoUrl || defaultLogo
        };
      } catch (err) {
        console.warn('Failed to load shop settings from backend, using defaults:', err.message);
        return DEFAULT_SHOP_SETTINGS;
      }
    },
    staleTime: 1000 * 60 * 5 // 5 minutes cache
  });
};

// 2. UPDATE - Update shop settings & logo (Admin only)
export const useUpdateShopSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formDataOrJson) => {
      const isFormData = formDataOrJson instanceof FormData;
      const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
      const response = await API.put('/settings/shop', formDataOrJson, config);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Shop settings & branding updated successfully!');
      queryClient.setQueryData(['shopSettings'], (old) => ({
        ...old,
        ...data,
        logoUrl: data.logoUrl || defaultLogo
      }));
      queryClient.invalidateQueries({ queryKey: ['shopSettings'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update shop settings');
    }
  });
};
