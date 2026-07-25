
export type UserRole = typeof UserRole[keyof typeof UserRole];


export const UserRole = {
  student: 'student',
  staff: 'staff',
  maintenance_officer: 'maintenance_officer',
  admin: 'admin',
} as const;
