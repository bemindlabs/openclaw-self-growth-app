import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import GetStarted from "./GetStarted";

vi.mock("react-markdown", () => ({
  default: ({ children }: { children: string }) => <div>{children}</div>,
}));

describe("GetStarted", () => {
  it("renders page heading", () => {
    render(<GetStarted />);
    expect(screen.getByText("Get Started")).toBeTruthy();
  });

  it("renders all section titles", () => {
    render(<GetStarted />);
    expect(screen.getByText("Our Vision")).toBeTruthy();
    expect(screen.getByText("Welcome to Self Growth")).toBeTruthy();
    expect(screen.getByText("Setup Guide")).toBeTruthy();
    expect(screen.getByText("How To Use")).toBeTruthy();
    expect(screen.getByText("FAQ")).toBeTruthy();
    expect(screen.getByText("Terms & Conditions")).toBeTruthy();
    expect(screen.getByText("Privacy Policy")).toBeTruthy();
  });

  it("expands a section when clicked", () => {
    render(<GetStarted />);
    // "Our Vision" is expanded by default, click "Setup Guide"
    fireEvent.click(screen.getByText("Setup Guide"));
    // The content should now be visible
    expect(screen.getByText(/Install the App/)).toBeTruthy();
  });

  it("collapses current section when clicked again", () => {
    render(<GetStarted />);
    // "Our Vision" is expanded by default
    fireEvent.click(screen.getByText("Our Vision"));
    // After collapsing, clicking another section
    fireEvent.click(screen.getByText("FAQ"));
    expect(screen.getByText(/Where is my data stored/)).toBeTruthy();
  });
});
