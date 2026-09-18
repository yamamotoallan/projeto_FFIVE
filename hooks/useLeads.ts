
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../src/services/api';

export const useLeads = () => {
    const queryClient = useQueryClient();

    const { data: leads = [], isLoading, error, refetch } = useQuery({
        queryKey: ['leads'],
        queryFn: api.leads.list,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const createLeadMutation = useMutation({
        mutationFn: api.leads.create,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
        },
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => api.leads.updateStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leads'] });
        },
    });

    return {
        leads,
        isLoading,
        error,
        createLead: createLeadMutation.mutate,
        updateStatus: updateStatusMutation.mutateAsync,
        refetch
    };
};
