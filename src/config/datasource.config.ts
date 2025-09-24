import { Admin } from "../models/admin.model.js";
import { Counselor } from "../models/counselor.model.js";
import { StudentRefreshToken } from "../models/studentRefreshToken.model.js";
import { Student } from "../models/student.model.js";
import { env } from "./env.config.js";
import { DataSource } from "typeorm";

/**
 * Data source configuration for TypeORM.
 *
 * This module exports the configuration object required to establish a connection
 * to the MySQL database using TypeORM. It utilizes environment variables defined
 * in `env.config.ts` for database connection parameters.
 *
 * @file datasource.config.ts
 * @description Configuration for TypeORM data source.
 * 
 * Usage:
 * - Imported in `app.ts` to initialize the database connection.
 *
 * @author Arthur M. Artugue
 * @created 2025-08-27
 * @updated 2025-08-27
 */
export const AppDataSource = new DataSource({
  type: "postgres",
  host: env.DB_HOST,
  port: env.DB_PORT,
  username: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  entities: [ Student, Counselor, Admin, StudentRefreshToken],
  synchronize: true,  
})