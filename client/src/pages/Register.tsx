import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { getErrorMessage } from "../services/api";
import { useAuthStore } from "../store/auth.store";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { AuthShell } from "./auth/AuthShell";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const register = useAuthStore((state) => state.register);
  const navigate = useNavigate();

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      await register(fullName, email, password);
      toast.success("Workspace created");
      navigate("/dashboard");
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Create your workspace" description="Start a fresh monthly operating system for your tasks and notes.">
      <form onSubmit={submit} className="space-y-4">
        <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" required />
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <Input type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password, minimum 8 characters" required />
        <Button className="w-full" disabled={loading}>{loading ? "Creating..." : "Create account"}</Button>
      </form>
      <p className="mt-5 text-center text-sm text-[var(--muted)]">Already have an account? <Link to="/login" className="text-[var(--text)] hover:underline">Sign in</Link></p>
    </AuthShell>
  );
}
