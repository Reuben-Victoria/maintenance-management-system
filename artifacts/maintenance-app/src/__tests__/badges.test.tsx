import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge, PriorityBadge, RoleBadge } from "../components/shared/badges";

// ─── StatusBadge ──────────────────────────────────────────────────────────────

describe("StatusBadge", () => {
  const statuses = [
    { value: "pending",     label: "Pending"     },
    { value: "assigned",    label: "Assigned"    },
    { value: "in_progress", label: "In Progress" },
    { value: "completed",   label: "Completed"   },
    { value: "rejected",    label: "Rejected"    },
  ] as const;

  statuses.forEach(({ value, label }) => {
    it(`renders "${label}" for status="${value}"`, () => {
      render(<StatusBadge status={value} />);
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it("renders the raw value for an unknown status", () => {
    render(<StatusBadge status="on_hold" />);
    expect(screen.getByText("on_hold")).toBeInTheDocument();
  });

  it("applies an extra className when provided", () => {
    const { container } = render(<StatusBadge status="pending" className="custom-class" />);
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("applies the correct colour class for 'completed'", () => {
    const { container } = render(<StatusBadge status="completed" />);
    // The completed badge should have emerald-100 background
    expect(container.firstChild).toHaveClass("bg-emerald-100");
  });

  it("applies the correct colour class for 'rejected'", () => {
    const { container } = render(<StatusBadge status="rejected" />);
    expect(container.firstChild).toHaveClass("bg-red-100");
  });
});

// ─── PriorityBadge ────────────────────────────────────────────────────────────

describe("PriorityBadge", () => {
  const priorities = [
    { value: "low",    label: "Low"    },
    { value: "medium", label: "Medium" },
    { value: "high",   label: "High"   },
    { value: "urgent", label: "Urgent" },
  ] as const;

  priorities.forEach(({ value, label }) => {
    it(`renders "${label}" for priority="${value}"`, () => {
      render(<PriorityBadge priority={value} />);
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it("renders the raw value for an unknown priority", () => {
    render(<PriorityBadge priority="critical" />);
    expect(screen.getByText("critical")).toBeInTheDocument();
  });

  it("applies the correct colour class for 'urgent'", () => {
    const { container } = render(<PriorityBadge priority="urgent" />);
    expect(container.firstChild).toHaveClass("bg-red-100");
  });

  it("applies the correct colour class for 'low'", () => {
    const { container } = render(<PriorityBadge priority="low" />);
    expect(container.firstChild).toHaveClass("bg-slate-100");
  });
});

// ─── RoleBadge ────────────────────────────────────────────────────────────────

describe("RoleBadge", () => {
  const roles = [
    { value: "student",              label: "Student" },
    { value: "staff",                label: "Staff"   },
    { value: "maintenance_officer",  label: "Officer" },
    { value: "admin",                label: "Admin"   },
  ] as const;

  roles.forEach(({ value, label }) => {
    it(`renders "${label}" for role="${value}"`, () => {
      render(<RoleBadge role={value} />);
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it("renders the raw value for an unknown role", () => {
    render(<RoleBadge role="superuser" />);
    expect(screen.getByText("superuser")).toBeInTheDocument();
  });

  it("applies the correct colour class for 'admin'", () => {
    const { container } = render(<RoleBadge role="admin" />);
    expect(container.firstChild).toHaveClass("bg-purple-100");
  });
});
