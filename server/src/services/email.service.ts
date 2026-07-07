import { Resend } from "resend";

// Resend's sandbox sender (onboarding@resend.dev) works with zero setup, but
// can only deliver to the email address on your Resend account until you
// verify your own sending domain. Once you verify a domain in the Resend
// dashboard, set RESEND_FROM_EMAIL to an address on that domain (e.g.
// "Mono <noreply@yourdomain.com>") to send to any registered user.
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "Mono <onboarding@resend.dev>";

let client: Resend | null = null;

function getClient() {
  if (!process.env.RESEND_API_KEY) return null;
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const resend = getClient();

  if (!resend) {
    console.warn("RESEND_API_KEY is not set — skipping password reset email send.");
    return;
  }

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: "Your Mono password reset code",
    text: `Here's your password reset code:\n\n${token}\n\nPaste this into the "Paste reset token" box on the Reset Password page in Mono. This code expires in 15 minutes.\n\nIf you didn't request this, you can safely ignore this email.`,
    html: `
      <div style="font-family: ui-sans-serif, system-ui, sans-serif; max-width: 480px; margin: 0 auto; color: #111111;">
        <h2 style="margin-bottom: 4px;">Reset your Mono password</h2>
        <p style="color: #737373;">Copy the code below and paste it into the "Paste reset token" box on the Reset Password page.</p>
        <div style="margin: 20px 0; padding: 16px; border: 1px solid #eaeaea; border-radius: 12px; background: #f5f5f5; font-family: ui-monospace, monospace; font-size: 14px; word-break: break-all;">
          ${token}
        </div>
        <p style="color: #737373; font-size: 13px;">This code expires in 15 minutes. If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
  });

  if (error) {
    console.error("Failed to send password reset email:", error);
  }
}
