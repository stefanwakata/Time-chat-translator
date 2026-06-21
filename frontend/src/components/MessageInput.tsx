import { useState, useRef } from "react";
import { Send, Smile } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
  channelName?: string;
}

const MessageInput = ({ onSendMessage, disabled, channelName }: MessageInputProps) => {
  const [message, setMessage] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const send = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="px-4 pb-5 pt-2 flex-shrink-0">
      <div
        className="flex items-center gap-2 rounded-2xl px-4 bg-white border-2 transition-all duration-200 shadow-sm"
        style={{
          borderColor: focused ? 'hsl(262 83% 58%)' : 'hsl(240 10% 90%)',
          boxShadow: focused ? '0 0 0 3px hsl(262 83% 58% / 0.12)' : '0 1px 4px hsl(240 10% 85% / 0.5)',
        }}
      >
        <button
          type="button"
          className="flex-shrink-0 p-1 text-muted-foreground transition-colors hover:text-primary"
          tabIndex={-1}
        >
          <Smile className="h-5 w-5" />
        </button>

        <input
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={disabled ? "Sélectionne un channel..." : `Message #${channelName || 'channel'}`}
          disabled={disabled}
          className="flex-1 bg-transparent border-none outline-none py-3 text-sm text-foreground placeholder:text-muted-foreground"
        />

        <button
          onClick={send}
          disabled={disabled || !message.trim()}
          className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-30 hover:scale-110 active:scale-95"
          style={{
            background: message.trim() ? 'linear-gradient(135deg, hsl(207 90% 54%), hsl(262 83% 58%))' : 'hsl(240 10% 92%)',
          }}
        >
          <Send className={`h-4 w-4 ${message.trim() ? 'text-white' : 'text-muted-foreground'}`} />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
