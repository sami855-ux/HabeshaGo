import { Check, CheckCheck, FileText } from "lucide-react";

export type MessageStatus = "sent" | "delivered" | "read";

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

interface MessageBubbleProps {
message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
const isAgent = message.sender === "agent";

const StatusIcon = () => {
if (!message.status || isAgent) return null;

if (message.status === "read") {
  return <CheckCheck className="w-4 h-4 text-orange-500" />;
}
if (message.status === "delivered") {
  return <CheckCheck className="w-4 h-4 text-gray-400" />;
}
return <Check className="w-4 h-4 text-gray-400" />;

};

return (
<div className={`flex ${isAgent ? "justify-start" : "justify-end"} mb-4`}>
<div className={`max-w-[70%] ${isAgent ? "order-1" : "order-2"}`}>

```
    {/* MESSAGE BUBBLE */}
    <div
      className={`rounded-2xl px-4 py-2.5 ${
        isAgent
          ? "bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white rounded-tl-sm"
          : "bg-orange-500 text-white rounded-tr-sm"
      }`}
    >
      {/* TEXT */}
      {message.text && <p className="break-words">{message.text}</p>}

      {/* ✅ IMAGE ATTACHMENT */}
      {message.attachment?.url &&
        message.attachment.type === "IMAGE" && (
          <img
            src={`http://localhost:5000${message.attachment.url}`}
            alt={message.attachment.name}
            className="mt-2 rounded-lg max-w-[220px] border"
          />
        )}

      {/* ✅ FILE / PDF ATTACHMENT */}
      {message.attachment?.url &&
        message.attachment.type !== "IMAGE" && (
          <a
            href={`http://localhost:5000${message.attachment.url}`}
            target="_blank"
            rel="noreferrer"
            className={`mt-2 p-3 rounded-lg border flex items-center gap-3 ${
              isAgent
                ? "bg-white dark:bg-gray-950 border-gray-200 dark:border-gray-800"
                : "bg-orange-600 border-orange-400"
            }`}
          >
            <div
              className={`p-2 rounded ${
                isAgent
                  ? "bg-orange-100 dark:bg-orange-950/30"
                  : "bg-orange-400"
              }`}
            >
              <FileText
                className={`w-4 h-4 ${
                  isAgent
                    ? "text-orange-600 dark:text-orange-400"
                    : "text-white"
                }`}
              />
            </div>

            <div className="flex-1 min-w-0">
              <div
                className={`text-sm truncate ${
                  isAgent
                    ? "text-gray-900 dark:text-white"
                    : "text-white"
                }`}
              >
                {message.attachment.name}
              </div>

              <div
                className={`text-xs ${
                  isAgent
                    ? "text-gray-500 dark:text-gray-400"
                    : "text-orange-100"
                }`}
              >
                {message.attachment.type}
              </div>
            </div>
          </a>
        )}
    </div>

    {/* TIMESTAMP + STATUS */}
    <div
      className={`flex items-center gap-1 mt-1 px-1 ${
        isAgent ? "justify-start" : "justify-end"
      }`}
    >
      <span className="text-xs text-gray-500 dark:text-gray-400">
        {message.timestamp}
      </span>
      <StatusIcon />
    </div>
  </div>
</div>

);
}
