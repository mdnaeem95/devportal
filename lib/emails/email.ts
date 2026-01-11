import { Resend } from "resend";

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Default from address - update with your verified domain
const DEFAULT_FROM = process.env.EMAIL_FROM || "DevPortal <noreply@devportal.app>";

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  react: React.ReactElement;
  from?: string;
  replyTo?: string;
}

interface EmailResult {
  success: boolean;
  id?: string;
  error?: string;
}

/**
 * Send an email using Resend
 */
export async function sendEmail(options: SendEmailOptions): Promise<EmailResult> {
  const { to, subject, react, from = DEFAULT_FROM, replyTo } = options;

  // Skip sending if no API key (development)
  if (!process.env.RESEND_API_KEY) {
    console.log("[Email] Skipping send (no API key):", { to, subject });
    return { success: true, id: "dev-mode" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      react,
      replyTo,
    });

    if (error) {
      console.error("[Email] Send failed:", error);
      return { success: false, error: error.message };
    }

    console.log("[Email] Sent successfully:", { id: data?.id, to, subject });
    return { success: true, id: data?.id };
  } catch (err) {
    console.error("[Email] Send error:", err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : "Unknown error" 
    };
  }
}

/**
 * Send multiple emails (e.g., to client and developer)
 */
export async function sendEmails(
  emails: SendEmailOptions[]
): Promise<EmailResult[]> {
  return Promise.all(emails.map(sendEmail));
}