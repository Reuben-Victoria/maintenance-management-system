
export type UserUpdateRole = typeof UserUpdateRole[keyof typeof UserUpdateRole];


export const UserUpdateRole = {
  student: 'student',
  staff: 'staff',
  maintenance_officer: 'maintenance_officer',
  admin: 'admin',
} as const;
