import { getSocket } from "@/services/socket";
import { store } from "@/store/index";

// Agent slice
import { receiveSocketMessage as receiveAgentMessage } from "@/store/slices/supportAgentSlice";

// Customer slice
import { receiveSocketMessage as receiveCustomerMessage } from "@/store/slices/supportCustomerSlice";

/**
 * Initializes socket listeners for both agent and customer clients.
 * Determines which slice to update based on the senderType / client type.
 */
export const initializeSocketListeners = (clientType: "agent" | "customer") => {
  const socket = getSocket();

  // Listen for incoming messages
  socket.on("receiveMessage", (data: { sessionId: string; message: any }) => {
    const formattedMessage = {
      id: data.message.id,
      text: data.message.text,
      sender: data.message.senderType === "AGENT" ? "agent" : "user",
      timestamp: data.message.createdAt,
      attachment: data.message.attachment
        ? {
            name: data.message.attachmentName,
            type: data.message.attachmentType,
            size: data.message.attachmentSize,
            url: data.message.attachmentUrl,
          }
        : undefined,
      status: "sent" as const,
    };

    if (clientType === "agent") {
      store.dispatch(
        receiveAgentMessage({
          sessionId: data.sessionId,
          message: formattedMessage,
        }),
      );
    } else if (clientType === "customer") {
      store.dispatch(receiveCustomerMessage(formattedMessage));
    }
  });

  // Optionally, listen for typing indicators
  socket.on(
    "userTyping",
    (data: { sessionId: string; userId: string; isTyping: boolean }) => {
      if (clientType === "agent") {
        // TODO: handle agent UI typing indicators per session
        console.log("Agent sees typing:", data);
      } else {
        // For customer, show agent typing indicator
        console.log("Customer sees agent typing:", data.isTyping);
        // You can dispatch a dedicated action to set `isAgentTyping` in customer slice state
      }
    },
  );

  // Handle disconnects or other events as needed
  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });
};
