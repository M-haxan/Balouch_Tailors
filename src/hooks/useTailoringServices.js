import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import API from '../api/axios';

// 1. Get Tailoring Services & Customizations
export const useGetTailoringServices = () => {
  return useQuery({
    queryKey: ['tailoring-services'],
    queryFn: async () => {
      const response = await API.get('/tailoring-services');
      return response.data;
    },
  });
};

// 2. Add New Tailoring Service or Customization
export const useAddTailoringService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newData) => {
      const response = await API.post('/tailoring-services', newData);
      return response.data;
    },
    onSuccess: (data) => {
      const typeLabel = data?.itemType === 'customization' ? 'Customization' : 'Garment category';
      toast.success(`${typeLabel} added successfully!`);
      queryClient.invalidateQueries({ queryKey: ['tailoring-services'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add service item');
    },
  });
};

// 3. Update Existing Tailoring Service or Customization
export const useUpdateTailoringService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updatedData }) => {
      const response = await API.put(`/tailoring-services/${id}`, updatedData);
      return response.data;
    },
    onSuccess: (data) => {
      const typeLabel = data?.itemType === 'customization' ? 'Customization' : 'Garment category';
      toast.success(`${typeLabel} updated successfully!`);
      queryClient.invalidateQueries({ queryKey: ['tailoring-services'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update service item');
    },
  });
};

// 4. Delete Tailoring Service or Customization
export const useDeleteTailoringService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const response = await API.delete(`/tailoring-services/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Item deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['tailoring-services'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete item');
    },
  });
};
