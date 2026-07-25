import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Spinner } from "../components/ui/spinner";
import { IonIcon } from "../components/ui/ion-icon";
import { EmptyState } from "../components/shared/empty-state";

// ─── Spinner ──────────────────────────────────────────────────────────────────

describe("Spinner", () => {
  it("renders a div element", () => {
    const { container } = render(<Spinner />);
    expect(container.firstChild?.nodeName).toBe("DIV");
  });

  it("includes the animate-spin class by default", () => {
    const { container } = render(<Spinner />);
    expect(container.firstChild).toHaveClass("animate-spin");
  });

  it("merges an extra className prop", () => {
    const { container } = render(<Spinner className="h-8 w-8 text-red-500" />);
    expect(container.firstChild).toHaveClass("h-8");
    expect(container.firstChild).toHaveClass("text-red-500");
  });

  it("still has animate-spin after merging extra classes", () => {
    const { container } = render(<Spinner className="h-4 w-4" />);
    expect(container.firstChild).toHaveClass("animate-spin");
  });
});

// ─── IonIcon ─────────────────────────────────────────────────────────────────

describe("IonIcon", () => {
  it("renders an ion-icon web component element", () => {
    const { container } = render(<IonIcon name="home-outline" />);
    const el = container.querySelector("ion-icon");
    expect(el).toBeInTheDocument();
  });

  it("sets the name attribute correctly", () => {
    const { container } = render(<IonIcon name="alert-circle-outline" />);
    const el = container.querySelector("ion-icon");
    expect(el).toHaveAttribute("name", "alert-circle-outline");
  });

  it("passes through a style prop", () => {
    const { container } = render(<IonIcon name="star" style={{ fontSize: "24px" }} />);
    const el = container.querySelector("ion-icon") as HTMLElement;
    expect(el.style.fontSize).toBe("24px");
  });

  it("maps className to the class attribute on the web component", () => {
    const { container } = render(<IonIcon name="star" className="text-primary" />);
    const el = container.querySelector("ion-icon");
    expect(el?.getAttribute("class")).toBe("text-primary");
  });
});

// ─── EmptyState ───────────────────────────────────────────────────────────────

describe("EmptyState", () => {
  it("renders the title", () => {
    render(<EmptyState title="Nothing here" />);
    expect(screen.getByText("Nothing here")).toBeInTheDocument();
  });

  it("renders a description when provided", () => {
    render(<EmptyState title="Empty" description="No records found." />);
    expect(screen.getByText("No records found.")).toBeInTheDocument();
  });

  it("does not render a description element when not provided", () => {
    render(<EmptyState title="Empty" />);
    expect(screen.queryByText(/records/i)).not.toBeInTheDocument();
  });

  it("renders a custom icon", () => {
    render(
      <EmptyState
        title="No data"
        icon={<span data-testid="custom-icon">★</span>}
      />,
    );
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
  });

  it("renders without an icon when none is provided", () => {
    // Should not throw when icon prop is omitted
    expect(() => render(<EmptyState title="Ok" />)).not.toThrow();
  });
});
