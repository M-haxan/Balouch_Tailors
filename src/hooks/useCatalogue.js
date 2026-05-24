import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import API from '../api/axios';

// 1. GET: Saara Catalogue Fetch Karne Ke Liye
export const useGetCatalogue = () => {
  return useQuery({
    queryKey: ['catalogue'], // Is key se TanStack is data ko pehchanta hai
    queryFn: async () => {
      const response = await API.get('/catalogue');
      return response.data;
    },
  });
};

// 2. POST: Naya Design Add Karne Ke Liye (FormData ke sath)
export const useAddCatalogue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // Variables mein woh form data aayega jo component se bhejenge
    mutationFn: async (formData) => {
      // Configuration lazmi hai kyunke image ja rahi hai
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      const response = await API.post('/catalogue', formData, config);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Design added successfully!');
      // Yeh line TanStack ko batati hai ke purana data ghalat ho gaya hai, naya fetch karo (Auto-refresh)
      queryClient.invalidateQueries({ queryKey: ['catalogue'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add design');
    },
  });
};

// 3. DELETE: Design Delete Karne Ke Liye
export const useDeleteCatalogue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await API.delete(`/catalogue/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Design deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['catalogue'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete design');
    },
  });
};
// 4. UPDATE: Purana Design Edit Karne Ke Liye
export const useUpdateCatalogue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    // Isme id aur formData dono bhejenge
    mutationFn: async ({ id, formData }) => {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      const response = await API.put(`/catalogue/${id}`, formData, config);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Design updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['catalogue'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update design');
    },
  });
};