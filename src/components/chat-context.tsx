"use client";

import React from "react";
import {supabase} from "../lib/supabase";

export type Conversation = {
  id: string;
  name: string;
  created_at: string;
};

type ChatContextType = {
  conversations: Conversation[];
  selectedConversationId: string | null;
  setSelectedConversationId: (id: string) => void;
  refreshConversations: () => Promise<void>;
};

const ChatContext = React.createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({children}: {children: React.ReactNode}) {
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = React.useState<string | null>(null);

  const refreshConversations = React.useCallback(async () => {
    const {data: session} = await supabase.auth.getSession();
    const userId = session.session?.user?.id;
    if (!userId) return;
    const {data, error} = await supabase
      .from("chat_conversations")
      .select("id, name, created_at")
      .eq("owner_user_id", userId)
      .order("created_at", {ascending: false});
    if (!error && data) {
      setConversations(data as Conversation[]);
      if (!selectedConversationId && data.length > 0) {
        setSelectedConversationId(data[0].id);
      }
    }
  }, [selectedConversationId]);

  React.useEffect(() => {
    refreshConversations();
  }, [refreshConversations]);

  const value: ChatContextType = {
    conversations,
    selectedConversationId,
    setSelectedConversationId,
    refreshConversations,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = React.useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
}


