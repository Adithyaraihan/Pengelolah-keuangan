import express from "express";
import {
  loginController,
  refreshTokenController,
  registerController,
  meController,
  logoutController,
  resetPasswordController,
  verifyController,
} from "./auth.controller.js";

import { authMiddleware } from "../../middleware/authMiddleware.js";
const router = express.Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.get("/me", authMiddleware, meController);
router.post("/refresh-token", refreshTokenController);
router.post("/logout", authMiddleware, logoutController);
// router.post("/reset-password", authMiddleware, resetPasswordController);
// router.get("/verify", verifyController);

export default router;
