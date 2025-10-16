import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User, Session } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import MessageBubble from "@/components/MessageBubble";
import MessageInput from "@/components/MessageInput";
import ChatHeader from "@/components/ChatHeader";
import ChannelList from "@/components/ChannelList";

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
    if (targetLanguage === "en") {
      // No translation needed for English
      setMessages((current) =>
        current.map((msg) =>
          msg.id === messageId ? { ...msg, translatedContent: undefined, isTranslating: false } : msg
        )
      );
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke("translate", {
        body: { text: content, targetLanguage },
      });

      if (error) throw error;

      setMessages((current) =>
        current.map((msg) =>
          msg.id === messageId
            ? { ...msg, translatedContent: data.translation, isTranslating: false }
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
        if (!session) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Translate all messages when language changes
  useEffect(() => {
    if (!messages.length) return;

    messages.forEach((message) => {
      // Translate ALL messages for testing purposes
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
        toast({
          title: "Error loading channels",
          description: error.message,
          variant: "destructive",
        });
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
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "channels",
        },
        () => {
          fetchChannels();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channelSubscription);
    };
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
        toast({
          title: "Error loading messages",
          description: messagesError.message,
          variant: "destructive",
        });
        return;
      }

      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username");

      if (profilesError) {
        toast({
          title: "Error loading profiles",
          description: profilesError.message,
          variant: "destructive",
        });
        return;
      }

      const profilesMap = new Map(
        profilesData?.map((p) => [p.id, { username: p.username }]) || []
      );

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
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `channel_id=eq.${activeChannelId}`,
        },
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
          
          // Auto-translate ALL incoming messages for testing
          translateMessage(newMessage.id, newMessage.content, selectedLanguage);
          
          setTimeout(scrollToBottom, 100);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, toast, activeChannelId]);

  const handleSendMessage = async (content: string) => {
    if (!user || !activeChannelId) return;

    const { error } = await supabase.from("messages").insert({
      content,
      user_id: user.id,
      channel_id: activeChannelId,
    });

    if (error) {
      toast({
        title: "Error sending message",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleChannelCreated = async () => {
    const { data } = await supabase
      .from("channels")
      .select("*")
      .order("created_at", { ascending: true });

    if (data) {
      setChannels(data);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const activeChannel = channels.find((ch) => ch.id === activeChannelId);

  return (
    <div className="flex flex-col h-screen bg-background">
      <ChatHeader 
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
      />
      <main className="flex-1 overflow-hidden flex">
        <ChannelList
          channels={channels}
          activeChannelId={activeChannelId}
          onChannelSelect={setActiveChannelId}
          onChannelCreated={handleChannelCreated}
        />
        <div className="flex-1 flex flex-col">
          {activeChannel && (
            <div className="px-6 py-4 border-b border-border bg-card">
              <div className="flex items-center gap-2">
                <span className="text-xl font-semibold text-foreground">
                  #{activeChannel.name}
                </span>
              </div>
              {activeChannel.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {activeChannel.description}
                </p>
              )}
            </div>
          )}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 chat-messages-container">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center animate-fade-in">
                <div className="space-y-2">
                  <p className="text-lg font-medium text-foreground">No messages yet</p>
                  <p className="text-sm text-muted-foreground">
                    Be the first to say hello in #{activeChannel?.name}!
                  </p>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  content={message.content}
                  username={message.profile?.username || "Unknown"}
                  timestamp={message.created_at}
                  isOwnMessage={message.user_id === user.id}
                  translatedContent={message.translatedContent}
                  isTranslating={message.isTranslating}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          <MessageInput
            onSendMessage={handleSendMessage}
            disabled={!activeChannelId}
          />
        </div>
      </main>
    </div>
  );
};

export default Index;
