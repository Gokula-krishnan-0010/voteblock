import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.EMAIL_PORT),
  // 587 - false, 465 - true
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD
  },
});

export async function sendOTP(email, otp) {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Login OTP",
      text: `OTP: ${otp} (valid for 5 minutes)`,
    });
    console.log(`OTP sent to "${email}"`)
  }
  catch(err) {
    console.log(`Error sending OTP:`, err);
    throw err;
  }
}
