import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import API from '../api/axios';
import { toast } from 'react-toastify';

// 1. Get All Orders (Dashboard ke liye - Supports server-side pagination, search, and status filter)
export const useGetOrders = (params = {}, options = {}) => {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: async () => {
      const response = await API.get('/orders', { params });
      return response.data;
    },
    ...options
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

// 2.1 Get Single Order by ID (For Edit / View)
export const useGetOrderById = (id, options = {}) => {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const response = await API.get(`/orders/${id}`);
      return response.data;
    },
    enabled: !!id && options.enabled !== false,
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
      queryClient.invalidateQueries({ queryKey: ['order'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update order.');
    }
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, orderStatus }) => {
      const response = await API.put(`/orders/${id}/status`, { orderStatus });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(`Order status updated to "${data?.orderStatus}"`);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update order status.');
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

// 6. Deliver Order (Mark delivered & settle payment / update khata)
export const useDeliverOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await API.put(`/orders/${id}/deliver`, data);
      return response.data;
    },
    onSuccess: (res) => {
      toast.success(res.message || 'Order delivered successfully!');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customerProfile'] });
      queryClient.invalidateQueries({ queryKey: ['customerLedger'] });
      queryClient.invalidateQueries({ queryKey: ['customerKhata'] });
      queryClient.invalidateQueries({ queryKey: ['customer-dues'] });
      queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to deliver order.');
    }
  });
};

// 7. Add Payment to open order
export const useAddOrderPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await API.post(`/orders/${id}/payments`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Payment added successfully!');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
      queryClient.invalidateQueries({ queryKey: ['orderPayments'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customerProfile'] });
      queryClient.invalidateQueries({ queryKey: ['customerLedger'] });
      queryClient.invalidateQueries({ queryKey: ['customer-dues'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add payment.');
    }
  });
};

// 8. Get Order Payments
export const useOrderPayments = (orderId) => {
  return useQuery({
    queryKey: ['orderPayments', orderId],
    queryFn: async () => {
      if (!orderId) return [];
      const response = await API.get(`/orders/${orderId}/payments`);
      return response.data;
    },
    enabled: Boolean(orderId)
  });
};

// 9. Cancel Order (Admin only)
export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await API.put(`/orders/${id}/cancel`, data);
      return response.data;
    },
    onSuccess: (res) => {
      toast.success(res.message || 'Order cancelled successfully!');
      if (res.warnings && res.warnings.length > 0) {
        res.warnings.forEach(w => toast.warn(w));
      }
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
      queryClient.invalidateQueries({ queryKey: ['orderPayments'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customerProfile'] });
      queryClient.invalidateQueries({ queryKey: ['customerLedger'] });
      queryClient.invalidateQueries({ queryKey: ['customer-dues'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to cancel order.');
    }
  });
};

// 10. Refund on Cancelled Order (Admin only)
export const useRefundOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await API.post(`/orders/${id}/refund`, data);
      return response.data;
    },
    onSuccess: (res) => {
      toast.success(res.message || 'Refund processed successfully!');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
      queryClient.invalidateQueries({ queryKey: ['orderPayments'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customerProfile'] });
      queryClient.invalidateQueries({ queryKey: ['customerLedger'] });
      queryClient.invalidateQueries({ queryKey: ['customer-dues'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to process refund.');
    }
  });
};

// 11. Void Payment (Admin only)
export const useVoidPayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await API.post(`/payments/${id}/void`, data);
      return response.data;
    },
    onSuccess: (res) => {
      toast.success(res.message || 'Payment voided successfully!');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order'] });
      queryClient.invalidateQueries({ queryKey: ['orderPayments'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customerProfile'] });
      queryClient.invalidateQueries({ queryKey: ['customerLedger'] });
      queryClient.invalidateQueries({ queryKey: ['customer-dues'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to void payment.');
    }
  });
};