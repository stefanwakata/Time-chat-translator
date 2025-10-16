import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Hash, Plus } from "lucide-react";
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

const ChannelList = ({
  channels,
  activeChannelId,
  onChannelSelect,
  onChannelCreated,
}: ChannelListProps) => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold text-foreground">Channels</h2>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowCreateDialog(true)}
          className="h-8 w-8 p-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {channels.map((channel) => (
            <button
              key={channel.id}
              onClick={() => onChannelSelect(channel.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left transition-colors ${
                activeChannelId === channel.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Hash className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{channel.name}</span>
            </button>
          ))}
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
