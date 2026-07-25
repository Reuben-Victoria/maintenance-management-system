
export type RequestUpdatePriority = typeof RequestUpdatePriority[keyof typeof RequestUpdatePriority];


export const RequestUpdatePriority = {
  low: 'low',
  medium: 'medium',
  high: 'high',
  urgent: 'urgent',
} as const;
