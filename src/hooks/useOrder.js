import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import API from '../api/axios';
import { toast } from 'react-toastify';

// 1. Get All Orders (Dashboard ke liye)
export const useGetOrders = () => {
  return useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const response = await API.get('/orders');
      return response.data;
    }
  });
};

// 2. Get Customer Specific Orders (History dekhne ke liye)
export const useGetCustomerOrders = (customerId) => {
  return useQuery({
    queryKey: ['orders', customerId],
    queryFn: async () => {
      const response = await API.get(`/orders/customer/${customerId}`);
      return response.data;
    },
    enabled: !!customerId, // Jab tak ID na ho, API call na jaye
  });
};

// 3. Create New Order (Naya Khata)
export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (orderData) => {
      const response = await API.post('/orders', orderData);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Order created successfully!');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create order.');
    }
  });
};

// 4. Update Order (Status change karne ya details update karne ke liye)
export const useUpdateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await API.put(`/orders/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Order updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update order.');
    }
  });
};

// 5. Delete Order
export const useDeleteOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      const response = await API.delete(`/orders/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Order deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete order.');
    }
  });
};