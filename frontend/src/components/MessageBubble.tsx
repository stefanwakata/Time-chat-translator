import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { useState } from "react";

interface MessageBubbleProps {
  content: string;
  username: string;
  timestamp: string;
  isOwnMessage: boolean;
  translatedContent?: string;
  isTranslating?: boolean;
  isGrouped?: boolean;
}

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #667eea, #764ba2)',
  'linear-gradient(135deg, #f093fb, #f5576c)',
  'linear-gradient(135deg, #4facfe, #00f2fe)',
  'linear-gradient(135deg, #43e97b, #38f9d7)',
  'linear-gradient(135deg, #fa709a, #fee140)',
  'linear-gradient(135deg, #a18cd1, #fbc2eb)',
  'linear-gradient(135deg, #fccb90, #d57eeb)',
  'linear-gradient(135deg, #a1c4fd, #c2e9fb)',
  'linear-gradient(135deg, #fd7043, #ff8a65)',
  'linear-gradient(135deg, #26c6da, #00acc1)',
];

const getAvatarGradient = (username: string) => {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_GRADIENTS[Math.abs(hash) % AVATAR_GRADIENTS.length];
};

const MessageBubble = ({
  content,
  username,
  timestamp,
  isOwnMessage,
  translatedContent,
  isTranslating,
  isGrouped = false,
}: MessageBubbleProps) => {
  const [showOriginal, setShowOriginal] = useState(false);
  const displayContent = (showOriginal ? content : translatedContent) || content;
  const hasTranslation = translatedContent && translatedContent !== content;
  const gradient = getAvatarGradient(username);

  const bubble = (
    <div
      className={`relative max-w-[75%] px-4 py-2.5 rounded-2xl shadow-sm transition-all ${
        isOwnMessage
          ? 'rounded-br-sm text-white'
          : 'rounded-bl-sm bg-white border border-border/60 text-foreground'
      }`}
      style={isOwnMessage ? { background: 'linear-gradient(135deg, hsl(207 90% 54%), hsl(262 83% 58%))' } : {}}
    >
      {isTranslating ? (
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full opacity-60 animate-bounce"
                style={{
                  background: isOwnMessage ? 'white' : 'hsl(262 83% 58%)',
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}
          </div>
          <span className="text-xs opacity-60">Traduction...</span>
        </div>
      ) : (
        <>
          <p className="text-sm leading-relaxed break-words">{displayContent}</p>
          {hasTranslation && (
            <button
              onClick={() => setShowOriginal(!showOriginal)}
              className={`text-[11px] mt-1 flex items-center gap-1 transition-opacity hover:opacity-100 opacity-60 ${
                isOwnMessage ? 'text-white' : 'text-primary'
              }`}
            >
              🌍 {showOriginal ? 'Voir la traduction' : `Original : ${content.slice(0, 40)}${content.length > 40 ? '…' : ''}`}
            </button>
          )}
        </>
      )}
    </div>
  );

  if (isGrouped) {
    return (
      <div className={`flex gap-3 px-4 py-0.5 message-in ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
        <div className="w-9 flex-shrink-0" />
        {bubble}
      </div>
    );
  }

  return (
    <div className={`flex gap-3 px-4 pt-3 pb-0.5 message-in ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
      <Avatar className="h-9 w-9 flex-shrink-0 ring-2 ring-white shadow-sm">
        <AvatarFallback
          className="text-white font-bold text-sm"
          style={{ background: gradient }}
        >
          {username.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className={`flex flex-col gap-0.5 ${isOwnMessage ? 'items-end' : 'items-start'}`}>
        <div className={`flex items-center gap-2 px-1 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
          <span className="text-xs font-semibold text-foreground">{username}</span>
          <span className="text-[10px] text-muted-foreground">
            {format(new Date(timestamp), "HH:mm")}
          </span>
        </div>
        {bubble}
      </div>
    </div>
  );
};

export default MessageBubble;
