const nodemailer = require('nodemailer');

class MailSender {
  constructor() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT || 465);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASSWORD;

    if (!host || !user || !pass) {
      throw new Error('SMTP env is missing. Check SMTP_HOST/SMTP_USER/SMTP_PASSWORD');
    }

    this._transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true only for 465
      auth: { user, pass },
    });
  }

  async sendEmail(targetEmail, subject, contentJsonString) {
    await this._transporter.sendMail({
      from: `"OpenMusic" <${process.env.SMTP_USER}>`,
      to: targetEmail,
      subject,
      text: 'Playlist export attached.',
      attachments: [
        {
          filename: 'playlist.json',
          content: Buffer.from(contentJsonString),
          contentType: 'application/json',
        },
      ],
    });
  }
}

module.exports = MailSender;
