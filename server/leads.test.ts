import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock db functions
vi.mock("./db", () => ({
  createLead: vi.fn().mockResolvedValue({ id: 42 }),
  updateLeadScore: vi.fn().mockResolvedValue(undefined),
  getLeadById: vi.fn().mockResolvedValue({ id: 42, email: "test@example.com", phone: "5551234567" }),
  getAllLeads: vi.fn().mockResolvedValue([
    {
      id: 1,
      email: "test@example.com",
      phone: "5551234567",
      address: "123 Main St",
      lat: "40.7128000",
      lng: "-74.0060000",
      opportunityScore: 8,
      recommendation: "GO",
      createdAt: new Date(),
    },
  ]),
  getDb: vi.fn(),
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
  createReport: vi.fn().mockResolvedValue({ id: 1 }),
  getReportById: vi.fn(),
  getReportByLeadId: vi.fn(),
}));

// Mock notification
vi.mock("./_core/notification", () => ({
  notifyOwner: vi.fn().mockResolvedValue(true),
}));

// Mock Google Sheets (not configured in test)
vi.mock("./google-sheets", () => ({
  appendLeadToSheet: vi.fn().mockResolvedValue(false),
  appendLeadScoreUpdate: vi.fn().mockResolvedValue(false),
  appendMetricToSheet: vi.fn().mockResolvedValue(false),
  isGoogleSheetsConfigured: vi.fn().mockReturnValue(false),
}));

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("lead.capture", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("captures a lead with valid email and phone", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.lead.capture({
      email: "owner@restaurant.com",
      phone: "5551234567",
      address: "123 Main St, New York, NY",
      lat: 40.7128,
      lng: -74.006,
    });

    expect(result).toHaveProperty("leadId");
    expect(result.leadId).toBe(42);
  });

  it("rejects invalid email", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.lead.capture({
        email: "not-an-email",
        phone: "5551234567",
      })
    ).rejects.toThrow();
  });

  it("rejects short phone number", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.lead.capture({
        email: "test@example.com",
        phone: "123",
      })
    ).rejects.toThrow();
  });
});

describe("lead.updateScore", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates lead score and sends notification for high scores", async () => {
    const { notifyOwner } = await import("./_core/notification");
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.lead.updateScore({
      leadId: 42,
      opportunityScore: 8,
      recommendation: "GO",
    });

    expect(result).toEqual({ success: true });
    expect(notifyOwner).toHaveBeenCalledTimes(1);
  });

  it("does not notify for low scores", async () => {
    const { notifyOwner } = await import("./_core/notification");
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.lead.updateScore({
      leadId: 42,
      opportunityScore: 4,
      recommendation: "NO-GO",
    });

    expect(result).toEqual({ success: true });
    expect(notifyOwner).not.toHaveBeenCalled();
  });

  it("rejects score out of range", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.lead.updateScore({
        leadId: 42,
        opportunityScore: 15,
        recommendation: "GO",
      })
    ).rejects.toThrow();
  });
});

describe("lead.list", () => {
  it("returns all leads", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.lead.list();

    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty("email");
    expect(result[0]).toHaveProperty("phone");
  });
});
