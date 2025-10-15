// scripts/reset-db.ts
import "reflect-metadata";
import { AppDataSource } from "../src/config/datasource.config.js";

(async () => {
  try {
    console.log("Initializing data source...");
    await AppDataSource.initialize();

    console.log("Dropping database...");
    await AppDataSource.dropDatabase();

    console.log("Synchronizing schema...");
    await AppDataSource.synchronize();

    console.log("Database reset complete!");
  } catch (err) {
    console.error("Error resetting database:", err);
  } finally {
    await AppDataSource.destroy();
  }
})();
