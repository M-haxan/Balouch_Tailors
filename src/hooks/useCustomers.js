import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import API from '../api/axios';
import { toast } from 'react-toastify';

// 1. Get All Customers
export const useGetCustomers = () => {
  return useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const response = await API.get('/customer');
      return response.data;
    }
  });
};

// 2. Add New Customer (with initial measurements)
export const useAddCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data) => {
      const response = await API.post('/customer', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Customer added successfully!');
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add customer.');
    }
  });
};

// 3. Update Basic Info (Name, Phone, Address)
export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await API.put(`/customer/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Customer profile updated!');
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update customer.');
    }
  });
};

// 4. Update or Add Measurements (The core logic)
export const useUpdateMeasurements = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }) => {
      // API Doc ke mutabiq yeh complete array replace karega
      const response = await API.put(`/customer/${id}/measurements`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Measurements updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to save measurements.');
    }
  });
};

// 5. Delete Customer
export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      const response = await API.delete(`/customer/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Customer deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['customers'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete customer.');
    }
  });
};