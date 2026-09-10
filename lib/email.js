import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  family: 4,

  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function sendVerificationOTP(email, otp) {
  try {
    await transporter.sendMail({
      from: `"CodeSpirit" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Your CodeSpirit Verification Code",

      text: `Your CodeSpirit verification code is ${otp}. This code expires in 10 minutes.`,

      html: `
        <div style="
          background:#020617;
          padding:40px 20px;
          font-family:Arial,sans-serif;
        ">
          <div style="
            max-width:500px;
            margin:auto;
            background:#0f172a;
            border:1px solid rgba(255,255,255,0.08);
            border-radius:16px;
            padding:35px;
            text-align:center;
            color:#dae2fd;
          ">

            <h1 style="color:#d2bbff;">
              CodeSpirit
            </h1>

            <p style="color:#94a3b8;">
              Verify your email to continue your journey.
            </p>

            <div style="
              margin:30px 0;
              padding:20px;
              background:#020617;
              border-radius:12px;
              border:1px solid rgba(124,58,237,0.4);
            ">

              <p style="
                color:#94a3b8;
                font-size:12px;
                letter-spacing:2px;
              ">
                VERIFICATION CODE
              </p>

              <div style="
                color:#d2bbff;
                font-size:36px;
                font-weight:bold;
                letter-spacing:10px;
              ">
                ${otp}
              </div>

            </div>

            <p style="color:#64748b;">
              This code will expire in 10 minutes.
            </p>

            <p style="
              color:#475569;
              font-size:12px;
              margin-top:25px;
            ">
              If you didn't create a CodeSpirit account,
              you can safely ignore this email.
            </p>

          </div>
        </div>
      `,
    });

    console.log("✅ OTP email sent to:", email);

    return true;

  } catch (error) {
    console.error("❌ EMAIL ERROR:", error);
    throw error;
  }
}