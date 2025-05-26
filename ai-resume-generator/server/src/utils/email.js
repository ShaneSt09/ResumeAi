import nodemailer from 'nodemailer';
import ErrorResponse from './errorResponse.js';
import { google } from 'googleapis';
const OAuth2 = google.auth.OAuth2;

// Create a reusable transporter object using the default SMTP transport
let transporter;

// Function to create a reusable transporter object
export const createTransporter = async () => {
  try {
    // If we're using Gmail with OAuth2
    if (process.env.EMAIL_SERVICE === 'gmail' && process.env.EMAIL_CLIENT_ID) {
      const oauth2Client = new OAuth2(
        process.env.EMAIL_CLIENT_ID,
        process.env.EMAIL_CLIENT_SECRET,
        'https://developers.google.com/oauthplayground'
      );

      oauth2Client.setCredentials({
        refresh_token: process.env.EMAIL_REFRESH_TOKEN
      });

      const accessToken = await new Promise((resolve, reject) => {
        oauth2Client.getAccessToken((err, token) => {
          if (err) {
            console.error('Failed to create access token:', err);
            reject('Failed to create access token');
          }
          resolve(token);
        });
      });

      transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          type: 'OAuth2',
          user: process.env.EMAIL_USERNAME,
          clientId: process.env.EMAIL_CLIENT_ID,
          clientSecret: process.env.EMAIL_CLIENT_SECRET,
          refreshToken: process.env.EMAIL_REFRESH_TOKEN,
          accessToken: accessToken,
        },
      });
    } else {
      // For other SMTP services
      transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT || 587,
        secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      });
    }

    // Verify connection configuration
    await transporter.verify();
    console.log('Server is ready to take our messages');
    return transporter;
  } catch (error) {
    console.error('Error creating email transporter:', error);
    throw new Error('Failed to create email transporter');
  }
};

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text email body
 * @param {string} [options.html] - HTML email body (optional)
 * @returns {Promise<Object>} Result of the email sending operation
 */
export const sendEmail = async ({ to, subject, text, html }) => {
  try {
    // Ensure transporter is created
    if (!transporter) {
      await createTransporter();
    }

    // Setup email data
    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'AI Resume Generator'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USERNAME}>`,
      to,
      subject,
      text,
      html: html || text, // Use HTML if provided, otherwise fallback to text
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Message sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new ErrorResponse('Email could not be sent', 500);
  }
};

/**
 * Send a password reset email
 * @param {string} to - Recipient email address
 * @param {string} resetToken - Password reset token
 * @returns {Promise<Object>} Result of the email sending operation
 */
export const sendPasswordResetEmail = async (to, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  const subject = 'Password Reset Request';
  const text = `You are receiving this email because you (or someone else) has requested a password reset.\n\nPlease make a PUT request to:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4a6baf;">Password Reset Request</h2>
      <p>You are receiving this email because you (or someone else) has requested a password reset.</p>
      <p>Please click the button below to reset your password:</p>
      <div style="margin: 25px 0;">
        <a href="${resetUrl}" style="background-color: #4a6baf; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Reset Password</a>
      </div>
      <p>Or copy and paste this link into your browser:</p>
      <p><a href="${resetUrl}" style="color: #4a6baf; word-break: break-all;">${resetUrl}</a></p>
      <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>
      <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;">
      <p style="font-size: 12px; color: #666;">This email was sent to ${to} because you are a registered user of ${process.env.APP_NAME || 'AI Resume Generator'}.</p>
    </div>
  `;

  return sendEmail({ to, subject, text, html });
};

/**
 * Send a welcome email
 * @param {string} to - Recipient email address
 * @param {string} name - User's name
 * @returns {Promise<Object>} Result of the email sending operation
 */
export const sendWelcomeEmail = async (to, name) => {
  const subject = 'Welcome to AI Resume Generator';
  const text = `Welcome to AI Resume Generator, ${name || 'there'}!\n\nThank you for signing up. We're excited to help you create amazing resumes.`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4a6baf;">Welcome to AI Resume Generator, ${name || 'there'}! 👋</h2>
      <p>Thank you for signing up. We're excited to help you create amazing resumes that stand out.</p>
      <p>Get started by creating your first resume or explore our templates to find the perfect design for your needs.</p>
      <div style="margin: 30px 0; text-align: center;">
        <a href="${process.env.CLIENT_URL}/dashboard" style="background-color: #4a6baf; color: white; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px;">Get Started</a>
      </div>
      <p>If you have any questions, feel free to reply to this email.</p>
      <p>Best regards,<br>The AI Resume Generator Team</p>
      <hr style="border: none; border-top: 1px solid #eaeaea; margin: 20px 0;">
      <p style="font-size: 12px; color: #666;">This email was sent to ${to} as part of your ${process.env.APP_NAME || 'AI Resume Generator'} account.</p>
    </div>
  `;

  return sendEmail({ to, subject, text, html });
}

export { sendEmail, sendPasswordResetEmail, sendWelcomeEmail, createTransporter };
