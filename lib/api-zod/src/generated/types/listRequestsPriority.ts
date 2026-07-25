export type ListRequestsPriority = typeof ListRequestsPriority[keyof typeof ListRequestsPriority];


export const ListRequestsPriority = {
  low: 'low',
  medium: 'medium',
  high: 'high',
  urgent: 'urgent',
} as const;
