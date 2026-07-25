export type ActivityItemType = typeof ActivityItemType[keyof typeof ActivityItemType];


export const ActivityItemType = {
  status_change: 'status_change',
  assignment: 'assignment',
  new_request: 'new_request',
} as const;
