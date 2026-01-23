const nodemailer = require('nodemailer');

const createTransporter = () => {
  
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  } else {
    console.log('⚠️  Email service not configured. Using ethereal test account.');
    console.log('⚠️  Set EMAIL_SERVICE, EMAIL_USER, and EMAIL_PASSWORD in .env for production.');
    return null;
  }
};

exports.sendVerificationEmail = async (email, username, verificationToken) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {

      const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email/${verificationToken}`;
      console.log('\n📧 ===== EMAIL VERIFICATION =====');
      console.log(`To: ${email}`);
      console.log(`Username: ${username}`);
      console.log(`Verification URL: ${verificationUrl}`);
      console.log('================================\n');
      return { success: true, message: 'Email logged to console (dev mode)' };
    }

    const verificationUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify-email/${verificationToken}`;

    const mailOptions = {
      from: `"COOKit" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your COOKit Account',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #00ffff 0%, #ff00ff 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: white; margin: 0; font-size: 32px; text-shadow: 2px 2px 4px rgba(0,0,0,0.3); }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #00ffff 0%, #0080ff 100%); color: white; text-decoration: none; border-radius: 25px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚡ COOKit</h1>
            </div>
            <div class="content">
              <h2>Welcome to COOKit, ${username}! 🎉</h2>
              <p>Thank you for registering with COOKit, your ultimate cooking companion!</p>
              <p>To complete your registration and activate your account, please verify your email address by clicking the button below:</p>
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">Verify Email Address</a>
              </div>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #0080ff;">${verificationUrl}</p>
              <p><strong>This verification link will expire in 24 hours.</strong></p>
              <p>If you didn't create an account with COOKit, please ignore this email.</p>
              <p>Happy cooking! 🍳</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 COOKit. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Verification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    return { success: false, error: error.message };
  }
};

exports.sendWelcomeEmail = async (email, username) => {
  try {
    const transporter = createTransporter();
    
    if (!transporter) {
      console.log(`\n📧 Welcome email would be sent to: ${email} (${username})\n`);
      return { success: true, message: 'Email logged to console (dev mode)' };
    }

    const mailOptions = {
      from: `"COOKit" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Welcome to COOKit! 🎉',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #00ffff 0%, #ff00ff 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { color: white; margin: 0; font-size: 32px; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⚡ COOKit</h1>
            </div>
            <div class="content">
              <h2>Your Account is Activated! 🎉</h2>
              <p>Hi ${username},</p>
              <p>Your COOKit account has been successfully verified and activated!</p>
              <p>You can now:</p>
              <ul>
                <li>Browse thousands of recipes</li>
                <li>Create and share your own recipes</li>
                <li>Get help from our AI Cooking Assistant</li>
                <li>Connect with other food enthusiasts</li>
              </ul>
              <p>Start your culinary journey today!</p>
              <p>Happy cooking! 🍳</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Welcome email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};

