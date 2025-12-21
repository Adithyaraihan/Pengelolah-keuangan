import nodemailer from "nodemailer";

const smtpPassword = process.env.SMTP_PASS.replace(/\s/g, "");
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: smtpPassword,
  },
});

export const sendVerificationEmail = async (
  toEmail,
  activationCode,
  fullName
) => {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify/?code=${activationCode}`;

  const mailOptions = {
    // Penting: FROM harus sesuai dengan SMTP_USER Anda (email.anda@gmail.com)
    from: `"${process.env.APP_NAME || "Your App"}" <${process.env.SMTP_USER}>`,
    to: toEmail,
    subject: "Verifikasi Akun Anda",
    html: `
            <h2>Halo, ${fullName},</h2>
            <p>Terima kasih telah mendaftar. Klik link di bawah untuk mengaktifkan akun Anda:</p>
            <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
                AKTIFKAN AKUN SAYA
            </a>
        `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email verifikasi berhasil dikirim ke:", toEmail);
  } catch (error) {
    console.error("Gagal mengirim email verifikasi menggunakan Gmail:", error);
    throw new Error(
      `Gagal mengirim email: ${error.message}. Cek App Password dan konfigurasi SMTP.`
    );
  }
};
