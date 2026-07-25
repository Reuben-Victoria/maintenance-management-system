
export type ServiceRequestStatus = typeof ServiceRequestStatus[keyof typeof ServiceRequestStatus];


export const ServiceRequestStatus = {
  pending: 'pending',
  assigned: 'assigned',
  in_progress: 'in_progress',
  completed: 'completed',
  rejected: 'rejected',
} as const;
