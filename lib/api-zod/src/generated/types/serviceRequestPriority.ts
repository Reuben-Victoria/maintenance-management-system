
export type ServiceRequestPriority = typeof ServiceRequestPriority[keyof typeof ServiceRequestPriority];


export const ServiceRequestPriority = {
  low: 'low',
  medium: 'medium',
  high: 'high',
  urgent: 'urgent',
} as const;
