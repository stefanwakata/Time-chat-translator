import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import MessageBubble from "../components/MessageBubble";

const baseProps = {
  content: "Hello world",
  username: "Carlos 🇪🇸",
  timestamp: new Date().toISOString(),
  isOwnMessage: false,
};

describe("MessageBubble", () => {
  it("renders the message content", () => {
    render(<MessageBubble {...baseProps} />);
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  it("renders the username", () => {
    render(<MessageBubble {...baseProps} />);
    expect(screen.getByText("Carlos 🇪🇸")).toBeInTheDocument();
  });

  it("shows translated content when provided", () => {
    render(
      <MessageBubble
        {...baseProps}
        translatedContent="Bonjour le monde"
      />
    );
    expect(screen.getByText("Bonjour le monde")).toBeInTheDocument();
  });

  it("shows toggle button when translation differs from original", () => {
    render(
      <MessageBubble
        {...baseProps}
        content="Hola mundo"
        translatedContent="Hello world"
      />
    );
    expect(screen.getByText(/Original/i)).toBeInTheDocument();
  });

  it("toggles between translated and original on click", () => {
    render(
      <MessageBubble
        {...baseProps}
        content="Hola mundo"
        translatedContent="Hello world"
      />
    );

    const toggle = screen.getByText(/Original/i);
    fireEvent.click(toggle);
    expect(screen.getByText("Hola mundo")).toBeInTheDocument();
  });

  it("shows translating indicator when isTranslating is true", () => {
    render(<MessageBubble {...baseProps} isTranslating />);
    expect(screen.getByText(/Traduction/i)).toBeInTheDocument();
  });

  it("does not show avatar when message is grouped", () => {
    const { container } = render(
      <MessageBubble {...baseProps} isGrouped />
    );
    // Grouped messages have a spacer div instead of Avatar
    expect(container.querySelector(".rounded-full")).not.toBeInTheDocument();
  });
});
