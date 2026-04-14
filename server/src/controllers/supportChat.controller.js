import { PrismaClient } from "@prisma/client";
import multer from "multer";
import path from "path";
import fs from "fs";

const prisma = new PrismaClient();

/* ---------------- MULTER ---------------- */
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype.startsWith("image") ||
    file.mimetype === "application/pdf"
  ) {
    cb(null, true);
  } else cb(new Error("Unsupported file type"), false);
};

export const upload = multer({ storage, fileFilter });

/* ---------------- HELPER ---------------- */
const getAttachmentType = (mimetype) => {
  if (!mimetype) return null;
  if (mimetype.startsWith("image")) return "IMAGE";
  if (mimetype === "application/pdf") return "PDF";
  return "FILE";
};
/* ------------------ CREATE SESSION ------------------ */
export const createSession = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId)
      return res.status(401).json({ message: "User not authenticated" });

    const { subject, priority } = req.body || {};

    const existingSession = await prisma.supportChatSession.findFirst({
      where: { userId, status: "OPEN" },
    });

    if (existingSession) return res.json(existingSession);

    const session = await prisma.supportChatSession.create({
      data: {
        userId,
        subject: subject || "Customer Support",
        priority: priority || "NORMAL",
      },
    });

    res.status(201).json(session);
  } catch (error) {
    console.error("Create session error:", error);
    res.status(500).json({ message: "Failed to create support session" });
  }
};

/* ------------------ GET ALL SESSIONS ------------------ */
export const getSessions = async (req, res) => {
  try {
    const sessions = await prisma.supportChatSession.findMany({
      include: {
        user: true,
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { lastMessageAt: "desc" },
    });

    res.json(sessions);
  } catch (error) {
    console.error("Get sessions error:", error);
    res.status(500).json({ message: "Failed to fetch sessions" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const messages = await prisma.supportMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
    });
    res.json(messages);
  } catch (error) {
    console.error("Fetch messages error:", error);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

/* ---------------- SEND MESSAGE ---------------- */
export const sendMessage = async (req, res) => {
  try {
    const { sessionId, message, senderType } = req.body;
    const senderId = req.user?.id;

    if (!sessionId || !senderType || (!message && !req.file)) {
      return res.status(400).json({ message: "Message or file is required" });
    }

    const newMessage = await prisma.supportMessage.create({
      data: {
        sessionId,
        senderType,
        senderId,
        message: message || "",
        attachmentUrl: req.file ? `/uploads/${req.file.filename}` : null,
        attachmentType: req.file ? getAttachmentType(req.file.mimetype) : null,
        attachmentName: req.file?.originalname || null,
        attachmentSize: req.file?.size || null,
      },
    });

    await prisma.supportChatSession.update({
      where: { id: sessionId },
      data: { lastMessageAt: new Date() },
    });

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
};

/* ------------------ TYPING STATUS ------------------ */
export const setTypingStatus = async (req, res) => {
  try {
    const { sessionId, userId, isTyping } = req.body;

    const typing = await prisma.chatTypingStatus.upsert({
      where: { sessionId_userId: { sessionId, userId } },
      update: { isTyping },
      create: { sessionId, userId, isTyping },
    });

    res.json(typing);
  } catch (error) {
    console.error("Typing status error:", error);
    res.status(500).json({ message: "Failed to update typing status" });
  }
};

/* ------------------ AGENT STATUS ------------------ */
export const setAgentStatus = async (req, res) => {
  try {
    const { agentId, isOnline } = req.body;

    const status = await prisma.supportAgentStatus.upsert({
      where: { agentId },
      update: { isOnline, lastSeen: new Date() },
      create: { agentId, isOnline },
    });

    res.json(status);
  } catch (error) {
    console.error("Agent status error:", error);
    res.status(500).json({ message: "Failed to update agent status" });
  }
};

export const getAgentStatus = async (req, res) => {
  try {
    const { agentId } = req.params;

    const status = await prisma.supportAgentStatus.findUnique({
      where: { agentId },
    });

    res.json(status);
  } catch (error) {
    console.error("Get agent status error:", error);
    res.status(500).json({ message: "Failed to fetch agent status" });
  }
};
