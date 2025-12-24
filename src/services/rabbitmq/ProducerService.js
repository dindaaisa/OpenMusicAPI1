const amqp = require('amqplib');

class ProducerService {
  constructor() {
    this._connection = null;
    this._channel = null;
  }

  async init() {
    if (!this._connection) {
      this._connection = await amqp.connect(process.env.RABBITMQ_SERVER);
      this._channel = await this._connection.createChannel();
    }
  }

  async sendMessage(queue, message) {
    await this.init();
    await this._channel.assertQueue(queue, { durable: true });
    await this._channel.sendToQueue(queue, Buffer.from(message), {
      persistent: true,
    });
  }

  async close() {
    if (this._channel) await this._channel.close();
    if (this._connection) await this._connection.close();
  }
}

module.exports = ProducerService;