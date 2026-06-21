import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import MessageBubble from "@/components/MessageBubble";
import MessageInput from "@/components/MessageInput";
import ChatHeader from "@/components/ChatHeader";
import ChannelList from "@/components/ChannelList";
import AnimatedBackground from "@/components/AnimatedBackground";

interface Profile {
  username: string;
}

interface Message {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  channel_id: string;
  profile?: Profile;
  translatedContent?: string;
  isTranslating?: boolean;
}

interface Channel {
  id: string;
  name: string;
  description: string | null;
}

const GROUPING_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const translateMessage = async (messageId: string, content: string, targetLanguage: string) => {
    try {
      const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(content)}`;
      const response = await fetch(url);
      const result = await response.json();

      const translatedText = result[0]?.map((item: [string]) => item[0]).join("") || content;
      const detectedLang = result[2];
      const showTranslation = detectedLang !== targetLanguage && translatedText !== content;

      setMessages((current) =>
        current.map((msg) =>
          msg.id === messageId
            ? { ...msg, translatedContent: showTranslation ? translatedText : undefined, isTranslating: false }
            : msg
        )
      );
    } catch (error) {
      console.error("Translation error:", error);
      setMessages((current) =>
        current.map((msg) =>
          msg.id === messageId ? { ...msg, isTranslating: false } : msg
        )
      );
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (!session) navigate("/auth");
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) navigate("/auth");
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!messages.length) return;
    messages.forEach((message) => {
      setMessages((current) =>
        current.map((msg) =>
          msg.id === message.id ? { ...msg, isTranslating: true } : msg
        )
      );
      translateMessage(message.id, message.content, selectedLanguage);
    });
  }, [selectedLanguage]);

  useEffect(() => {
    if (!user) return;

    const fetchChannels = async () => {
      const { data, error } = await supabase
        .from("channels")
        .select("*")
        .order("created_at", { ascending: true });

      if (error) {
        toast({ title: "Error loading channels", description: error.message, variant: "destructive" });
        return;
      }

      setChannels(data || []);
      if (data && data.length > 0 && !activeChannelId) {
        setActiveChannelId(data[0].id);
      }
    };

    fetchChannels();

    const channelSubscription = supabase
      .channel("channels")
      .on("postgres_changes", { event: "*", schema: "public", table: "channels" }, () => {
        fetchChannels();
      })
      .subscribe();

    return () => { supabase.removeChannel(channelSubscription); };
  }, [user, toast, activeChannelId]);

  useEffect(() => {
    if (!user || !activeChannelId) return;

    const fetchMessages = async () => {
      const { data: messagesData, error: messagesError } = await supabase
        .from("messages")
        .select("*")
        .eq("channel_id", activeChannelId)
        .order("created_at", { ascending: true });

      if (messagesError) {
        toast({ title: "Error loading messages", description: messagesError.message, variant: "destructive" });
        return;
      }

      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username");

      if (profilesError) {
        toast({ title: "Error loading profiles", description: profilesError.message, variant: "destructive" });
        return;
      }

      const profilesMap = new Map(profilesData?.map((p) => [p.id, { username: p.username }]) || []);
      const enrichedMessages = messagesData?.map((msg) => ({
        ...msg,
        profile: profilesMap.get(msg.user_id),
      })) || [];

      setMessages(enrichedMessages);
      setTimeout(scrollToBottom, 100);
    };

    fetchMessages();

    const channel = supabase
      .channel(`messages-${activeChannelId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages", filter: `channel_id=eq.${activeChannelId}` },
        async (payload) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("username")
            .eq("id", payload.new.user_id)
            .single();

          const newMessage: Message = {
            id: payload.new.id,
            content: payload.new.content,
            user_id: payload.new.user_id,
            created_at: payload.new.created_at,
            channel_id: payload.new.channel_id,
            profile: profile || undefined,
            isTranslating: true,
          };

          setMessages((current) => [...current, newMessage]);
          translateMessage(newMessage.id, newMessage.content, selectedLanguage);
          setTimeout(scrollToBottom, 100);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, toast, activeChannelId]);

  const handleSendMessage = async (content: string) => {
    if (!user || !activeChannelId) return;

    const { error } = await supabase.from("messages").insert({
      content,
      user_id: user.id,
      channel_id: activeChannelId,
    });

    if (error) {
      toast({ title: "Error sending message", description: error.message, variant: "destructive" });
    }
  };

  const handleChannelCreated = async () => {
    const { data } = await supabase.from("channels").select("*").order("created_at", { ascending: true });
    if (data) setChannels(data);
  };

  // Determine if a message is "grouped" (same user, within 5 min of previous)
  const isGrouped = (index: number): boolean => {
    if (index === 0) return false;
    const current = messages[index];
    const previous = messages[index - 1];
    if (current.user_id !== previous.user_id) return false;
    const timeDiff = new Date(current.created_at).getTime() - new Date(previous.created_at).getTime();
    return timeDiff < GROUPING_THRESHOLD_MS;
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background relative">
        <AnimatedBackground />
        <div className="text-center space-y-4 relative z-10">
          <div className="w-12 h-12 rounded-full mx-auto animate-spin"
            style={{ border: '2px solid rgba(139,92,246,0.2)', borderTop: '2px solid #a78bfa' }} />
          <p className="gradient-brand-text font-semibold">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const activeChannel = channels.find((ch) => ch.id === activeChannelId);

  return (
    <div className="flex flex-col h-screen bg-background relative">
      <AnimatedBackground />
      <ChatHeader
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
        channelName={activeChannel?.name}
        channelDescription={activeChannel?.description ?? undefined}
      />
      <main className="flex-1 overflow-hidden flex relative z-10">
        <ChannelList
          channels={channels}
          activeChannelId={activeChannelId}
          onChannelSelect={setActiveChannelId}
          onChannelCreated={handleChannelCreated}
        />

        {/* Main chat area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto py-4" style={{ background: 'rgba(5,5,20,0.4)' }}>
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center">
                <div className="space-y-2">
                  <p className="text-lg font-semibold text-white">Aucun message</p>
                  <p className="text-sm" style={{ color: 'hsl(220 5% 47%)' }}>
                    Sois le premier à dire bonjour dans #{activeChannel?.name} !
                  </p>
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <MessageBubble
                  key={message.id}
                  content={message.content}
                  username={message.profile?.username || "Unknown"}
                  timestamp={message.created_at}
                  isOwnMessage={message.user_id === user.id}
                  translatedContent={message.translatedContent}
                  isTranslating={message.isTranslating}
                  isGrouped={isGrouped(index)}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <MessageInput
            onSendMessage={handleSendMessage}
            disabled={!activeChannelId}
            channelName={activeChannel?.name}
          />
        </div>
      </main>
    </div>
  );
};

export default Index;
