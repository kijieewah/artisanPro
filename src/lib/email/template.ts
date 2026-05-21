// lib/email/templates.ts
export interface EmailTemplateData {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
  link?: string;
  slink?: string;
  mlink?:string;
  otp?: string;
  orderId?: string;
  amount?: string;
  date?: string;
  // Add more fields as needed
}

// Base template function
const baseTemplate = (content: string, title?: string): string => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title || 'Your App'}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f8f9fa;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #ffffff;
        }
        .header {
            background-color: #1e293b;
            color: white;
            padding: 30px 20px;
            text-align: center;
            border-radius: 8px 8px 0 0;
        }
        .content {
            padding: 30px 20px;
            border-left: 1px solid #e5e5e5;
            border-right: 1px solid #e5e5e5;
        }
        .footer {
            background-color: #f8f9fa;
            padding: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
            border-radius: 0 0 8px 8px;
            border: 1px solid #e5e5e5;
            border-top: none;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #1e293b;
            color: white;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
        }
        .otp {
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            color: #1e293b;
            text-align: center;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 8px;
            margin: 20px 0;
        }
        .highlight {
            background-color: #f8f9fa;
            padding: 15px;
            border-left: 4px solid #1e293b;
            margin: 20px 0;
        }
        @media (max-width: 600px) {
            .container {
                padding: 10px;
            }
            .header, .content, .footer {
                padding: 20px 15px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${title || 'Qreta'}</h1>
        </div>
        <div class="content">
            ${content}
        </div>
        <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Qreta. All rights reserved.</p>
            <p>This email was sent to you because you're registered with Qreta.</p>
            <p>If you didn't request this email, please ignore it or contact support.</p>
        </div>
    </div>
</body>
</html>
`;

// Welcome email template
export const welcomeEmailTemplate = (data: EmailTemplateData): { subject: string; html: string } => {
  const subject = `Welcome to Qreta, ${data.name || 'there'}!`;
  const content = `
    <h2>Hi ${data.name},</h2>
   
    <p>Welcome to Qreta — we’re happy you’re here.</p>
    <p>Running a business shouldn’t be stressful. Qreta helps you manage everything with ease.</p>

     <h2>Your Online Business Space </h2>
      <p>With Qreta, you get a customizable online presence for your store, restaurant, or service business. Your link is fully brandable — add it to your social profiles so customers can order, book, or explore your services anytime, without needing to message you first.</p>
     <p>Qreta also helps you manage products, services, menus, bookings, and promotions with ease.</p>
      
         <h2>Staying Organized </h2>
      <p>Qreta automatically tracks everything — orders, bookings, inventory, menus, services, customers, and payments. You can also add manual records whenever needed.</p>
     <p>If a customer starts a cart, order, or booking but doesn’t complete it, Qreta notifies you — so you can follow up and close the sale.</p>

      <h2>Getting Paid</h2>
      <p>Qreta makes payment collection simple. Customers can place orders or bookings directly through your WhatsApp, and you can receive payments instantly through your storefront, booking page, invoices, or payment links.</p>
     <p>You can also activate your Qreta Wallet to receive and manage payments securely. All payments go into your wallet, and you can withdraw anytime.</p>


    <div class="highlight">
        <p><strong>Your Account Details:</strong></p>
        <p>Email: ${data.email}</p>
         <p>Site Link: ${data.slink}</p>
           
        <p>Registered on: ${data.date || new Date().toLocaleDateString()}</p>
    </div>
    
    <p>To start selling, you can:</p>
    <ul>
        <li>Upload your products</li>
        <li>Customize your space </li>
         <li>Share your store link / site </li>
        <li>Contact support if you need help</li>
    </ul>
    
    <p>If you have any questions, feel free to reply to this email.</p>
    <p>Best regards,<br>The Qreta Team</p>
  `;

  return {
    subject,
    html: baseTemplate(content, 'Welcome to Qreta'),
  };
};

// Password reset email template
export const passwordResetEmailTemplate = (data: EmailTemplateData): { subject: string; html: string } => {
  const subject = 'Reset Your Password';
  const content = `
    <h2>Password Reset Request</h2>
    <p>Hi ${data.name || 'there'},</p>
    <p>We received a request to reset your password for your Your App account.</p>
    
    <div class="otp">
        ${data.otp}
    </div>
    
    <p>Enter this OTP in the app to reset your password. This OTP will expire in 10 minutes.</p>
    
    ${data.link ? `
    <p>Or click the button below to reset your password:</p>
    <a href="${data.link}" class="button">Reset Password</a>
    ` : ''}
    
    <p>If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
    <p>Best regards,<br>The Your App Team</p>
  `;

  return {
    subject,
    html: baseTemplate(content, 'Password Reset'),
  };
};

// OTP/Verification email template
export const verificationEmailTemplate = (data: EmailTemplateData): { subject: string; html: string } => {
  const subject = 'Verify Your Email Address';
  const content = `
    <h2>Email Verification</h2>
    <p>Hi ${data.name || 'there'},</p>
    <p>Thank you for signing up! Please verify your email address to complete your registration.</p>
    
    <div class="otp">
        ${data.otp}
    </div>
    
    <p>Enter this OTP in the app to verify your email address. This OTP will expire in 10 minutes.</p>
    
    ${data.link ? `
    <p>Or click the button below to verify your email:</p>
    <a href="${data.link}" class="button">Verify Email</a>
    ` : ''}
    
    <p>If you didn't create an account with Your App, please ignore this email.</p>
    <p>Best regards,<br>The Your App Team</p>
  `;

  return {
    subject,
    html: baseTemplate(content, 'Email Verification'),
  };
};

// Contact form email template
export const contactEmailTemplate = (data: EmailTemplateData): { subject: string; html: string } => {
  const subject = `New Contact Form Submission: ${data.subject}`;
  const content = `
    <h2>New Contact Form Message</h2>
    <p><strong>From:</strong> ${data.name} (${data.email})</p>
    <p><strong>Subject:</strong> ${data.subject}</p>
    
    <div class="highlight">
        <p><strong>Message:</strong></p>
        <p>${data.message}</p>
    </div>
    
    <p><strong>Received:</strong> ${data.date || new Date().toLocaleString()}</p>
  `;

  return {
    subject,
    html: baseTemplate(content, 'Contact Form Submission'),
  };
};

// Order confirmation email template
export const orderConfirmationEmailTemplate = (data: EmailTemplateData): { subject: string; html: string } => {
  const subject = `Order Confirmation #${data.orderId}`;
  const content = `
    <h2>Order Confirmed! 🎉</h2>
    <p>Hi ${data.name},</p>
    <p>Thank you for your order! We've received your payment and your order is being processed.</p>
    
    <div class="highlight">
        <p><strong>Order Details:</strong></p>
        <p>Order ID: ${data.orderId}</p>
        <p>Amount: ${data.amount}</p>
        <p>Date: ${data.date}</p>
    </div>
    
    <p>We'll send you another email once your order ships.</p>
    <p>You can track your order anytime from your account dashboard.</p>
    
    <p>If you have any questions about your order, reply to this email.</p>
    <p>Best regards,<br>The Your App Team</p>
  `;

  return {
    subject,
    html: baseTemplate(content, 'Order Confirmation'),
  };
};

// Newsletter subscription template
export const newsletterSubscriptionTemplate = (data: EmailTemplateData): { subject: string; html: string } => {
  const subject = 'Welcome to Our Newsletter!';
  const content = `
    <h2>Welcome to Our Newsletter! 📰</h2>
    <p>Hi ${data.name || 'there'},</p>
    <p>Thank you for subscribing to our newsletter! You'll now receive:</p>
    <ul>
        <li>Latest updates about our app</li>
        <li>Tips and tutorials</li>
        <li>Exclusive offers and promotions</li>
        <li>Industry news and insights</li>
    </ul>
    
    <p>We promise not to spam you and you can unsubscribe anytime.</p>
    
    <p>Best regards,<br>The Your App Team</p>
  `;

  return {
    subject,
    html: baseTemplate(content, 'Newsletter Subscription'),
  };
};

// Account update notification template
export const accountUpdateTemplate = (data: EmailTemplateData): { subject: string; html: string } => {
  const subject = 'Important: Your Account Has Been Updated';
  const content = `
    <h2>Account Updated</h2>
    <p>Hi ${data.name},</p>
    <p>This is to notify you that your account information has been successfully updated.</p>
    
    <div class="highlight">
        <p><strong>Update Details:</strong></p>
        <p>Date: ${data.date || new Date().toLocaleString()}</p>
        <p>Changes made to: ${data.subject || 'account information'}</p>
    </div>
    
    <p>If you did not make these changes, please contact our support team immediately.</p>
    
    <p>Best regards,<br>The Your App Team</p>
  `;

  return {
    subject,
    html: baseTemplate(content, 'Account Update'),
  };
};