
export type ServiceRequestDetailStatus = typeof ServiceRequestDetailStatus[keyof typeof ServiceRequestDetailStatus];


export const ServiceRequestDetailStatus = {
  pending: 'pending',
  assigned: 'assigned',
  in_progress: 'in_progress',
  completed: 'completed',
  rejected: 'rejected',
} as const;
