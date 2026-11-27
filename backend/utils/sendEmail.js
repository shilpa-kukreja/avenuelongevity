import nodemailer from "nodemailer";

const formatUSD = (value) => {
  const num = Number(value || 0);
  return `$${num.toLocaleString("en-US", {
    minimumFractionDigits: num % 1 !== 0 ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
};

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;

  transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 10000,
  });

  return transporter;
};

const sendEmail = async (options = {}) => {
  const mailer = getTransporter();

  let subject = "Avenue Longevity Retreat";
  let htmlContent = "";

  // 1. Password Reset Email
  if (options.type === "password_reset") {
    subject = "Avenue Longevity - Password Reset Request";
    htmlContent = `
      <h2 style="font-family: serif; font-weight: normal; color: #F5F0E8;">Password Reset Request</h2>
      <p style="color: #A89C8C; font-size: 14px; line-height: 1.6;">You are receiving this email because you requested a password reset for your Avenue account.</p>
      <a href="${options.resetUrl}" style="display: inline-block; background-color: #C9944A; color: #080906; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin-top: 20px;">Reset Password</a>
      <p style="color: #A89C8C; font-size: 12px; margin-top: 30px;">If you did not request this, please ignore this email.</p>
    `;
  }

  // 2. Email OTP Verification
  if (options.type === "email_otp") {
    subject = `${options.otp} is your Avenue Longevity Retreat verification code`;
    htmlContent = `
      <h2 style="font-family: serif; font-weight: normal; color: #F5F0E8;">Verify Your Email</h2>
      <p style="color: #A89C8C; font-size: 14px; line-height: 1.6;">
        Hi ${options.name || "Guest"}, enter this 6-digit code to activate your account:
      </p>
      <div style="margin: 24px 0; padding: 16px; text-align: center; background: #1A1C18; border: 1px solid #C9944A66; border-radius: 12px; font-family: monospace; font-size: 30px; letter-spacing: 8px; color: #C9944A; font-weight: bold;">
        ${options.otp}
      </div>
      <p style="color: #A89C8C; font-size: 12px;">
        This code expires in 10 minutes. If you didn’t request this, you can safely ignore this email.
      </p>
    `;
  }

  // 3. Booking Confirmation Email
  if (options.type === "booking_confirm") {
    const b = options.booking;
    subject = `Booking Confirmed: ${b.serviceName} - Avenue Longevity`;
    htmlContent = `
      <h2 style="font-family: serif; font-weight: normal; color: #F5F0E8;">Your Ritual is Confirmed</h2>
      <p style="color: #A89C8C; font-size: 14px; line-height: 1.6;">Hi ${b.customerName}, your booking at Avenue Longevity Retreat is confirmed.</p>
      
      <div style="background: #1A1C18; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: left;">
        <p style="margin: 5px 0; color: #C9944A; font-size: 10px; text-transform: uppercase; letter-spacing: 2px;">Booking Details</p>
        <p style="margin: 10px 0; color: white;"><strong>Service:</strong> ${b.serviceName}</p>
        <p style="margin: 5px 0; color: white;"><strong>Date:</strong> ${b.date}</p>
        <p style="margin: 5px 0; color: white;"><strong>Time:</strong> ${b.time}</p>
        <p style="margin: 5px 0; color: white;"><strong>Guests:</strong> ${b.guests}</p>
        <p style="margin: 10px 0; color: white;"><strong>Total Paid:</strong> ${formatUSD(b.totalAmount)}</p>
      </div>
      <a href="${process.env.FRONTEND_URL}/dashboard" style="display: inline-block; background-color: #C9944A; color: #080906; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin-top: 20px;">View in Dashboard</a>
    `;
  }

  // 4. Status Update Email
  if (options.type === "status_update") {
    const b = options.booking;
    subject = `Booking Update: ${b.status} - Avenue Longevity`;
    htmlContent = `
      <h2 style="font-family: serif; font-weight: normal; color: #F5F0E8;">Booking Status Updated</h2>
      <p style="color: #A89C8C; font-size: 14px; line-height: 1.6;">Hi ${b.customerName}, the status of your booking for <strong>${b.serviceName}</strong> has been updated to <strong style="color: #C9944A;">${b.status}</strong>.</p>
      <p style="color: #A89C8C; font-size: 14px;">Date: ${b.date} at ${b.time}</p>
    `;
  }

  // 5. Purchase Receipt (Packages & Memberships)
  if (options.type === "purchase_receipt") {
    const t = options.transaction;
    subject = `Receipt for your ${t.itemType} purchase - Avenue Longevity`;
    htmlContent = `
      <h2 style="font-family: serif; font-weight: normal; color: #F5F0E8;">Thank you for your purchase!</h2>
      <p style="color: #A89C8C; font-size: 14px; line-height: 1.6;">Hi ${t.customerName}, your order has been successfully processed.</p>
      
      <div style="background: #1A1C18; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: left;">
        <p style="margin: 5px 0; color: #C9944A; font-size: 10px; text-transform: uppercase; letter-spacing: 2px;">Receipt Details</p>
        <p style="margin: 10px 0; color: white;"><strong>Item:</strong> ${t.itemName}</p>
        <p style="margin: 5px 0; color: white;"><strong>Type:</strong> ${t.itemType}</p>
        <p style="margin: 5px 0; color: white;"><strong>Total Paid:</strong> ${formatUSD(t.amount)}</p>
        ${t.billingCycle && t.billingCycle !== "None" ? `<p style="margin: 5px 0; color: white;"><strong>Billing:</strong> ${t.billingCycle}</p>` : ""}
      </div>
      <a href="${process.env.FRONTEND_URL}/dashboard" style="display: inline-block; background-color: #C9944A; color: #080906; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin-top: 20px;">View in Dashboard</a>
    `;
  }

  // 6. Contact Form - Admin Notification
  if (options.type === "contact_admin") {
    const m = options.message;
    subject = `New Inquiry: ${m.subject} from ${m.name}`;
    htmlContent = `
      <h2 style="font-family: serif; font-weight: normal; color: #F5F0E8;">New Contact Inquiry</h2>
      <p style="color: #A89C8C; font-size: 14px;">You have received a new message from your website.</p>
      <div style="background: #1A1C18; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: left;">
        <p style="margin: 5px 0; color: white;"><strong>Name:</strong> ${m.name}</p>
        <p style="margin: 5px 0; color: white;"><strong>Email:</strong> ${m.email}</p>
        <p style="margin: 5px 0; color: white;"><strong>Phone:</strong> ${m.phone || "N/A"}</p>
        <p style="margin: 5px 0; color: white;"><strong>Subject:</strong> ${m.subject}</p>
        <hr style="border-color: #333; margin: 15px 0;" />
        <p style="color: #E3D9C9; font-style: italic;">"${m.message}"</p>
      </div>
      <a href="${process.env.FRONTEND_URL}/admin/messages" style="display: inline-block; background-color: #C9944A; color: #080906; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 12px; letter-spacing: 2px; text-transform: uppercase; margin-top: 10px;">View in Admin Panel</a>
    `;
  }

  // 7. Contact Form - User Confirmation
  if (options.type === "contact_user") {
    const m = options.message;
    subject = "We received your inquiry - Avenue Longevity";
    htmlContent = `
      <h2 style="font-family: serif; font-weight: normal; color: #F5F0E8;">We've received your message</h2>
      <p style="color: #A89C8C; font-size: 14px; line-height: 1.6;">Hi ${m.name}, thank you for reaching out to Avenue Longevity Retreat. Our concierge team will review your inquiry and get back to you within 24 hours.</p>
      <div style="background: #1A1C18; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: left;">
        <p style="margin: 5px 0; color: #C9944A; font-size: 10px; text-transform: uppercase; letter-spacing: 2px;">Your Message</p>
        <p style="margin: 10px 0; color: white;"><strong>Subject:</strong> ${m.subject}</p>
        <p style="color: #E3D9C9; font-style: italic;">"${m.message}"</p>
      </div>
    `;
  }

  // 8. Subscriber - Admin Notification
  if (options.type === "subscriber_admin") {
    const s = options.subscriber;
    subject = `New Subscriber: ${s.email}`;
    htmlContent = `
      <h2 style="font-family: serif; font-weight: normal; color: #F5F0E8;">New Subscriber</h2>
      <p style="color: #A89C8C; font-size: 14px;">You have a new subscriber for your newsletter.</p>
      <div style="background: #1A1C18; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: left;">
        <p style="margin: 5px 0; color: white;"><strong>Email:</strong> ${s.email}</p>
      </div>
    `;
  }

  // 9. Subscriber - User Confirmation
  if (options.type === "subscriber_user") {
    subject = "Thank you for subscribing - Avenue Longevity";
    htmlContent = `
      <h2 style="font-family: serif; font-weight: normal; color: #F5F0E8;">Subscription Confirmed</h2>
      <p style="color: #A89C8C; font-size: 14px; line-height: 1.6;">Hi, thank you for subscribing to Avenue Longevity Retreat's newsletter. You'll now receive updates on longevity tips and exclusive offers.</p>
    `;
  }

  const fromName = process.env.FROM_NAME || "Avenue Longevity Retreat";
  const fromEmail = process.env.FROM_EMAIL || process.env.SMTP_EMAIL;

  const message = {
    from: `${fromName} <${fromEmail}>`,
    to: options.email,
    subject,
    html: `
      <div style="background-color: #080906; color: #ffffff; font-family: sans-serif; padding: 40px; text-align: center;">
        <h1 style="color: #C9944A; font-family: serif; font-weight: normal;">AVENUE</h1>
        <p style="font-size: 10px; letter-spacing: 3px; color: #C9944A; text-transform: uppercase; margin-bottom: 30px;">Longevity Retreat</p>
        <div style="background-color: #121310; padding: 30px; border-radius: 10px; border: 1px solid #C9944A33;">
          ${htmlContent}
        </div>
      </div>
    `,
  };

  await mailer.sendMail(message);
};

export default sendEmail;