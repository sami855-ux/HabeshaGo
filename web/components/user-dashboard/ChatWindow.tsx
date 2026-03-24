import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, MoreVertical, Info, X } from "lucide-react";
import { MessageBubble, MessageStatus } from "./MessageBubble";
import { TypingIndicator } from "./TypeIndicator";

interface Attachment {
  name: string;
  type: string;
  size: string;
  url?: string;
}

interface Message {
  id: string;
  text: string;
  sender: "user" | "agent";
  timestamp: string;
  status?: MessageStatus;
  attachment?: Attachment;
}

interface ChatWindowProps {
  customerName: string;
  messages: Message[];
  isTyping: boolean;
  onSendMessage: (text: string, attachment?: File) => void;
  onShowProfile: () => void;
}

export function ChatWindow({
  customerName,
  messages,
  isTyping,
  onSendMessage,
  onShowProfile,
}: ChatWindowProps) {
  const [messageText, setMessageText] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (messageText.trim() || selectedFile) {
      onSendMessage(messageText, selectedFile || undefined);
      setMessageText("");
      setSelectedFile(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-950">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
        <div>
          <h2 className="text-gray-900 dark:text-white">{customerName}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Online</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onShowProfile}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors"
          >
            <Info className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors">
            <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {isTyping && <TypingIndicator name={customerName} />}
        <div ref={messagesEndRef} />
      </div>

      {/* Selected File Preview */}
      {selectedFile && (
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center gap-3 p-2 bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="p-2 bg-orange-100 dark:bg-orange-950/30 rounded">
              <Paperclip className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-gray-900 dark:text-white truncate">
                {selectedFile.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {formatFileSize(selectedFile.size)}
              </div>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-900 rounded transition-colors"
            >
              <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="flex items-end gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-3 hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg transition-colors flex-shrink-0"
          >
            <Paperclip className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div className="flex-1 relative">
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
              rows={1}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              style={{ minHeight: "48px", maxHeight: "120px" }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!messageText.trim() && !selectedFile}
            className="p-3 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 dark:disabled:bg-gray-800 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Press Enter to send, Shift + Enter for new line
        </p>
      </div>
    </div>
  );
}
