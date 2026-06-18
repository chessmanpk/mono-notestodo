import mongoose from "mongoose";

export const USER_ROLES = ["admin", "manager", "user"] as const;
export type UserRole = (typeof USER_ROLES)[number];

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: USER_ROLES, default: "user", index: true },
    theme: { type: String, enum: ["system", "light", "dark"], default: "system" },
    notificationPreferences: {
      monthlyReport: { type: Boolean, default: true },
      overdueTasks: { type: Boolean, default: true },
      quietMode: { type: Boolean, default: true },
    },
    resetPasswordTokenHash: { type: String, default: null },
    resetPasswordExpires: { type: Date, default: null },
    lastMonthlyResetKey: { type: String, default: null },
  },
  { timestamps: true }
);

userSchema.set("toJSON", {
  transform(_doc, ret) {
    const safe = ret as Record<string, unknown>;
    safe.role = safe.role || "user";
    delete safe.passwordHash;
    delete safe.resetPasswordTokenHash;
    delete safe.resetPasswordExpires;
    delete safe.__v;
    return safe;
  },
});

export default mongoose.model("User", userSchema);
