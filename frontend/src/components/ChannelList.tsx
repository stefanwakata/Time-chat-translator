import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Zap } from "lucide-react";
import CreateChannelDialog from "./CreateChannelDialog";

const CHANNEL_EMOJIS: Record<string, string> = {
  general: "💬", tech: "💻", gaming: "🎮", music: "🎵", movies: "🎬",
  sports: "⚽", food: "🍕", travel: "✈️", fashion: "👗", science: "🔬",
  art: "🎨", books: "📚", news: "📰", crypto: "₿", fitness: "💪",
  photography: "📷", cooking: "👨‍🍳", anime: "⛩️", cars: "🚗", nature: "🌿",
  memes: "😂", design: "✏️", finance: "💰", health: "❤️", pets: "🐾",
  space: "🚀", history: "📜", language: "🗣️", politics: "🏛️", random: "🎲",
  philosophy: "🧠", diy: "🔧", environment: "🌍", relationships: "💑", career: "💼",
};

const getChannelEmoji = (name: string): string =>
  CHANNEL_EMOJIS[name.toLowerCase()] ?? "💬";

interface Channel {
  id: string;
  name: string;
  description: string | null;
}

interface ChannelListProps {
  channels: Channel[];
  activeChannelId: string | null;
  onChannelSelect: (channelId: string) => void;
  onChannelCreated: () => void;
}

const ChannelList = ({ channels, activeChannelId, onChannelSelect, onChannelCreated }: ChannelListProps) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <div className="w-64 flex flex-col flex-shrink-0 relative z-10 glass border-r-0"
      style={{ borderRight: '1px solid rgba(139,92,246,0.15)' }}>

      {/* Header / Logo */}
      <div className="p-4 border-b" style={{ borderColor: 'rgba(139,92,246,0.15)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 glow-purple"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #06b6d4)' }}>
            <Zap className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold gradient-brand-text tracking-tight">Time Chat</p>
            <p className="text-[10px] text-muted-foreground">Multilingual · Real-time</p>
          </div>
        </div>
      </div>

      {/* Section label */}
      <div className="px-4 pt-5 pb-2 flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.15em]"
          style={{ color: 'rgba(139,92,246,0.7)' }}>
          Channels
        </span>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="w-6 h-6 rounded-lg flex items-center justify-center transition-all hover:scale-110 hover:glow-purple"
          style={{ background: 'rgba(139,92,246,0.15)', color: '#a78bfa' }}
          title="Nouveau channel"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      <ScrollArea className="flex-1 px-2 pb-4">
        <div className="space-y-0.5 pt-1">
          {channels.map((channel) => {
            const isActive = activeChannelId === channel.id;
            return (
              <button
                key={channel.id}
                onClick={() => onChannelSelect(channel.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left text-sm transition-all duration-200 group ${
                  isActive ? 'text-white font-medium' : 'text-muted-foreground hover:text-white/80'
                }`}
                style={isActive ? {
                  background: 'linear-gradient(135deg, rgba(124,58,237,0.6), rgba(6,182,212,0.4))',
                  boxShadow: '0 0 20px rgba(139,92,246,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
                  border: '1px solid rgba(139,92,246,0.4)',
                } : {
                  background: 'transparent',
                  border: '1px solid transparent',
                }}
                onMouseEnter={e => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(139,92,246,0.08)';
                }}
                onMouseLeave={e => {
                  if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                }}
              >
                <span className="flex-shrink-0 text-base leading-none">
                  {getChannelEmoji(channel.name)}
                </span>
                <span className="truncate">{channel.name}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: '#06b6d4', boxShadow: '0 0 8px #06b6d4' }} />
                )}
              </button>
            );
          })}
        </div>
      </ScrollArea>

      <CreateChannelDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onChannelCreated={() => { setShowCreateDialog(false); onChannelCreated(); }}
      />
    </div>
  );
};

export default ChannelList;
