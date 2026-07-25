export interface HealthStatus {
  status: string;
}

export interface ErrorResponse {
  error: string;
}

export interface MessageResponse {
  message: string;
}

export type RegisterInputRole = typeof RegisterInputRole[keyof typeof RegisterInputRole];


export const RegisterInputRole = {
  student: 'student',
  staff: 'staff',
  maintenance_officer: 'maintenance_officer',
  admin: 'admin',
} as const;

export interface RegisterInput {
  /** @minLength 2 */
  name: string;
  email: string;
  /** @minLength 6 */
  password: string;
  role: RegisterInputRole;
  department?: string;
  phone?: string;
  staffId?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export type UserRole = typeof UserRole[keyof typeof UserRole];


export const UserRole = {
  student: 'student',
  staff: 'staff',
  maintenance_officer: 'maintenance_officer',
  admin: 'admin',
} as const;

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  /** @nullable */
  department?: string | null;
  /** @nullable */
  phone?: string | null;
  /** @nullable */
  staffId?: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export type UserUpdateRole = typeof UserUpdateRole[keyof typeof UserUpdateRole];


export const UserUpdateRole = {
  student: 'student',
  staff: 'staff',
  maintenance_officer: 'maintenance_officer',
  admin: 'admin',
} as const;

export interface UserUpdate {
  name?: string;
  department?: string;
  phone?: string;
  isActive?: boolean;
  role?: UserUpdateRole;
}

export interface UserList {
  data: User[];
  total: number;
  page: number;
  limit: number;
}

export interface Category {
  id: number;
  name: string;
  /** @nullable */
  description?: string | null;
  createdAt: string;
}

export interface CategoryInput {
  /** @minLength 2 */
  name: string;
  description?: string;
}

export type ServiceRequestStatus = typeof ServiceRequestStatus[keyof typeof ServiceRequestStatus];


export const ServiceRequestStatus = {
  pending: 'pending',
  assigned: 'assigned',
  in_progress: 'in_progress',
  completed: 'completed',
  rejected: 'rejected',
} as const;

export type ServiceRequestPriority = typeof ServiceRequestPriority[keyof typeof ServiceRequestPriority];


export const ServiceRequestPriority = {
  low: 'low',
  medium: 'medium',
  high: 'high',
  urgent: 'urgent',
} as const;

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
  createdAt: string;
  updatedAt: string;
}

export type ServiceRequestDetailStatus = typeof ServiceRequestDetailStatus[keyof typeof ServiceRequestDetailStatus];


export const ServiceRequestDetailStatus = {
  pending: 'pending',
  assigned: 'assigned',
  in_progress: 'in_progress',
  completed: 'completed',
  rejected: 'rejected',
} as const;

export type ServiceRequestDetailPriority = typeof ServiceRequestDetailPriority[keyof typeof ServiceRequestDetailPriority];


export const ServiceRequestDetailPriority = {
  low: 'low',
  medium: 'medium',
  high: 'high',
  urgent: 'urgent',
} as const;

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
  assignedAt: string;
}

export type StatusLogNewStatus = typeof StatusLogNewStatus[keyof typeof StatusLogNewStatus];


export const StatusLogNewStatus = {
  pending: 'pending',
  assigned: 'assigned',
  in_progress: 'in_progress',
  completed: 'completed',
  rejected: 'rejected',
} as const;

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
  createdAt: string;
}

export interface ServiceRequestDetail {
  id: number;
  title: string;
  description: string;
  /** @nullable */
  categoryId?: number | null;
  /** @nullable */
  categoryName?: string | null;
  status: ServiceRequestDetailStatus;
  priority: ServiceRequestDetailPriority;
  /** @nullable */
  location?: string | null;
  /** @nullable */
  evidenceUrl?: string | null;
  submittedBy: number;
  /** @nullable */
  submitterName?: string | null;
  /** @nullable */
  submitterEmail?: string | null;
  /** @nullable */
  assignedTo?: number | null;
  /** @nullable */
  officerName?: string | null;
  assignment?: Assignment | null;
  logs: StatusLog[];
  createdAt: string;
  updatedAt: string;
}

export type RequestInputPriority = typeof RequestInputPriority[keyof typeof RequestInputPriority];


export const RequestInputPriority = {
  low: 'low',
  medium: 'medium',
  high: 'high',
  urgent: 'urgent',
} as const;

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

export type RequestUpdatePriority = typeof RequestUpdatePriority[keyof typeof RequestUpdatePriority];


export const RequestUpdatePriority = {
  low: 'low',
  medium: 'medium',
  high: 'high',
  urgent: 'urgent',
} as const;

export interface RequestUpdate {
  title?: string;
  description?: string;
  categoryId?: number;
  priority?: RequestUpdatePriority;
  location?: string;
  evidenceUrl?: string;
}

export interface RequestList {
  data: ServiceRequest[];
  total: number;
  page: number;
  limit: number;
}

export interface AssignmentInput {
  officerId: number;
  notes?: string;
}

export type StatusUpdateInputStatus = typeof StatusUpdateInputStatus[keyof typeof StatusUpdateInputStatus];


export const StatusUpdateInputStatus = {
  pending: 'pending',
  assigned: 'assigned',
  in_progress: 'in_progress',
  completed: 'completed',
  rejected: 'rejected',
} as const;

export interface StatusUpdateInput {
  status: StatusUpdateInputStatus;
  note?: string;
}

export type DashboardSummaryByCategoryItem = {
  name: string;
  count: number;
};

export type DashboardSummaryByPriorityItem = {
  priority: string;
  count: number;
};

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

export type ActivityItemType = typeof ActivityItemType[keyof typeof ActivityItemType];


export const ActivityItemType = {
  status_change: 'status_change',
  assignment: 'assignment',
  new_request: 'new_request',
} as const;

export interface ActivityItem {
  id: number;
  type: ActivityItemType;
  requestId: number;
  requestTitle: string;
  actorName: string;
  description: string;
  createdAt: string;
}

export type ListUsersParams = {
role?: ListUsersRole;
search?: string;
page?: number;
limit?: number;
};

export type ListUsersRole = typeof ListUsersRole[keyof typeof ListUsersRole];


export const ListUsersRole = {
  student: 'student',
  staff: 'staff',
  maintenance_officer: 'maintenance_officer',
  admin: 'admin',
} as const;

export type ListRequestsParams = {
status?: ListRequestsStatus;
priority?: ListRequestsPriority;
categoryId?: number;
search?: string;
submittedBy?: number;
assignedTo?: number;
page?: number;
limit?: number;
};

export type ListRequestsStatus = typeof ListRequestsStatus[keyof typeof ListRequestsStatus];


export const ListRequestsStatus = {
  pending: 'pending',
  assigned: 'assigned',
  in_progress: 'in_progress',
  completed: 'completed',
  rejected: 'rejected',
} as const;

export type ListRequestsPriority = typeof ListRequestsPriority[keyof typeof ListRequestsPriority];


export const ListRequestsPriority = {
  low: 'low',
  medium: 'medium',
  high: 'high',
  urgent: 'urgent',
} as const;

export type GetRecentActivityParams = {
limit?: number;
};

export type ExportReportParams = {
status?: string;
from?: string;
to?: string;
};

