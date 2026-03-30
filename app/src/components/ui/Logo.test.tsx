import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Logo } from "./Logo";

describe("Logo", () => {
  it("renders the SVG icon", () => {
    const { container } = render(<Logo />);
    expect(container.querySelector("svg")).toBeTruthy();
  });

  it("shows brand text by default", () => {
    render(<Logo />);
    expect(screen.getByText("Bemind")).toBeTruthy();
    expect(screen.getByText("Growth")).toBeTruthy();
  });

  it("hides brand text when showText is false", () => {
    render(<Logo showText={false} />);
    expect(screen.queryByText("Bemind")).toBeNull();
    expect(screen.queryByText("Growth")).toBeNull();
  });

  it("applies custom size to the SVG", () => {
    const { container } = render(<Logo size={48} />);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("width")).toBe("48");
    expect(svg?.getAttribute("height")).toBe("48");
  });

  it("applies custom className", () => {
    const { container } = render(<Logo className="my-class" />);
    expect(container.firstElementChild?.classList.contains("my-class")).toBe(true);
  });
});
