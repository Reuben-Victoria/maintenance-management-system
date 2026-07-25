import type { DashboardSummaryByCategoryItem } from './dashboardSummaryByCategoryItem';
import type { DashboardSummaryByPriorityItem } from './dashboardSummaryByPriorityItem';

export interface DashboardSummary {
  total: number;
  pending: number;
  assigned: number;
  inProgress: number;
  completed: number;
  rejected: number;
  /** @nullable */
  myRequests?: number | null;
  byCategory: DashboardSummaryByCategoryItem[];
  byPriority: DashboardSummaryByPriorityItem[];
}
