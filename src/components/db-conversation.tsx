"use client";

import React from "react";
import MessageCard from "./message-card";
import {supabase} from "../lib/supabase";
import {useChat} from "./chat-context";
import PromptInputFullLineWithBottomActions from "./prompt-input-full-line-with-bottom-actions";

type DbMessage = {
  id: string;
  conversation_id: string;
  author_user_id: string | null;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

export default function DbConversation() {
  const {selectedConversationId} = useChat();
  const [messages, setMessages] = React.useState<DbMessage[]>([]);

  const fetchMessages = React.useCallback(async () => {
    if (!selectedConversationId) return;
    const {data, error} = await supabase
      .from("chat_messages")
      .select("id, conversation_id, author_user_id, role, content, created_at")
      .eq("conversation_id", selectedConversationId)
      .order("created_at", {ascending: true});
    if (!error && data) setMessages(data as DbMessage[]);
  }, [selectedConversationId]);

  React.useEffect(() => {
    fetchMessages();
    if (!selectedConversationId) return;
    const channel = supabase
      .channel(`chat_messages_conv_${selectedConversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `conversation_id=eq.${selectedConversationId}`,
        },
        () => fetchMessages(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConversationId, fetchMessages]);

  if (!selectedConversationId) {
    return <div className="text-default-500">Select or create a conversation to get started.</div>;
  }

  return (
    messages.length === 0 ? (
      <div className="flex h-full w-full items-center justify-center">
        <div className="flex w-full max-w-xl flex-col items-center gap-8">
          <h1 className="text-default-foreground text-3xl leading-9 font-semibold">
            How can I help you today?
          </h1>
          <div className="flex w-full flex-col gap-4">
            <PromptInputFullLineWithBottomActions />
          </div>
        </div>
      </div>
    ) : (
      <div className="flex flex-col gap-4 px-1">
        {messages.map((m) => (
          <MessageCard
            key={m.id}
            attempts={1}
            avatar={
              m.role === "assistant"
                ? "https://nextuipro.nyc3.cdn.digitaloceanspaces.com/components-images/avatar_ai.png"
                : "https://d2u8k2ocievbld.cloudfront.net/memojis/male/6.png"
            }
            currentAttempt={1}
            isUser={m.role === "user"}
            message={m.content}
            messageClassName={m.role === "user" ? "bg-content3 text-content3-foreground" : ""}
            showFeedback={m.role === "assistant"}
          />
        ))}
      </div>
    )
  );
}


