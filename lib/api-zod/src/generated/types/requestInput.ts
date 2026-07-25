import type { RequestInputPriority } from './requestInputPriority';

export interface RequestInput {
  /** @minLength 5 */
  title: string;
  /** @minLength 10 */
  description: string;
  categoryId?: number;
  priority: RequestInputPriority;
  location?: string;
  evidenceUrl?: string;
}
