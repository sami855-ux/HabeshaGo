import { PrismaClient } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

export const initSupportChatSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("Support chat connected:", socket.id);

    /* JOIN SESSION */

    socket.on("joinSession", async (sessionId) => {
      socket.join(`chat-${sessionId}`);
      console.log(`${socket.id} joined chat-${sessionId}`);
    });

    /* SEND MESSAGE */

    socket.on("sendMessage", async (data) => {
      try {
        const { sessionId, senderType, senderId, message } = data;

        const savedMessage = await prisma.supportChatMessage.create({
          data: {
            id: uuidv4(),
            sessionId,
            senderType,
            senderId,
            message,
            createdAt: new Date(),
          },
        });

        io.to(`chat-${sessionId}`).emit("receiveMessage", savedMessage);
      } catch (err) {
        console.error("Message error:", err);
        socket.emit("errorMessage", {
          error: "Message could not be sent",
        });
      }
    });

    /* TYPING INDICATOR */

    socket.on("typing", ({ sessionId, userId, isTyping }) => {
      socket.to(`chat-${sessionId}`).emit("userTyping", { userId, isTyping });
    });

    /* AUTO ASSIGN AGENT */

    socket.on("autoAssignAgent", async ({ sessionId }) => {
      try {
        const agent = await prisma.user.findFirst({
          where: {
            role: "AGENT",
            isOnline: true,
          },
        });

        if (agent) {
          io.to(`chat-${sessionId}`).emit("agentAssigned", {
            agentId: agent.id,
            agentName: agent.name,
          });
        } else {
          socket.emit("agentAssigned", { agentId: null });
        }
      } catch (err) {
        console.error("Agent assign error:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("Chat socket disconnected:", socket.id);
    });
  });
};
