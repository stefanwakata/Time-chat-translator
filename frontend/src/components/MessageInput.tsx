import { useState, useRef } from "react";
import { Send, Sparkles } from "lucide-react";

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
    <div className="px-5 pb-6 pt-2 flex-shrink-0">
      <div
        className="flex items-center gap-3 rounded-2xl px-4 transition-all duration-300"
        style={{
          background: focused
            ? 'rgba(139,92,246,0.08)'
            : 'rgba(255,255,255,0.04)',
          border: focused
            ? '1px solid rgba(139,92,246,0.5)'
            : '1px solid rgba(255,255,255,0.08)',
          boxShadow: focused
            ? '0 0 25px rgba(139,92,246,0.2), 0 0 50px rgba(139,92,246,0.08), inset 0 1px 0 rgba(255,255,255,0.05)'
            : '0 4px 20px rgba(0,0,0,0.3)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <Sparkles className="h-4 w-4 flex-shrink-0 transition-colors"
          style={{ color: focused ? '#a78bfa' : 'rgba(139,92,246,0.4)' }} />

        <input
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={disabled ? "Sélectionne un channel..." : `Message #${channelName || 'channel'}`}
          disabled={disabled}
          className="flex-1 bg-transparent border-none outline-none py-3.5 text-sm text-white/90 placeholder:text-white/25"
        />

        <button
          onClick={send}
          disabled={disabled || !message.trim()}
          className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 disabled:opacity-20 hover:scale-110 active:scale-95"
          style={{
            background: message.trim()
              ? 'linear-gradient(135deg, #7c3aed, #06b6d4)'
              : 'rgba(255,255,255,0.06)',
            boxShadow: message.trim() ? '0 0 15px rgba(139,92,246,0.5)' : 'none',
          }}
        >
          <Send className={`h-4 w-4 ${message.trim() ? 'text-white' : 'text-white/30'}`} />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
