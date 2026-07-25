import type { ListRequestsPriority } from './listRequestsPriority';
import type { ListRequestsStatus } from './listRequestsStatus';

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
