
export type RegisterInputRole = typeof RegisterInputRole[keyof typeof RegisterInputRole];


export const RegisterInputRole = {
  student: 'student',
  staff: 'staff',
  maintenance_officer: 'maintenance_officer',
  admin: 'admin',
} as const;
