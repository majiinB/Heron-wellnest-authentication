/**
 * @file user.interface.ts
 * 
 * @description Interface for User model in the Heron Wellnest Authentication API.
 * 
 * @author Arthur M. Artugue
 * @created 2025-08-27
 * @updated 2025-08-27
 */

export interface User {
  user_id: string;
  user_name: string;
  email: string;
  is_deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Role-specific interfaces extending the base User interface
export interface StudentUser extends User {
  role: "student";
  year_level: number;
  college_department: string;
}
export interface CounselorUser extends User {
  role: "counselor";
  college_department: string;
}
export interface AdminUser extends User {
  role: "admin";
}

