
export type StatusLogNewStatus = typeof StatusLogNewStatus[keyof typeof StatusLogNewStatus];


export const StatusLogNewStatus = {
  pending: 'pending',
  assigned: 'assigned',
  in_progress: 'in_progress',
  completed: 'completed',
  rejected: 'rejected',
} as const;
