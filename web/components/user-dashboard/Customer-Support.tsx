"use client";

import { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";

import {
  createSession,
  fetchMessages,
  sendMessage,
  receiveSocketMessage,
  Message,
} from "@/store/slices/supportCustomerSlice";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";

import {
  Send,
  Paperclip,
  X,
  FileText,
  Image as ImageIcon,
  Download,
  Minimize2,
  Sun,
  Moon,
  Headphones,
} from "lucide-react";

import { cn } from "@/lib/utils";
import io from "socket.io-client";

const socket = io("http://localhost:5000");

export default function CustomerSupport() {
  const dispatch = useDispatch();
  const { sessionId, messages } = useSelector(
    (state: RootState) => state.supportCustomer
  );

  const [messageInput, setMessageInput] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ---------------- DARK MODE ---------------- */
  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [isDarkMode]);

  /* ---------------- CREATE SESSION ---------------- */
  useEffect(() => {
    if (!sessionId) dispatch(createSession() as any);
  }, [sessionId, dispatch]);

  /* ---------------- FETCH MESSAGES ---------------- */
  useEffect(() => {
    if (sessionId) dispatch(fetchMessages(sessionId) as any);
  }, [sessionId, dispatch]);

  /* ---------------- SOCKET.IO ---------------- */
  useEffect(() => {
    socket.on("supportMessage", (msg: any) => {
      dispatch(
        receiveSocketMessage({
          id: msg.id,
          text: msg.message,
          sender: msg.senderType === "AGENT" ? "agent" : "user",
          timestamp: msg.createdAt,
          attachment: msg.attachmentUrl
            ? {
              name: msg.attachmentName,
              type: msg.attachmentType,
              size: msg.attachmentSize,
              url: msg.attachmentUrl,
            }
            : undefined,
        })
      );
    })});

  /* ---------------- SCROLL ---------------- */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ---------------- SEND MESSAGE ---------------- */
  const handleSendMessage = async () => {
    if (!messageInput.trim() && attachments.length === 0) return;
    if (!sessionId) return;

    await dispatch(
      sendMessage({
        sessionId,
        text: messageInput,
        attachment: attachments[0],
      }) as any
    );

    setMessageInput("");
    setAttachments([]);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files)
      setAttachments((prev) => [...prev, ...Array.from(e.target.files)]);
  };

  const removeAttachment = (index: number) =>
    setAttachments((prev) => prev.filter((_, i) => i !== index));

  if (isMinimized)
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          className="h-14 px-6 rounded-full shadow-lg flex items-center gap-2"
        >
          <Headphones className="h-5 w-5" />
          <span>Support Chat</span>
          {messages.filter((m) => m.sender === "agent").length > 0 && (
            <Badge className="ml-1 bg-destructive">
              {messages.filter((m) => m.sender === "agent").length}
            </Badge>
          )}
        </Button>
      </div>
    );

  return (
    <div className="fixed bottom-4 right-4 z-50 w-full max-w-md shadow-2xl rounded-lg overflow-hidden border border-border bg-card">
      {/* HEADER */}
      <div className="p-4 bg-primary text-primary-foreground flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback>
              <Headphones />
            </AvatarFallback>
          </Avatar>
          <div>
            <h3>Customer Support</h3>
            <p className="text-xs opacity-90">We’re online</p>
          </div>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsDarkMode(!isDarkMode)}
          >
            {isDarkMode ? <Sun /> : <Moon />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMinimized(true)}
          >
            <Minimize2 />
          </Button>
        </div>
      </div>

      {/* MESSAGES */}
      <ScrollArea className="h-96 p-4 bg-background">
        <div className="space-y-4">
          {messages.map((msg) => {
            const isCustomer = msg.sender === "user";
            return (
              <div
                key={msg.id}
                className={cn("flex gap-2", isCustomer && "flex-row-reverse")}
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback>{isCustomer ? "" : ""}</AvatarFallback>
                </Avatar>
                <div
                  className={cn(
                    "flex flex-col max-w-[75%]",
                    isCustomer && "items-end",
                  )}
                >
                  <div
                    className={cn(
                      "rounded-lg px-4 py-2",
                      isCustomer
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted",
                    )}
                  >
                    <p className="text-sm">{msg.text}</p>

                    {msg.attachment?.url && (
                      <div className="mt-2">
                        {msg.attachment.type === "IMAGE" ? (
                          <img
                            src={`http://localhost:5000${msg.attachment.url}`}
                            alt={msg.attachment.name}
                            className="w-48 rounded-md mt-2"
                          />
                        ) : (
                          <a
                            href={`http://localhost:5000${msg.attachment.url}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 mt-2 text-xs underline"
                          >
                            <FileText className="w-4 h-4" />
                            {msg.attachment.name}
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  <span className="text-xs text-muted-foreground mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* ATTACHMENT PREVIEW */}
      {attachments.length > 0 && (
        <div className="p-2 border-t flex gap-2 overflow-x-auto">
          {attachments.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-1 border px-2 py-1 rounded bg-muted text-xs"
            >
              <span className="truncate max-w-[100px]">{file.name}</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeAttachment(index)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* INPUT */}
      <div className="p-4 border-t flex items-end gap-2">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
        />
        <Button
          variant="outline"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip />
        </Button>

        <Textarea
          placeholder="Type your message..."
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          className="min-h-[44px]"
        />

        <Button onClick={handleSendMessage}>
          <Send />
        </Button>
      </div>
    </div>
  );
}