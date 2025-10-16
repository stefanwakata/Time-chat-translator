import { Button } from "@/components/ui/button";
import { LogOut, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import LanguageSelector from "./LanguageSelector";

interface ChatHeaderProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
}

const ChatHeader = ({ selectedLanguage, onLanguageChange }: ChatHeaderProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({ title: "Signed out successfully" });
    navigate("/auth");
  };

  return (
    <header className="bg-gradient-to-r from-primary to-accent text-primary-foreground p-4 shadow-lg">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
            <MessageCircle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Time Chat Translator</h1>
            <p className="text-xs text-primary-foreground/80">Real-time multilingual chat</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSelector value={selectedLanguage} onChange={onLanguageChange} />
          <Button
          onClick={handleLogout} 
          variant="ghost" 
          size="sm"
          className="text-primary-foreground hover:bg-white/20"
        >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;
