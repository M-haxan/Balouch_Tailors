import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import API from '../api/axios';
import { toast } from 'react-toastify';


//usegettemplates
export const useGetTemplates = () => {
  return useQuery({ 
    queryKey: ['template'],
    queryFn: async () => {
      const response = await API.get('/template');
      return response.data;
    }
  });
};

//addTemplates
export const useAddTemplates = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
        const response = await API.post('/template', data);
        return response.data;
    },
    onSuccess: () => {
      toast.success('Measurement Template added successfully!');    
        queryClient.invalidateQueries({ queryKey: ['template'] }); 
        
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add template.');
    }
    });
};
//Update Templates
export const useUpdateTemplates = () => {
  const queryClient = useQueryClient(); 
    return useMutation({
        mutationFn: async ({ id, data }) => {
            const response = await API.put(`/template/${id}`, data);
            return response.data;
        },
        onSuccess: () => {
          toast.success('Measurement Template updated successfully!');      
            queryClient.invalidateQueries({ queryKey: ['template'] }); 
        },
        onError: (error) => {
          toast.error(error.response?.data?.message || 'Failed to update template.');
        }
    });
};
//Delete Templates
export const useDeleteTemplates = () => {   
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id) => {
            const response = await API.delete(`/template/${id}`);
            return response.data;
        },
        onSuccess: () => {
          toast.success('Measurement Template deleted successfully!');
            queryClient.invalidateQueries({ queryKey: ['template'] });
        },
        onError: (error) => {
          toast.error(error.response?.data?.message || 'Failed to delete template.');
        }
    });
};
