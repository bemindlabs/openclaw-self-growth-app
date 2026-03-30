import { describe, it, expect, beforeEach, vi } from "vitest";
import { invoke } from "@tauri-apps/api/core";
import { ledgerApi, type LedgerEntry, type LedgerSummary } from "./ledger";

const mockInvoke = vi.mocked(invoke);

const mockEntry: LedgerEntry = {
  id: 1,
  title: "Freelance payment",
  amount: 1500,
  currency: "USD",
  entry_type: "income",
  category: "freelance",
  description: "Project completion",
  entry_date: "2024-06-01",
  created_at: "2024-06-01T00:00:00",
};

const mockSummary: LedgerSummary = {
  total_income: 3000,
  total_expense: 1200,
  balance: 1800,
  currency: "USD",
  by_category: [
    ["freelance", 3000],
    ["food", -1200],
  ],
};

describe("ledgerApi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("list", () => {
    it("calls list_ledger_entries with all undefined when no args given", async () => {
      mockInvoke.mockResolvedValueOnce([mockEntry]);
      await ledgerApi.list();
      expect(mockInvoke).toHaveBeenCalledWith("list_ledger_entries", {
        category: undefined,
        limit: undefined,
      });
    });

    it("calls list_ledger_entries with the provided category and limit", async () => {
      mockInvoke.mockResolvedValueOnce([mockEntry]);
      await ledgerApi.list("freelance", 10);
      expect(mockInvoke).toHaveBeenCalledWith("list_ledger_entries", {
        category: "freelance",
        limit: 10,
      });
    });
  });

  describe("create", () => {
    it("calls create_ledger_entry with the wrapped data object", async () => {
      mockInvoke.mockResolvedValueOnce(mockEntry);
      const data = {
        title: "Freelance payment",
        amount: 1500,
        currency: "USD",
        entry_type: "income",
        category: "freelance",
        description: "Project completion",
        entry_date: "2024-06-01",
      };
      await ledgerApi.create(data);
      expect(mockInvoke).toHaveBeenCalledWith("create_ledger_entry", { data });
    });

    it("calls create_ledger_entry with only the required fields", async () => {
      mockInvoke.mockResolvedValueOnce(mockEntry);
      await ledgerApi.create({ title: "Coffee", amount: 4 });
      expect(mockInvoke).toHaveBeenCalledWith("create_ledger_entry", {
        data: { title: "Coffee", amount: 4 },
      });
    });
  });

  describe("update", () => {
    it("calls update_ledger_entry with id and spread fields", async () => {
      mockInvoke.mockResolvedValueOnce(mockEntry);
      await ledgerApi.update(1, { title: "Updated title", amount: 2000 });
      expect(mockInvoke).toHaveBeenCalledWith("update_ledger_entry", {
        id: 1,
        title: "Updated title",
        amount: 2000,
      });
    });

    it("calls update_ledger_entry with only the id when fields object is empty", async () => {
      mockInvoke.mockResolvedValueOnce(mockEntry);
      await ledgerApi.update(3, {});
      expect(mockInvoke).toHaveBeenCalledWith("update_ledger_entry", { id: 3 });
    });
  });

  describe("delete", () => {
    it("calls delete_ledger_entry with the provided id", async () => {
      mockInvoke.mockResolvedValueOnce(undefined);
      await ledgerApi.delete(4);
      expect(mockInvoke).toHaveBeenCalledWith("delete_ledger_entry", { id: 4 });
    });
  });

  describe("summary", () => {
    it("calls get_ledger_summary with no period when omitted", async () => {
      mockInvoke.mockResolvedValueOnce(mockSummary);
      await ledgerApi.summary();
      expect(mockInvoke).toHaveBeenCalledWith("get_ledger_summary", {
        period: undefined,
      });
    });

    it('calls get_ledger_summary with period "week"', async () => {
      mockInvoke.mockResolvedValueOnce(mockSummary);
      await ledgerApi.summary("week");
      expect(mockInvoke).toHaveBeenCalledWith("get_ledger_summary", {
        period: "week",
      });
    });

    it('calls get_ledger_summary with period "month"', async () => {
      mockInvoke.mockResolvedValueOnce(mockSummary);
      await ledgerApi.summary("month");
      expect(mockInvoke).toHaveBeenCalledWith("get_ledger_summary", {
        period: "month",
      });
    });

    it('calls get_ledger_summary with period "year"', async () => {
      mockInvoke.mockResolvedValueOnce(mockSummary);
      await ledgerApi.summary("year");
      expect(mockInvoke).toHaveBeenCalledWith("get_ledger_summary", {
        period: "year",
      });
    });
  });
});
