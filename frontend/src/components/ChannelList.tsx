import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Hash, Plus, Sparkles } from "lucide-react";
import CreateChannelDialog from "./CreateChannelDialog";

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
    <div className="w-64 flex flex-col flex-shrink-0 border-r border-border" style={{ background: 'hsl(240 20% 99%)' }}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-8 h-8 rounded-xl gradient-brand flex items-center justify-center shadow-sm">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold" style={{ color: 'hsl(262 83% 58%)' }}>Time Chat</p>
            <p className="text-[10px] text-muted-foreground">Translator 🌍</p>
          </div>
        </div>
      </div>

      {/* Channel list */}
      <div className="px-3 pt-4 pb-1 flex items-center justify-between">
        <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
          Channels
        </span>
        <button
          onClick={() => setShowCreateDialog(true)}
          className="w-6 h-6 rounded-md flex items-center justify-center transition-all hover:scale-110"
          style={{ background: 'hsl(262 83% 58% / 0.1)', color: 'hsl(262 83% 58%)' }}
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
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left text-sm transition-all duration-150 group ${
                  isActive
                    ? 'text-white shadow-sm font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-primary/5'
                }`}
                style={isActive ? { background: 'linear-gradient(135deg, hsl(207 90% 54%), hsl(262 83% 58%))' } : {}}
              >
                <Hash className={`h-3.5 w-3.5 flex-shrink-0 ${isActive ? 'text-white/80' : 'text-muted-foreground group-hover:text-primary'}`} />
                <span className="truncate">{channel.name}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70 flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </ScrollArea>

      <CreateChannelDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onChannelCreated={() => {
          setShowCreateDialog(false);
          onChannelCreated();
        }}
      />
    </div>
  );
};

export default ChannelList;
