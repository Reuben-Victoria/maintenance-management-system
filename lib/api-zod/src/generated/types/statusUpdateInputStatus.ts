
export type StatusUpdateInputStatus = typeof StatusUpdateInputStatus[keyof typeof StatusUpdateInputStatus];


export const StatusUpdateInputStatus = {
  pending: 'pending',
  assigned: 'assigned',
  in_progress: 'in_progress',
  completed: 'completed',
  rejected: 'rejected',
} as const;
