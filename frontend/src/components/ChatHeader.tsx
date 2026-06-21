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
    <header className="h-14 flex items-center px-5 gap-4 flex-shrink-0 relative z-10"
      style={{
        background: 'rgba(5, 5, 20, 0.7)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(139,92,246,0.15)',
      }}>

      {/* Left */}
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <div className="flex items-center justify-center w-7 h-7 rounded-lg"
          style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)' }}>
          <Hash className="h-3.5 w-3.5" style={{ color: '#a78bfa' }} />
        </div>
        <span className="font-bold text-white/90 truncate">{channelName || 'general'}</span>
        {channelDescription && (
          <>
            <div className="w-px h-4 mx-1 flex-shrink-0" style={{ background: 'rgba(139,92,246,0.3)' }} />
            <span className="text-xs truncate hidden md:block" style={{ color: 'rgba(167,139,250,0.6)' }}>
              {channelDescription}
            </span>
          </>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all"
          style={{
            background: 'rgba(6,182,212,0.1)',
            border: '1px solid rgba(6,182,212,0.25)',
          }}>
          <Globe className="h-3.5 w-3.5" style={{ color: '#06b6d4' }} />
          <LanguageSelector value={selectedLanguage} onChange={onLanguageChange} />
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm transition-all hover:scale-105"
          style={{
            background: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.2)',
            color: 'rgba(252,165,165,0.7)',
          }}
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
};

export default ChatHeader;
