import { describe, it, expect } from "vitest";
import { cn, formatDate, formatDateTime, getInitials } from "../lib/utils";

// ─── cn (class name merger) ───────────────────────────────────────────────────

describe("cn", () => {
  it("returns a single class unchanged", () => {
    expect(cn("text-red-500")).toBe("text-red-500");
  });

  it("merges multiple class strings", () => {
    const result = cn("px-4", "py-2", "rounded");
    expect(result).toContain("px-4");
    expect(result).toContain("py-2");
    expect(result).toContain("rounded");
  });

  it("resolves Tailwind conflicts — last value wins", () => {
    // twMerge should resolve px-2 vs px-4 → px-4 wins (later class)
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("omits falsy values", () => {
    const result = cn("text-blue-500", false, undefined, null as any, "font-bold");
    expect(result).not.toContain("false");
    expect(result).toContain("text-blue-500");
    expect(result).toContain("font-bold");
  });

  it("handles conditional class objects", () => {
    const isActive = true;
    const result = cn("base-class", { "active-class": isActive, "inactive-class": !isActive });
    expect(result).toContain("active-class");
    expect(result).not.toContain("inactive-class");
  });

  it("returns empty string when no classes provided", () => {
    expect(cn()).toBe("");
  });
});

// ─── formatDate ───────────────────────────────────────────────────────────────

describe("formatDate", () => {
  it("formats a valid ISO date string as 'MMM d, yyyy'", () => {
    expect(formatDate("2025-01-15T10:00:00.000Z")).toBe("Jan 15, 2025");
  });

  it("returns an empty string for an empty input", () => {
    expect(formatDate("")).toBe("");
  });

  it("handles the last day of the year", () => {
    expect(formatDate("2024-12-31T23:59:59.000Z")).toBe("Dec 31, 2024");
  });

  it("handles the first day of a month", () => {
    expect(formatDate("2026-07-01T00:00:00.000Z")).toBe("Jul 1, 2026");
  });
});

// ─── formatDateTime ───────────────────────────────────────────────────────────

describe("formatDateTime", () => {
  it("formats a valid ISO string as 'MMM d, yyyy HH:mm'", () => {
    // Use a fixed UTC offset string to avoid TZ-dependent test failures
    expect(formatDateTime("2025-06-20T14:30:00.000Z")).toMatch(
      /Jun 20, 2025 \d{2}:30/,
    );
  });

  it("returns an empty string for an empty input", () => {
    expect(formatDateTime("")).toBe("");
  });

  it("includes hours and minutes in the output", () => {
    const result = formatDateTime("2025-03-05T09:05:00.000Z");
    expect(result).toMatch(/\d{2}:\d{2}$/);
  });
});

// ─── getInitials ──────────────────────────────────────────────────────────────

describe("getInitials", () => {
  it("returns two uppercase initials for a full name", () => {
    expect(getInitials("Alice Johnson")).toBe("AJ");
  });

  it("returns one initial for a single-word name", () => {
    expect(getInitials("Alice")).toBe("A");
  });

  it("returns only the first two initials for names with more than two words", () => {
    expect(getInitials("Jean Claude Van Damme")).toBe("JC");
  });

  it("uppercases lowercase initials", () => {
    expect(getInitials("bob smith")).toBe("BS");
  });

  it("handles names that are already uppercase", () => {
    expect(getInitials("ALICE JOHNSON")).toBe("AJ");
  });
});
