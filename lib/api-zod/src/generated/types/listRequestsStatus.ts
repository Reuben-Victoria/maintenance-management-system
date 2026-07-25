export type ListRequestsStatus = typeof ListRequestsStatus[keyof typeof ListRequestsStatus];


export const ListRequestsStatus = {
  pending: 'pending',
  assigned: 'assigned',
  in_progress: 'in_progress',
  completed: 'completed',
  rejected: 'rejected',
} as const;
