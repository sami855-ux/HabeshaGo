import express from "express";
import {
  createSession,
  getSessions,
  getMessages,
  sendMessage,
  setTypingStatus,
  setAgentStatus,
  getAgentStatus,
  upload, // multer middleware
} from "../controllers/supportChat.controller.js";

const router = express.Router();

// ------------------ CHAT SESSION ------------------
router.post("/session", createSession);
router.get("/sessions", getSessions);

// ------------------ MESSAGES ------------------
// upload.single("attachment") handles file uploads
router.get("/messages/:sessionId", getMessages);
router.post("/message", upload.single("file"), sendMessage);

// ------------------ TYPING STATUS ------------------
router.post("/typing", setTypingStatus);

// ------------------ AGENT STATUS ------------------
router.post("/agent-status", setAgentStatus);
router.get("/agent-status/:agentId", getAgentStatus);

export default router;
