import request from "supertest";
import app from "../app.js";
import { AppDataSource } from "../config/datasource.config.js";
import { DataSource } from "typeorm";

/**
 * Authentication API Tests
 * This file contains tests for the authentication API endpoints.
 * It uses Supertest to make requests to the Express app and checks the responses.
 * @file auth.test.ts
 * @description Tests for authentication routes.
 * 
 * Usage:
 * - Run with `npm test` or `jest`.
 * - Tests cover login and health check endpoints.
 * 
 * @author Arthur M. Artugue
 * @created 2025-08-19
 * @updated 2025-08-19
 */

describe("Health Check", () => {
  it("should return status ok", async () => {
    const res = await request(app).get("/api/v1/auth/health")
    .set("origin", "https://production-domain.com");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ status: "ok" });
  });
});

let testDataSource: DataSource;

beforeAll(async () => {
  testDataSource = AppDataSource
  await testDataSource.initialize();
});

afterAll(async () => {
  if (testDataSource.isInitialized) {
    await testDataSource.destroy();
  }
});

describe("Database / DataSource", () => {
  it("should initialize the data source successfully", () => {
    expect(testDataSource.isInitialized).toBe(true);
  });

  it("should fail to initialize with wrong config", async () => {
    const fakeDataSource = new DataSource({
      type: "mysql",
      host: "invalid-host",
      port: 1234,
      username: "wrong-user",
      password: "wrong-pass",
      database: "nonexistent-db",
    });

    await expect(fakeDataSource.initialize()).rejects.toThrow();
  });
});

