// lib/email/utils.ts
// biome-ignore lint/style/useImportType: <explanation>
import { EmailTemplateData } from "./template";

export interface SendEmailOptions {
  template?: 'welcome' | 'password-reset' | 'verification' | 'contact' | 'order-confirmation' | 'newsletter' | 'account-update';
  data?: EmailTemplateData;
  to: string | string[];
  subject?: string;
  text?: string;
  html?: string;
  attachments?: Array<{
    filename: string;
    content?: string | Buffer;
    path?: string;
    contentType?: string;
  }>;
  cc?: string | string[];
  bcc?: string | string[];
}

// Helper function to get the base URL
function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    // Client-side: use relative URL
    return '';
  }
  
  // Server-side: use environment variable or default to localhost
  return process.env.NEXT_PUBLIC_APP_URL || 
         process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
         'http://localhost:3000';
}

export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  try {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/email`;
    
    console.log('📧 Sending email to:', url);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(options),
    });
    
    // Fix: Type the response
    const result = await response.json() as { message?: string; error?: string };
    
    if (response.ok) {
      console.log('✅ Email sent successfully:', result.message);
      return true;
    } else {
      console.error('❌ Failed to send email:', result.error);
      return false;
    }
  } catch (error) {
    console.error('❌ Error sending email:', error);
    return false;
  }
}

// Convenience functions for common email types
export async function sendWelcomeEmail(to: string, name: string, email?: string, slink?: string): Promise<boolean> {
  return sendEmail({
    template: 'welcome',
    to,
    data: {
      name,
      email: email || to,
      slink,
      date: new Date().toLocaleDateString(),
    },
  });
}

export async function sendPasswordResetEmail(to: string, name: string, otp: string, resetLink?: string): Promise<boolean> {
  return sendEmail({
    template: 'password-reset',
    to,
    data: {
      name,
      otp,
      link: resetLink,
    },
  });
}

export async function sendVerificationEmail(to: string, name: string, otp: string, verificationLink?: string): Promise<boolean> {
  return sendEmail({
    template: 'verification',
    to,
    data: {
      name,
      otp,
      link: verificationLink,
    },
  });
}

export async function sendContactFormEmail(
  fromEmail: string, 
  name: string, 
  subject: string, 
  message: string,
  adminEmail?: string
): Promise<boolean> {
  return sendEmail({
    template: 'contact',
    to: adminEmail || process.env.ADMIN_EMAIL || 'admin@yourdomain.com',
    data: {
      name,
      email: fromEmail,
      subject,
      message,
      date: new Date().toLocaleString(),
    },
  });
}

export async function sendOrderConfirmationEmail(
  to: string,
  name: string,
  orderId: string,
  amount: string
): Promise<boolean> {
  return sendEmail({
    template: 'order-confirmation',
    to,
    data: {
      name,
      orderId,
      amount,
      date: new Date().toLocaleString(),
    },
  });
}

// Test email connection
export async function testEmailConnection(): Promise<boolean> {
  try {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}/api/email`;
    
    const response = await fetch(url);
    // Fix: Type the response
    const result = await response.json() as { success?: boolean };
    return response.ok && result.success === true;
  } catch (error) {
    console.error('Error testing email connection:', error);
    return false;
  }
}