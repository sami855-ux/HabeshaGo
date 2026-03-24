-- AlterTable
ALTER TABLE "support_messages" ADD COLUMN     "attachmentName" TEXT,
ADD COLUMN     "attachmentSize" INTEGER;

-- CreateIndex
CREATE INDEX "chat_typing_status_sessionId_idx" ON "chat_typing_status"("sessionId");

-- CreateIndex
CREATE INDEX "support_agent_status_isOnline_idx" ON "support_agent_status"("isOnline");

-- CreateIndex
CREATE INDEX "support_chat_sessions_status_idx" ON "support_chat_sessions"("status");

-- CreateIndex
CREATE INDEX "support_messages_senderType_idx" ON "support_messages"("senderType");

-- CreateIndex
CREATE INDEX "support_messages_createdAt_idx" ON "support_messages"("createdAt");

-- AddForeignKey
ALTER TABLE "chat_typing_status" ADD CONSTRAINT "chat_typing_status_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "support_chat_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "chat_typing_status" ADD CONSTRAINT "chat_typing_status_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
