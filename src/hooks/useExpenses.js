import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import API from '../api/axios';
import { toast } from 'react-toastify';

// 1. Get All Suppliers (Supports server-side pagination & search)
export const useGetSuppliers = (params = {}) => {
  return useQuery({
    queryKey: ['suppliers', params],
    queryFn: async () => {
      const res = await API.get('/expenses/suppliers', { params });
      return res.data;
    }
  });
};

// 2. Add Supplier
export const useAddSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await API.post('/expenses/suppliers', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Supplier registered successfully!');
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['financialSummary'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to add supplier');
    }
  });
};

// 3. Get Single Supplier Ledger (Supports server-side pagination)
export const useGetSupplierLedger = (supplierId, params = {}) => {
  return useQuery({
    queryKey: ['supplierLedger', supplierId, params],
    queryFn: async () => {
      if (!supplierId) return null;
      const res = await API.get(`/expenses/suppliers/${supplierId}/ledger`, { params });
      return res.data;
    },
    enabled: !!supplierId
  });
};

// 4. Add Purchase from Supplier (Maal Khareeda)
export const useAddSupplierPurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await API.post(`/expenses/suppliers/${id}/purchase`, data);
      return res.data;
    },
    onSuccess: (_, vars) => {
      toast.success('Material purchase logged to ledger and shop expense!');
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['supplierLedger', vars.id] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['financialSummary'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to record purchase');
    }
  });
};

// 5. Settle / Pay Supplier
export const useSettleSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const res = await API.post(`/expenses/suppliers/${id}/pay`, data);
      return res.data;
    },
    onSuccess: (_, vars) => {
      toast.success('Payment settlement recorded successfully!');
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['supplierLedger', vars.id] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['financialSummary'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to settle payment');
    }
  });
};

// 6. Delete Supplier
export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await API.delete(`/expenses/suppliers/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Supplier removed successfully');
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['financialSummary'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete supplier');
    }
  });
};

// 7. Get All Direct Expenses (Supports server-side pagination & search)
export const useGetExpenses = (params = {}) => {
  return useQuery({
    queryKey: ['expenses', params],
    queryFn: async () => {
      const res = await API.get('/expenses', { params });
      return res.data;
    }
  });
};

// 8. Add Direct Expense
export const useAddDirectExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await API.post('/expenses/direct', data);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Shop expense logged successfully!');
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['financialSummary'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to log expense');
    }
  });
};

// 9. Delete Direct Expense
export const useDeleteExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const res = await API.delete(`/expenses/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Expense record deleted');
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['financialSummary'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete expense');
    }
  });
};
