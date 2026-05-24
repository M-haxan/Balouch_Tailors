import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import API from '../api/axios'; // Hamara global axios instance

// Get Pricing Data
export const useGetPricing = () => {
  return useQuery({
    queryKey: ['pricing'],
    queryFn: async () => {
      const response = await API.get('/pricing');
      return response.data;
    },
  });
};

// Add New Pricing
export const useAddPricing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newPricingData) => {
      const response = await API.post('/pricing', newPricingData);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Pricing added successfully!');
      queryClient.invalidateQueries({ queryKey: ['pricing'] }); // Auto-refresh
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add pricing');
    },
  });
};

// Update Existing Pricing
export const useUpdatePricing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updatedData }) => {
      const response = await API.put(`/pricing/${id}`, updatedData);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Pricing updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['pricing'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update pricing');
    },
  });
};

// Delete Pricing
export const useDeletePricing = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await API.delete(`/pricing/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Pricing deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['pricing'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete pricing');
    },
  });
};