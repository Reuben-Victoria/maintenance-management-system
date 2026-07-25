import type { RequestUpdatePriority } from './requestUpdatePriority';

export interface RequestUpdate {
  title?: string;
  description?: string;
  categoryId?: number;
  priority?: RequestUpdatePriority;
  location?: string;
  evidenceUrl?: string;
}
