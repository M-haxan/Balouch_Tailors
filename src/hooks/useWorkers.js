import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import API from '../api/axios';
import { toast } from 'react-toastify';

// 1. Get All Workers
export const useGetWorkers = () => {
  return useQuery({
    queryKey: ['workers'],
    queryFn: async () => {
      const response = await API.get('/workers');
      return response.data;
    }
  });
};

// 2. Add New Worker
export const useAddWorker = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data) => {
      const response = await API.post('/workers', data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Worker added successfully!');
      queryClient.invalidateQueries({ queryKey: ['workers'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add worker.');
    }
  });
};

// 3. Update Worker Profile
export const useUpdateWorker = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await API.put(`/workers/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Worker profile updated!');
      queryClient.invalidateQueries({ queryKey: ['workers'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update worker.');
    }
  });
};

// 4. Delete Worker
export const useDeleteWorker = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      const response = await API.delete(`/workers/${id}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Worker profile deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['workers'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete worker.');
    }
  });
};

// 5. Admin Assign Suit to Worker
export const useAssignWorker = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orderId, suitId, workerId }) => {
      const response = await API.put(`/workers/suits/${orderId}/${suitId}/assign`, { workerId });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Suit assigned successfully!');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to assign suit.');
    }
  });
};

// 6. Get Worker Dashboard Stats
export const useGetWorkerDashboard = () => {
  return useQuery({
    queryKey: ['workerDashboard'],
    queryFn: async () => {
      const response = await API.get('/workers/dashboard');
      return response.data;
    }
  });
};

// 7. Worker: Submit Suit for QC Inspection
export const useSubmitSuitForInspection = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orderId, suitId }) => {
      const response = await API.put(`/workers/suits/${orderId}/${suitId}/submit`);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || 'Suit submitted for admin inspection!');
      queryClient.invalidateQueries({ queryKey: ['workerDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to submit suit for inspection.');
    }
  });
};

// 7.1 Admin: Approve Suit & Credit Wage
export const useApproveSuit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orderId, suitId }) => {
      const response = await API.put(`/workers/suits/${orderId}/${suitId}/approve`);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data?.message || 'Suit QC Approved & Wage Credited!');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['workerDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['financialSummary'] });
      queryClient.invalidateQueries({ queryKey: ['workers'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to approve suit.');
    }
  });
};

// 7.2 Admin: Reject Suit / Request Rework
export const useRejectSuit = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orderId, suitId, reworkNotes }) => {
      const response = await API.put(`/workers/suits/${orderId}/${suitId}/reject`, { reworkNotes });
      return response.data;
    },
    onSuccess: (data) => {
      toast.info(data?.message || 'Suit sent for rework.');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['workerDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['financialSummary'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to reject suit.');
    }
  });
};

// 7.3 Admin: Assign Stage (Cutting, Stitching, Finishing, Self/Worker)
export const useAssignSuitStage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orderId, suitId, data }) => {
      const response = await API.put(`/workers/suits/${orderId}/${suitId}/assign-stage`, data);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Suit stage assigned successfully!');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['financialSummary'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to assign stage.');
    }
  });
};

// 7.4 Admin: Get Shop Financial & Labor Summary
export const useGetFinancialSummary = () => {
  return useQuery({
    queryKey: ['financialSummary'],
    queryFn: async () => {
      const response = await API.get('/workers/analytics/financial-summary');
      return response.data;
    }
  });
};

// 7.5 Worker: Mark Suit as Stitched (Legacy compatibility)
export const useMarkSuitStitched = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ orderId, suitId }) => {
      const response = await API.put(`/workers/suits/${orderId}/${suitId}/stitch`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Suit updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['workerDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['financialSummary'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update suit status.');
    }
  });
};

// 8. Get Worker Ledger
export const useGetWorkerLedger = (workerId) => {
  return useQuery({
    queryKey: ['workerLedger', workerId],
    queryFn: async () => {
      const response = await API.get(`/workers/${workerId}/ledger`);
      return response.data;
    },
    enabled: Boolean(workerId)
  });
};

// 9. Add Worker Advance Transaction
export const useAddWorkerAdvance = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await API.post(`/workers/${id}/advance`, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      toast.success('Advance payment logged successfully!');
      queryClient.invalidateQueries({ queryKey: ['workers'] });
      queryClient.invalidateQueries({ queryKey: ['workerLedger', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['workerDashboard'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to record advance.');
    }
  });
};

// 10. Dry-run Calculate Salary
export const useCalculateSalary = () => {
  return useMutation({
    mutationFn: async ({ id, startDate, endDate }) => {
      const response = await API.get(`/workers/${id}/calculate-salary`, {
        params: { startDate, endDate }
      });
      return response.data;
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to calculate salary.');
    }
  });
};

// 11. Process Salary Payment (Settle)
export const usePaySalary = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }) => {
      const response = await API.post(`/workers/${id}/pay-salary`, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      toast.success('Salary payment processed and archived successfully!');
      queryClient.invalidateQueries({ queryKey: ['workers'] });
      queryClient.invalidateQueries({ queryKey: ['workerLedger', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['workerPayments', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['workerDashboard'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to process payment.');
    }
  });
};

// 12. Get Worker Payments History
export const useGetWorkerPayments = (workerId) => {
  return useQuery({
    queryKey: ['workerPayments', workerId],
    queryFn: async () => {
      const response = await API.get(`/workers/${workerId}/payments`);
      return response.data;
    },
    enabled: Boolean(workerId)
  });
};

// 13. Get Worker Details (Admin perspective)
export const useGetWorkerDetails = (workerId) => {
  return useQuery({
    queryKey: ['workerDetails', workerId],
    queryFn: async () => {
      const response = await API.get(`/workers/${workerId}/details`);
      return response.data;
    },
    enabled: Boolean(workerId)
  });
};

// 14. Update Ledger Entry (Admin only)
export const useUpdateLedgerEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ ledgerId, data }) => {
      const response = await API.put(`/workers/ledger/${ledgerId}`, data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      toast.success('Ledger entry updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['workers'] });
      queryClient.invalidateQueries({ queryKey: ['workerLedger'] });
      queryClient.invalidateQueries({ queryKey: ['workerDetails'] });
      queryClient.invalidateQueries({ queryKey: ['workerDashboard'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update ledger entry.');
    }
  });
};

// 15. Delete Ledger Entry (Admin only)
export const useDeleteLedgerEntry = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (ledgerId) => {
      const response = await API.delete(`/workers/ledger/${ledgerId}`);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Ledger entry deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['workers'] });
      queryClient.invalidateQueries({ queryKey: ['workerLedger'] });
      queryClient.invalidateQueries({ queryKey: ['workerDetails'] });
      queryClient.invalidateQueries({ queryKey: ['workerDashboard'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete ledger entry.');
    }
  });
};
