import type { StatusLogNewStatus } from './statusLogNewStatus';

export interface StatusLog {
  id: number;
  requestId: number;
  changedBy: number;
  /** @nullable */
  changedByName?: string | null;
  /** @nullable */
  oldStatus?: string | null;
  newStatus: StatusLogNewStatus;
  /** @nullable */
  note?: string | null;
  createdAt: Date;
}
