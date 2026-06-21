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
  'linear-gradient(135deg, #7c3aed, #06b6d4)',
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
      className={`relative max-w-[75%] px-4 py-3 rounded-2xl transition-all duration-200 ${
        isOwnMessage ? 'rounded-br-sm text-white' : 'rounded-bl-sm'
      }`}
      style={isOwnMessage ? {
        background: 'linear-gradient(135deg, rgba(124,58,237,0.85), rgba(6,182,212,0.7))',
        boxShadow: '0 4px 20px rgba(139,92,246,0.35), 0 0 0 1px rgba(139,92,246,0.3)',
      } : {
        background: 'rgba(255,255,255,0.06)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
        backdropFilter: 'blur(8px)',
        color: 'rgba(255,255,255,0.88)',
      }}
    >
      {isTranslating ? (
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <span className="bounce-dot" />
            <span className="bounce-dot" />
            <span className="bounce-dot" />
          </div>
          <span className="text-xs opacity-50">Traduction...</span>
        </div>
      ) : (
        <>
          <p className="text-sm leading-relaxed break-words">{displayContent}</p>
          {hasTranslation && (
            <button
              onClick={() => setShowOriginal(!showOriginal)}
              className="text-[11px] mt-1.5 flex items-center gap-1 transition-all hover:opacity-100 opacity-50"
              style={{ color: isOwnMessage ? 'rgba(255,255,255,0.8)' : '#a78bfa' }}
            >
              🌍 {showOriginal
                ? 'Voir traduction'
                : `Original: ${content.slice(0, 40)}${content.length > 40 ? '…' : ''}`}
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
    <div className={`flex gap-3 px-4 pt-4 pb-0.5 message-in ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
      <Avatar className="h-9 w-9 flex-shrink-0"
        style={{ boxShadow: '0 0 12px rgba(139,92,246,0.4)' }}>
        <AvatarFallback
          className="text-white font-bold text-sm"
          style={{ background: gradient }}
        >
          {username.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className={`flex flex-col gap-1 ${isOwnMessage ? 'items-end' : 'items-start'}`}>
        <div className={`flex items-center gap-2 px-1 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
          <span className="text-xs font-semibold" style={{ color: '#a78bfa' }}>{username}</span>
          <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {format(new Date(timestamp), "HH:mm")}
          </span>
        </div>
        {bubble}
      </div>
    </div>
  );
};

export default MessageBubble;
