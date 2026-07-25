export interface Category {
  id: number;
  name: string;
  /** @nullable */
  description?: string | null;
  createdAt: Date;
}
