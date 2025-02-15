"use client";
import {
  ChatInput,
  ChatInputSubmit,
  ChatInputTextArea,
} from "@/components/ui/chat-input";
import {
  ChatMessage,
  ChatMessageAvatar,
  ChatMessageContent,
} from "@/components/ui/chat-message";
import { ChatMessageArea } from "@/components/ui/chat-message-area";
import { useChat } from "@ai-sdk/react";
import type { ComponentPropsWithoutRef } from "react";

export function Chat({ className, ...props }: ComponentPropsWithoutRef<"div">) {
  const { messages, input, handleInputChange, handleSubmit, isLoading, stop } =
    useChat({
      api: "/api/chat",
      initialMessages: [
        {
          id: "1",
          content: "Hi! How may I help you today?",
          role: "assistant",
        },
      ],
    });

  const handleSubmitMessage = () => {
    if (isLoading) {
      return;
    }
    handleSubmit();
  };

  return (
    <div className="flex flex-col h-full w-full" {...props}>
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <ChatMessageArea scrollButtonAlignment="center">
          <div className="max-w-2xl mx-auto w-full space-y-8">
            {messages.map((message) => {
              if (message.role !== "user") {
                return (
                  <ChatMessage key={message.id} id={message.id} type="incoming">
                    <ChatMessageAvatar />
                    <ChatMessageContent content={message.content} />
                  </ChatMessage>
                );
              }
              return (
                <ChatMessage
                  key={message.id}
                  id={message.id}
                  variant="bubble"
                  type="outgoing"
                >
                  <ChatMessageContent content={message.content} />
                </ChatMessage>
              );
            })}
          </div>
        </ChatMessageArea>
      </div>
      <div className="w-full max-w-2xl mx-auto bg-white border-t p-4">
        <ChatInput
          value={input}
          onChange={handleInputChange}
          onSubmit={handleSubmitMessage}
          loading={isLoading}
          onStop={stop}
        >
          <ChatInputTextArea placeholder="Type a message..." />
          <ChatInputSubmit />
        </ChatInput>
      </div>
    </div>
  );
}
