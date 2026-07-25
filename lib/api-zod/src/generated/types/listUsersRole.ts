export type ListUsersRole = typeof ListUsersRole[keyof typeof ListUsersRole];


export const ListUsersRole = {
  student: 'student',
  staff: 'staff',
  maintenance_officer: 'maintenance_officer',
  admin: 'admin',
} as const;
