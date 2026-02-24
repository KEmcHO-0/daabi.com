const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Create transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // Email options
  const mailOptions = {
    from: `দাবি.com <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html
  };

  // Send email
  await transporter.sendMail(mailOptions);
};

// Email templates
const emailTemplates = {
  verifyEmail: (name, verificationUrl) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #f4f4f4; }
        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .button { display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📧 ইমেইল ভেরিফিকেশন</h1>
        </div>
        <div class="content">
          <h2>স্বাগতম, ${name}!</h2>
          <p>দাবি.com এ রেজিস্ট্রেশনের জন্য ধন্যবাদ। আপনার ইমেইল ভেরিফাই করতে নিচের বাটনে ক্লিক করুন:</p>
          <center>
            <a href="${verificationUrl}" class="button">ইমেইল ভেরিফাই করুন</a>
          </center>
          <p>এই লিংকটি ২৪ ঘণ্টা পর্যন্ত কার্যকর থাকবে।</p>
          <p>আপনি যদি রেজিস্ট্রেশন না করে থাকেন, এই ইমেইল উপেক্ষা করুন।</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} দাবি.com - SUST Student Demand System</p>
        </div>
      </div>
    </body>
    </html>
  `,

  resetPassword: (name, resetUrl) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #f4f4f4; }
        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .button { display: inline-block; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 পাসওয়ার্ড রিসেট</h1>
        </div>
        <div class="content">
          <h2>হ্যালো, ${name}!</h2>
          <p>আপনি পাসওয়ার্ড রিসেটের অনুরোধ করেছেন। নিচের বাটনে ক্লিক করুন:</p>
          <center>
            <a href="${resetUrl}" class="button">পাসওয়ার্ড রিসেট করুন</a>
          </center>
          <p>এই লিংকটি ১০ মিনিট পর্যন্ত কার্যকর থাকবে।</p>
          <p>আপনি যদি এই অনুরোধ না করে থাকেন, এই ইমেইল উপেক্ষা করুন।</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} দাবি.com - SUST Student Demand System</p>
        </div>
      </div>
    </body>
    </html>
  `,

  statusUpdate: (name, demandTitle, newStatus, statusBangla) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #f4f4f4; }
        .container { max-width: 600px; margin: 20px auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .status-badge { display: inline-block; padding: 10px 20px; border-radius: 20px; font-weight: bold; margin: 10px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📋 দাবির স্ট্যাটাস আপডেট</h1>
        </div>
        <div class="content">
          <h2>হ্যালো, ${name}!</h2>
          <p>আপনার দাবির স্ট্যাটাস আপডেট হয়েছে:</p>
          <p><strong>দাবি:</strong> ${demandTitle}</p>
          <p><strong>নতুন স্ট্যাটাস:</strong> <span class="status-badge">${statusBangla}</span></p>
          <p>বিস্তারিত দেখতে দাবি.com এ লগইন করুন।</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} দাবি.com - SUST Student Demand System</p>
        </div>
      </div>
    </body>
    </html>
  `
};

module.exports = { sendEmail, emailTemplates };
