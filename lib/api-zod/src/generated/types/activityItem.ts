import type { ActivityItemType } from './activityItemType';

export interface ActivityItem {
  id: number;
  type: ActivityItemType;
  requestId: number;
  requestTitle: string;
  actorName: string;
  description: string;
  createdAt: Date;
}
