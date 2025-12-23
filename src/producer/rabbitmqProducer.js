const amqp = require('amqplib');

class RabbitMQProducer {
  constructor() {
    this._conn = null;
    this._ch = null;
    this._queue = process.env.EXPORT_QUEUE_NAME || 'export_playlists'; // Menggunakan queue dari environment variable
  }

  // Koneksi ke RabbitMQ
  async connect(url) {
    if (this._ch) return;  // Jangan buka koneksi jika sudah ada
    try {
      this._conn = await amqp.connect(url);
      this._ch = await this._conn.createChannel();
      await this._ch.assertQueue(this._queue, { durable: true });  // Pastikan queue durable
      console.log('RabbitMQProducer connected to', url);
    } catch (err) {
      console.error('Error connecting to RabbitMQ:', err);
      throw err;  // Lempar error jika gagal koneksi
    }
  }

  // Mengirim pesan ke RabbitMQ
  async send(payload) {
    try {
      if (!payload.playlistId || !payload.targetEmail) {
        throw new Error('Payload harus berisi playlistId dan targetEmail');
      }

      if (!this._ch) throw new Error('Producer channel not initialized');
      
      console.log('Sending payload to RabbitMQ:', payload);  // Log payload untuk verifikasi
      this._ch.sendToQueue(this._queue, Buffer.from(JSON.stringify(payload)), { persistent: true });
    } catch (err) {
      console.error('Error sending to RabbitMQ:', err);
      throw err;  // Lempar error agar bisa ditangani lebih lanjut
    }
  }

  // Menutup koneksi RabbitMQ
  async close() {
    try {
      if (this._ch) await this._ch.close();
      if (this._conn) await this._conn.close();
    } catch (err) {
      console.error('Error closing RabbitMQ connection:', err);
    }
  }
}

module.exports = new RabbitMQProducer();
