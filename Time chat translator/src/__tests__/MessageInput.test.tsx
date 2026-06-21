import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MessageInput from "../components/MessageInput";

describe("MessageInput", () => {
  it("renders the input placeholder with channel name", () => {
    render(<MessageInput onSendMessage={vi.fn()} channelName="general" />);
    expect(screen.getByPlaceholderText("Message #general")).toBeInTheDocument();
  });

  it("calls onSendMessage when Enter is pressed", async () => {
    const onSend = vi.fn();
    render(<MessageInput onSendMessage={onSend} channelName="general" />);

    const input = screen.getByPlaceholderText("Message #general");
    await userEvent.type(input, "Hello{Enter}");

    expect(onSend).toHaveBeenCalledWith("Hello");
  });

  it("does not send empty messages", async () => {
    const onSend = vi.fn();
    render(<MessageInput onSendMessage={onSend} channelName="general" />);

    const input = screen.getByPlaceholderText("Message #general");
    await userEvent.type(input, "   {Enter}");

    expect(onSend).not.toHaveBeenCalled();
  });

  it("clears input after sending", async () => {
    const onSend = vi.fn();
    render(<MessageInput onSendMessage={onSend} channelName="general" />);

    const input = screen.getByPlaceholderText("Message #general") as HTMLInputElement;
    await userEvent.type(input, "Hello{Enter}");

    expect(input.value).toBe("");
  });

  it("disables input when disabled prop is true", () => {
    render(
      <MessageInput onSendMessage={vi.fn()} disabled channelName="general" />
    );
    const input = screen.getByPlaceholderText("Sélectionne un channel...");
    expect(input).toBeDisabled();
  });

  it("shows send button only when there is text", async () => {
    render(<MessageInput onSendMessage={vi.fn()} channelName="general" />);

    const input = screen.getByPlaceholderText("Message #general");

    // No send button initially
    expect(screen.queryByTitle(/send/i)).not.toBeInTheDocument();

    await userEvent.type(input, "Hi");
    // Send button should appear (it's a button with Send icon)
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(1);
  });
});
