import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";

interface MessageBubbleProps {
  content: string;
  username: string;
  timestamp: string;
  isOwnMessage: boolean;
  translatedContent?: string;
  isTranslating?: boolean;
}

const MessageBubble = ({ content, username, timestamp, isOwnMessage, translatedContent, isTranslating }: MessageBubbleProps) => {
  const displayContent = translatedContent || content;
  const showOriginal = translatedContent && translatedContent !== content;

  return (
    <div className={`flex gap-3 animate-message-in ${isOwnMessage ? "flex-row-reverse" : ""}`}>
      <Avatar className="h-10 w-10 border-2 border-primary/20">
        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-semibold">
          {username.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className={`flex flex-col ${isOwnMessage ? "items-end" : ""} max-w-[70%]`}>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-sm font-medium text-foreground">{username}</span>
          <span className="text-xs text-muted-foreground">
            {format(new Date(timestamp), "h:mm a")}
          </span>
        </div>
        <div
          className={`rounded-2xl px-4 py-2 shadow-sm ${
            isOwnMessage
              ? "bg-[hsl(var(--chat-bubble-sent))] text-[hsl(var(--chat-bubble-sent-text))] rounded-br-sm"
              : "bg-[hsl(var(--chat-bubble-received))] text-[hsl(var(--chat-bubble-received-text))] border border-border rounded-bl-sm"
          }`}
        >
          {isTranslating ? (
            <p className="text-sm leading-relaxed break-words opacity-50">Translating...</p>
          ) : (
            <>
              <p className="text-sm leading-relaxed break-words">{displayContent}</p>
              {showOriginal && (
                <p className="text-xs mt-1 opacity-60 italic border-t border-current/20 pt-1">
                  Original: {content}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
