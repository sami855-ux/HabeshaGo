import { Router } from "express";
import multer from "multer";
import { authenticateUser } from "../middleware/auth.middleware";
import {
  profileController,
  preferenceController,
  emergencyContactController,
  avatarController,
} from "../controllers";
import { MAX_AVATAR_SIZE_BYTES } from "../utils/avatar";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_AVATAR_SIZE_BYTES },
});

export const profileRouter = Router();

// All /me endpoints require authenticated user
profileRouter.use("/me", authenticateUser);

// 1. Profile
profileRouter.get("/me", profileController.getMe);
profileRouter.patch("/me", profileController.updateMe);

// 2. Preferences
profileRouter.get("/me/preferences", preferenceController.getPreferences);
profileRouter.patch("/me/preferences", preferenceController.updatePreferences);

// 3. Emergency Contacts
profileRouter.get("/me/emergency-contacts", emergencyContactController.listContacts);
profileRouter.post("/me/emergency-contacts", emergencyContactController.addContact);
profileRouter.patch("/me/emergency-contacts/:contactId", emergencyContactController.updateContact);
profileRouter.delete("/me/emergency-contacts/:contactId", emergencyContactController.deleteContact);

// 4. Avatar (Cloudinary & direct upload support)
profileRouter.post("/me/avatar/upload-url", avatarController.getUploadUrl);
profileRouter.put("/me/avatar", avatarController.confirmAvatar);
profileRouter.post(
  "/me/avatar",
  upload.fields([{ name: "file", maxCount: 1 }, { name: "avatar", maxCount: 1 }]),
  (req, res, next) => {
    // Normalise file whether sent as 'file' or 'avatar'
    const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
    if (files) {
      req.file = (files["file"] && files["file"][0]) || (files["avatar"] && files["avatar"][0]);
    }
    avatarController.uploadAvatar(req, res, next);
  },
);
profileRouter.delete("/me/avatar", avatarController.deleteAvatar);
