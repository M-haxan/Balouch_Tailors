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
      queryClient.invalidateQueries({ queryKey: ['customerProfile'] });
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
      queryClient.invalidateQueries({ queryKey: ['customerProfile'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to save measurements.');
    }
  });
};

// 4.1 Delete Measurement Category
export const useDeleteMeasurementCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, category }) => {
      const response = await API.delete(`/customer/${id}/measurements/${encodeURIComponent(category)}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Measurement category deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customerProfile'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete measurement category.');
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

// 6. Get Customer Khata Ledger Statement
export const useGetCustomerLedger = (customerId) => {
  return useQuery({
    queryKey: ['customerLedger', customerId],
    queryFn: async () => {
      if (!customerId) return null;
      const response = await API.get(`/customer/${customerId}/ledger`);
      return response.data;
    },
    enabled: Boolean(customerId)
  });
};

// 7. Settle Khata (Record Payment, Refund, Manual Adjustment)
export const useSettleCustomerKhata = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ customerId, data }) => {
      const response = await API.post(`/customer/${customerId}/settle`, data);
      return response.data;
    },
    onSuccess: (res) => {
      toast.success(res.message || 'Khata updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customerProfile'] });
      queryClient.invalidateQueries({ queryKey: ['customerLedger'] });
      queryClient.invalidateQueries({ queryKey: ['customerKhata'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to settle Khata.');
    }
  });
};

// 8. Quick Fetch Customer Khata Balance (by ID or Phone)
export const useGetCustomerKhata = (identifier) => {
  return useQuery({
    queryKey: ['customerKhata', identifier],
    queryFn: async () => {
      if (!identifier) return null;
      const response = await API.get(`/customer/khata/${identifier}`);
      return response.data;
    },
    enabled: Boolean(identifier)
  });
};

// 9. Comprehensive Customer Profile (Details, Metrics, Orders, Measurements History, Khata)
export const useGetCustomerProfile = (id) => {
  return useQuery({
    queryKey: ['customerProfile', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await API.get(`/customer/${id}/profile`);
      return response.data;
    },
    enabled: Boolean(id)
  });
};