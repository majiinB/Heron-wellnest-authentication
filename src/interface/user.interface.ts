/**
 * @file user.interface.ts
 * 
 * @description Interface for User model in the Heron Wellnest Authentication API.
 * 
 * @author Arthur M. Artugue
 * @created 2025-08-27
 * @updated 2025-08-27
 */

export interface IUser {
  user_id: string;
  user_name: string;
  email: string;
  is_deleted: boolean;
  created_at: Date;
  updated_at: Date;
}

