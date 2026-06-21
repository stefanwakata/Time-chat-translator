import { LogOut, Hash, Globe } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import LanguageSelector from "./LanguageSelector";

interface ChatHeaderProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  channelName?: string;
  channelDescription?: string;
}

const ChatHeader = ({ selectedLanguage, onLanguageChange, channelName, channelDescription }: ChatHeaderProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "À bientôt !" });
    navigate("/auth");
  };

  return (
    <header className="h-14 flex items-center px-5 gap-4 flex-shrink-0 border-b border-border bg-white/80 backdrop-blur-md shadow-sm">
      {/* Left */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Hash className="h-5 w-5 flex-shrink-0 text-primary opacity-70" />
        <span className="font-bold text-foreground truncate">{channelName || 'general'}</span>
        {channelDescription && (
          <>
            <div className="w-px h-4 bg-border mx-1 flex-shrink-0" />
            <span className="text-xs text-muted-foreground truncate hidden md:block">{channelDescription}</span>
          </>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ background: 'hsl(262 83% 58% / 0.07)' }}>
          <Globe className="h-3.5 w-3.5 text-primary" />
          <LanguageSelector value={selectedLanguage} onChange={onLanguageChange} />
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:scale-105 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};

export default ChatHeader;
