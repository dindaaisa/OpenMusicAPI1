const amqp = require('amqplib');
const nodemailer = require('nodemailer');
const PlaylistService = require('../services/PlaylistService'); // Menggunakan PlaylistService untuk mengambil data playlist dari database

class RabbitMQConsumer {
  constructor() {
    this._conn = null;
    this._ch = null;
    this._queue = process.env.EXPORT_QUEUE_NAME || 'export_playlists'; // Nama queue sesuai dengan variabel lingkungan
  }

  // Koneksi ke RabbitMQ
  async connect(url) {
    if (this._ch) return;  // Jangan buat koneksi baru jika channel sudah ada
    this._conn = await amqp.connect(url);
    this._ch = await this._conn.createChannel();
    await this._ch.assertQueue(this._queue, { durable: true });
    console.log('RabbitMQConsumer connected to', url);
  }

  // Mengkonsumsi pesan dari RabbitMQ
  async consume() {
    await this._ch.consume(this._queue, async (msg) => {
      const { playlistId, targetEmail } = JSON.parse(msg.content.toString());

      // Ambil playlist dari database menggunakan PlaylistService
      const playlist = await PlaylistService.getPlaylistById(playlistId);

      if (!playlist) {
        console.log(`Playlist dengan ID ${playlistId} tidak ditemukan.`);
        this._ch.ack(msg); // Acknowledge meskipun playlist tidak ditemukan
        return;
      }

      // Kirimkan playlist via email menggunakan Nodemailer
      await this.sendEmail(targetEmail, playlist);

      // Acknowledge pesan setelah diproses
      this._ch.ack(msg);
    });
  }

  // Mengirimkan email dengan Nodemailer
  async sendEmail(targetEmail, playlist) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: targetEmail,
      subject: `Ekspor Playlist: ${playlist.name}`,
      text: JSON.stringify(playlist, null, 2) // Mengirimkan playlist dalam format JSON
    };

    try {
      await transporter.sendMail(mailOptions);
      console.log(`Email berhasil dikirim ke ${targetEmail}`);
    } catch (error) {
      console.error('Error saat mengirim email:', error);
    }
  }

  // Menutup koneksi ke RabbitMQ
  async close() {
    if (this._ch) await this._ch.close();
    if (this._conn) await this._conn.close();
  }
}

module.exports = new RabbitMQConsumer();
