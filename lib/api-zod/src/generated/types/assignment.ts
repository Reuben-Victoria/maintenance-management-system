export interface Assignment {
  id: number;
  requestId: number;
  officerId: number;
  /** @nullable */
  officerName?: string | null;
  assignedBy: number;
  /** @nullable */
  assignedByName?: string | null;
  /** @nullable */
  notes?: string | null;
  assignedAt: Date;
}
