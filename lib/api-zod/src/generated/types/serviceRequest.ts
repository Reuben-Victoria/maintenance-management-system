import type { ServiceRequestPriority } from './serviceRequestPriority';
import type { ServiceRequestStatus } from './serviceRequestStatus';

export interface ServiceRequest {
  id: number;
  title: string;
  description: string;
  /** @nullable */
  categoryId?: number | null;
  /** @nullable */
  categoryName?: string | null;
  status: ServiceRequestStatus;
  priority: ServiceRequestPriority;
  /** @nullable */
  location?: string | null;
  /** @nullable */
  evidenceUrl?: string | null;
  submittedBy: number;
  /** @nullable */
  submitterName?: string | null;
  /** @nullable */
  assignedTo?: number | null;
  /** @nullable */
  officerName?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
