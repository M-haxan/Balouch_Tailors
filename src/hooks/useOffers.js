import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import API from '../api/axios';

// 1. GET: Fetch all offers/services
export const useGetOffers = () => {
  return useQuery({
    queryKey: ['offers'],
    queryFn: async () => {
      const response = await API.get('/offers');
      return response.data;
    },
  });
};

// 2. POST: Add new offer (FormData with image)
export const useAddOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData) => {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      const response = await API.post('/offers', formData, config);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Service offer added successfully!');
      queryClient.invalidateQueries({ queryKey: ['offers'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add service offer');
    },
  });
};

// 3. PUT: Update existing offer (FormData or JSON)
export const useUpdateOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, formData }) => {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      const response = await API.put(`/offers/${id}`, formData, config);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Service offer updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['offers'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update service offer');
    },
  });
};

// 4. DELETE: Delete offer
export const useDeleteOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await API.delete(`/offers/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Service offer deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['offers'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete service offer');
    },
  });
};
