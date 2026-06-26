import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

type EmailPurpose = 'verification' | 'reset';

const emailContent: Record<EmailPurpose, { subject: string; heading: string; subtitle: string; instruction: string; securityNote: string }> = {
  verification: {
    subject: 'Verify Your CodeArena Account',
    heading: 'Verify Your Email',
    subtitle: 'Complete your CodeArena registration',
    instruction: 'Enter this code on the verification page to activate your account.',
    securityNote: 'If you didn\'t create a CodeArena account, you can safely ignore this email.',
  },
  reset: {
    subject: 'Reset Your CodeArena Password',
    heading: 'Password Reset',
    subtitle: 'We received a request to reset your password',
    instruction: 'Enter this code to reset your password. If you didn\'t request this, your account is safe — just ignore this email.',
    securityNote: 'Never share this code with anyone. CodeArena will never ask for your password.',
  },
};

export async function sendOtpEmail(email: string, otp: string, purpose: EmailPurpose = 'verification'): Promise<boolean> {
  const content = emailContent[purpose];

  if (!resend) {
    console.log(`\n======================================================`);
    console.log(`[Email Service Bypass]: RESEND_API_KEY not set.`);
    console.log(`[${purpose.toUpperCase()}]: Code for ${email} is ${otp}`);
    console.log(`======================================================\n`);
    return false;
  }

  try {
    await resend.emails.send({
      from: 'CodeArena <onboarding@resend.dev>',
      to: email,
      subject: content.subject,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; padding: 0; background-color: #0a0a0c; color: #ffffff; max-width: 520px; margin: 0 auto;">
          <div style="padding: 40px 32px; border-radius: 16px; border: 1px solid #1f1f2e; background: linear-gradient(180deg, #121216 0%, #0c0c0f 100%);">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 32px;">
              <div style="display: inline-block; padding: 10px 14px; border-radius: 12px; background-color: rgba(99, 102, 241, 0.1); border: 1px solid rgba(99, 102, 241, 0.2); margin-bottom: 16px;">
                <span style="font-size: 20px; font-weight: bold; background: linear-gradient(to right, #818cf8, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">⟨/⟩</span>
              </div>
              <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">${content.heading}</h1>
              <p style="margin: 8px 0 0 0; font-size: 14px; color: #94a3b8;">${content.subtitle}</p>
            </div>

            <!-- OTP Box -->
            <div style="text-align: center; margin: 32px 0;">
              <p style="font-size: 13px; color: #94a3b8; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600;">${purpose === 'reset' ? 'Your Reset Code' : 'Your Verification Code'}</p>
              <div style="display: inline-block; background-color: #1f1f2e; border: 1px solid #2a2a3d; border-radius: 12px; padding: 16px 32px;">
                <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #ffffff; font-family: 'Courier New', monospace;">${otp}</span>
              </div>
            </div>

            <!-- Instructions -->
            <div style="background-color: rgba(99, 102, 241, 0.05); border: 1px solid rgba(99, 102, 241, 0.15); border-radius: 12px; padding: 16px 20px; margin: 24px 0;">
              <p style="margin: 0; font-size: 13px; color: #cbd5e1; line-height: 1.6;">
                ${content.instruction} This code is valid for <strong style="color: #818cf8;">10 minutes</strong>.
              </p>
            </div>

            <!-- Security Notice -->
            <p style="font-size: 12px; color: #64748b; line-height: 1.5; margin: 24px 0 0 0; text-align: center;">
              ${content.securityNote}
            </p>

            <!-- Footer -->
            <hr style="border: 0; border-top: 1px solid #1f1f2e; margin: 24px 0;" />
            <p style="font-size: 11px; color: #475569; text-align: center; margin: 0;">
              CodeArena &mdash; AI-Powered Competitive Coding Platform &copy; 2026
            </p>
          </div>
        </div>
      `,
    });
    console.log(`[Email Service]: ${content.subject} sent to ${email}`);
    return true;
  } catch (err: any) {
    console.error(`[Email Service Error]: Failed to send email to ${email}.`, err.message);
    // Fallback to console in case of error
    console.log(`\n======================================================`);
    console.log(`[Email Service Fallback]: Resend API failed. Code printed here.`);
    console.log(`[${purpose.toUpperCase()}]: Code for ${email} is ${otp}`);
    console.log(`======================================================\n`);
    return false;
  }
}
