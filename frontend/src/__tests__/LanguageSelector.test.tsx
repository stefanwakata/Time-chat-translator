import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import LanguageSelector from "../components/LanguageSelector";

describe("LanguageSelector", () => {
  it("renders the selector", () => {
    render(<LanguageSelector value="en" onChange={vi.fn()} />);
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("shows the currently selected language", () => {
    render(<LanguageSelector value="fr" onChange={vi.fn()} />);
    expect(screen.getByText("Français")).toBeInTheDocument();
  });

  it("shows English as default", () => {
    render(<LanguageSelector value="en" onChange={vi.fn()} />);
    expect(screen.getByText("English")).toBeInTheDocument();
  });
});
