import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getErrorMessage } from "../services/api";
import { useAuthStore } from "../store/auth.store";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { PasswordInput } from "../components/ui/PasswordInput";
import { AuthShell } from "./auth/AuthShell";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      await login(email, password, rememberMe);
      toast.success("Welcome back");
      navigate("/dashboard");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Welcome back" description="Enter your workspace quietly and continue the month.">
      <form onSubmit={submit} className="space-y-4">
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-[var(--muted)]"><input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} /> Remember me</label>
          <Link to="/forgot-password" className="text-[var(--text)] hover:underline">Forgot?</Link>
        </div>
        <Button className="w-full" disabled={loading}>{loading ? "Signing in..." : "Sign in"}</Button>
      </form>
      <p className="mt-5 text-center text-sm text-[var(--muted)]">No account? <Link to="/register" className="text-[var(--text)] hover:underline">Create one</Link></p>
    </AuthShell>
  );
}
