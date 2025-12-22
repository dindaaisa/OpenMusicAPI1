const amqp = require('amqplib');

class RabbitMQProducer {
  constructor() {
    this._conn = null;
    this._ch = null;
    this._queue = process.env.EXPORT_QUEUE_NAME || 'export_playlists';
  }

  async connect(url) {
    if (this._ch) return;
    this._conn = await amqp.connect(url);
    this._ch = await this._conn.createChannel();
    await this._ch.assertQueue(this._queue, { durable: true });
    console.log('RabbitMQProducer connected to', url);
  }

  async send(payload) {
    if (!this._ch) throw new Error('Producer channel not initialized');
    this._ch.sendToQueue(this._queue, Buffer.from(JSON.stringify(payload)), { persistent: true });
  }

  async close() {
    if (this._ch) await this._ch.close();
    if (this._conn) await this._conn.close();
  }
}

module.exports = new RabbitMQProducer();