import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.log(`[EMAIL MOCK] To: ${to}, Subject: ${subject}`);
      return { success: true, mock: true };
    }

    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || 'library@example.com',
      to,
      subject,
      html,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email send failed:', error);
    return { success: false, error };
  }
}

export async function sendDueReminder(email: string, bookTitle: string, dueDate: string) {
  return sendEmail(
    email,
    `Due Reminder: "${bookTitle}"`,
    `<h2>Book Due Reminder</h2>
    <p>This is a reminder that your borrowed book <strong>"${bookTitle}"</strong> is due on <strong>${dueDate}</strong>.</p>
    <p>Please return it on time to avoid fines.</p>`
  );
}

export async function sendOverdueAlert(email: string, bookTitle: string, daysOverdue: number, fineAmount: number) {
  return sendEmail(
    email,
    `Overdue Alert: "${bookTitle}"`,
    `<h2>Book Overdue Alert</h2>
    <p>Your borrowed book <strong>"${bookTitle}"</strong> is <strong>${daysOverdue} days overdue</strong>.</p>
    <p>Current fine: <strong>₹${fineAmount.toFixed(2)}</strong></p>
    <p>Please return it as soon as possible.</p>`
  );
}
