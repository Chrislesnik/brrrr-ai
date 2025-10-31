"use client";

import React from "react";
import {Button, Tooltip, ScrollShadow} from "@heroui/react";
import {Icon} from "@iconify/react";
import {cn} from "@heroui/react";

import PromptInput from "./prompt-input";
import {supabase} from "../lib/supabase";
import {useChat} from "./chat-context";

export default function Component() {
  const {selectedConversationId, setSelectedConversationId, refreshConversations} = useChat();
  const actions = [
    {label: "Draft an email", icon: "gravity-ui:mail"},
    {label: "Create an image", icon: "gravity-ui:image"},
    {label: "Brainstorm", icon: "gravity-ui:bulb"},
    {label: "Make a plan", icon: "gravity-ui:checklist"},
    {label: "Code", icon: "gravity-ui:code"},
    {label: "Help me write", icon: "gravity-ui:pen"},
    {label: "Get advice", icon: "gravity-ui:question-circle"},
  ];

  const [prompt, setPrompt] = React.useState<string>("");
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) return;
    setSubmitError(null);
    setSubmitting(true);
    try {
      console.log("[send] submit start", {prompt, selectedConversationId});
      const {data: session} = await supabase.auth.getSession();
      const userId = session.session?.user?.id;
      console.log("[send] session", {hasSession: !!session.session, userId});
      if (!userId) throw new Error("Not authenticated");

      // Use RPC to atomically create conversation (if needed) and insert message
      const payload = {
        p_name: "New Channel",
        p_content: prompt,
        p_conversation_id: selectedConversationId,
      } as const;
      console.log("[send] calling RPC create_conversation_and_message", payload);
      const {data, error: rpcErr} = await supabase.rpc("create_conversation_and_message", {
        ...payload,
      });
      if (rpcErr) throw rpcErr;
      const row = Array.isArray(data) ? (data[0] as any) : (data as any);
      const newConversationId = row?.conversation_id as string | undefined;
      console.log("[send] RPC response", {row, newConversationId});
      if (newConversationId && newConversationId !== selectedConversationId) {
        await refreshConversations();
        setSelectedConversationId(newConversationId);
      }
      setPrompt("");
    } catch (err: any) {
      console.error("[send] failed", err);
      setSubmitError(err?.message || "Failed to send message");
    } finally {
      console.log("[send] submit done");
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      // Submit via the same RPC so Enter works too
      (async () => {
        if (!prompt) return;
        setSubmitError(null);
        setSubmitting(true);
        try {
          console.log("[send:enter] submit start", {prompt, selectedConversationId});
          const {data: session} = await supabase.auth.getSession();
          const userId = session.session?.user?.id;
          console.log("[send:enter] session", {hasSession: !!session.session, userId});
          if (!userId) throw new Error("Not authenticated");
          const {data, error: rpcErr} = await supabase.rpc("create_conversation_and_message", {
            p_name: "New Channel",
            p_content: prompt,
            p_conversation_id: selectedConversationId,
          });
          if (rpcErr) throw rpcErr;
          const row = Array.isArray(data) ? (data[0] as any) : (data as any);
          const newConversationId = row?.conversation_id as string | undefined;
          console.log("[send:enter] RPC response", {row, newConversationId});
          if (newConversationId && newConversationId !== selectedConversationId) {
            await refreshConversations();
            setSelectedConversationId(newConversationId);
          }
          setPrompt("");
        } catch (err: any) {
          console.error("[send:enter] failed", err);
          setSubmitError(err?.message || "Failed to send message");
        } finally {
          console.log("[send:enter] submit done");
          setSubmitting(false);
        }
      })();
    }
  };

  return (
    <div className="flex w-full flex-col gap-4">
      <ScrollShadow hideScrollBar className="flex flex-nowrap gap-2" orientation="horizontal">
        <div className="flex gap-2">
          {actions.map(({label, icon}, index) => (
            <Button
              key={index}
              size="sm"
              radius="full"
              className="bg-transparent text-default-700 border-small border-default-200 data-[hover=true]:bg-default-100"
              startContent={<Icon className="text-default-500" icon={icon} width={16} />}
              variant="bordered"
            >
              {label}
            </Button>
          ))}
        </div>
      </ScrollShadow>
      <form onSubmit={handleSubmit} className="rounded-medium bg-default-100 hover:bg-default-200/70 flex w-full flex-col items-start transition-colors">
        <PromptInput
          classNames={{
            inputWrapper: "bg-transparent! shadow-none",
            innerWrapper: "relative",
            input: "pt-1 pl-2 pb-6 pr-10! text-medium",
          }}
          onKeyDown={handleKeyDown}
          endContent={
            <div className="flex items-end gap-2">
              <Tooltip showArrow content="Send message">
                <Button
                  isIconOnly
                  color={!prompt ? "default" : "primary"}
                  isDisabled={!prompt || submitting}
                  isLoading={submitting}
                  radius="lg"
                  size="sm"
                  variant="solid"
                  type="submit"
                >
                  <Icon
                    className={cn(
                      "[&>path]:stroke-[2px]",
                      !prompt ? "text-default-600" : "text-primary-foreground",
                    )}
                    icon="solar:arrow-up-linear"
                    width={20}
                  />
                </Button>
              </Tooltip>
            </div>
          }
          minRows={3}
          maxRows={8}
          radius="lg"
          value={prompt}
          variant="flat"
          onValueChange={setPrompt}
        />
        <div className="flex w-full items-center justify-between gap-2 overflow-auto px-4 pb-4">
          <div className="flex w-full gap-1 md:gap-3">
            <Button
              size="sm"
              startContent={
                <Icon className="text-default-500" icon="solar:paperclip-linear" width={18} />
              }
              variant="flat"
            >
              Attach
            </Button>
            <Button
              size="sm"
              startContent={
                <Icon className="text-default-500" icon="solar:soundwave-linear" width={18} />
              }
              variant="flat"
            >
              Voice Commands
            </Button>
            <Button
              size="sm"
              startContent={
                <Icon className="text-default-500" icon="solar:notes-linear" width={18} />
              }
              variant="flat"
            >
              Templates
            </Button>
          </div>
          <p className="text-tiny text-default-400 py-1">{prompt.length}/2000</p>
        </div>
        {submitError && (
          <p className="text-tiny text-danger-500 px-4 pb-3">{submitError}</p>
        )}
      </form>
    </div>
  );
}
