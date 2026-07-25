import type { ServiceRequest } from './serviceRequest';

export interface RequestList {
  data: ServiceRequest[];
  total: number;
  page: number;
  limit: number;
}
