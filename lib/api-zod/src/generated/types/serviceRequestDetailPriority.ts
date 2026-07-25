
export type ServiceRequestDetailPriority = typeof ServiceRequestDetailPriority[keyof typeof ServiceRequestDetailPriority];


export const ServiceRequestDetailPriority = {
  low: 'low',
  medium: 'medium',
  high: 'high',
  urgent: 'urgent',
} as const;
