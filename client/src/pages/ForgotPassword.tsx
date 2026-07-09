import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { authService } from "../services/auth.service";
import { getErrorMessage } from "../services/api";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { PasswordInput } from "../components/ui/PasswordInput";
import { AuthShell } from "./auth/AuthShell";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [devToken, setDevToken] = useState("");

  async function requestReset(event: FormEvent) {
    event.preventDefault();
    try {
      const data = await authService.forgotPassword(email);
      setDevToken(data.devResetToken || "");
      toast.success("If that email exists, a reset code is on its way");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  async function reset(event: FormEvent) {
    event.preventDefault();
    try {
      await authService.resetPassword(token, newPassword);
      toast.success("Password reset successful");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  }

  return (
    <AuthShell title="Reset password" description="Enter your email and we'll send you a reset code. Paste it below along with your new password.">
      <form onSubmit={requestReset} className="space-y-3">
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" required />
        <Button className="w-full">Email me a reset code</Button>
      </form>
      {devToken && <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[var(--surface-soft)] p-3 text-xs break-all text-[var(--muted)]">Dev token: {devToken}</div>}
      <form onSubmit={reset} className="mt-6 space-y-3">
        <Input value={token} onChange={(e) => setToken(e.target.value)} placeholder="Paste reset token" />
        <PasswordInput minLength={8} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" />
        <Button variant="secondary" className="w-full">Reset password</Button>
      </form>
      <p className="mt-5 text-center text-sm text-[var(--muted)]"><Link to="/login" className="text-[var(--text)] hover:underline">Back to login</Link></p>
    </AuthShell>
  );
}
