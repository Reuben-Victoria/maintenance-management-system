
export type RequestInputPriority = typeof RequestInputPriority[keyof typeof RequestInputPriority];


export const RequestInputPriority = {
  low: 'low',
  medium: 'medium',
  high: 'high',
  urgent: 'urgent',
} as const;
