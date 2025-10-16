import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
}

const MessageInput = ({ onSendMessage, disabled }: MessageInputProps) => {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 bg-card border-t border-border">
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type a message..."
        disabled={disabled}
        className="flex-1 bg-background focus:shadow-md transition-shadow"
      />
      <Button 
        type="submit" 
        disabled={disabled || !message.trim()}
        className="bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-all shadow-md"
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
};

export default MessageInput;
