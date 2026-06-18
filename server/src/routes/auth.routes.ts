import { Router } from "express";
import {
  deleteAccount,
  exportMyData,
  forgotPassword,
  listUsers,
  login,
  logout,
  me,
  register,
  resetPassword,
  updateProfile,
  updateUserRole,
} from "../controllers/auth.controller.js";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", requireAuth, me);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.patch("/profile", requireAuth, updateProfile);
router.get("/users", requireAuth, requireRole("admin"), listUsers);
router.patch("/users/:id/role", requireAuth, requireRole("admin"), updateUserRole);
router.get("/export", requireAuth, exportMyData);
router.delete("/account", requireAuth, deleteAccount);

export default router;
