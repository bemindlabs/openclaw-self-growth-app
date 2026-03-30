import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Markdown from "./Markdown";

describe("Markdown", () => {
  it("renders plain text", () => {
    render(<Markdown>Hello world</Markdown>);
    expect(screen.getByText("Hello world")).toBeTruthy();
  });

  it("renders bold text", () => {
    render(<Markdown>**bold text**</Markdown>);
    expect(screen.getByText("bold text").tagName).toBe("STRONG");
  });

  it("renders italic text", () => {
    render(<Markdown>*italic text*</Markdown>);
    expect(screen.getByText("italic text").tagName).toBe("EM");
  });

  it("renders headings", () => {
    render(<Markdown># Heading 1</Markdown>);
    expect(screen.getByText("Heading 1").tagName).toBe("H1");
  });

  it("renders unordered lists", () => {
    render(<Markdown>{"- item one\n- item two"}</Markdown>);
    expect(screen.getByText("item one")).toBeTruthy();
    expect(screen.getByText("item two")).toBeTruthy();
  });

  it("renders inline code", () => {
    render(<Markdown>{"`const x = 1`"}</Markdown>);
    expect(screen.getByText("const x = 1").tagName).toBe("CODE");
  });

  it("renders links with target _blank", () => {
    render(<Markdown>[click](https://example.com)</Markdown>);
    const link = screen.getByText("click") as HTMLAnchorElement;
    expect(link.tagName).toBe("A");
    expect(link.target).toBe("_blank");
    expect(link.rel).toContain("noopener");
  });

  it("renders blockquotes", () => {
    render(<Markdown>{"> a quote"}</Markdown>);
    expect(screen.getByText("a quote").closest("blockquote")).toBeTruthy();
  });

  it("applies custom className", () => {
    const { container } = render(<Markdown className="extra">text</Markdown>);
    expect(container.firstElementChild?.classList.contains("extra")).toBe(true);
  });
});
