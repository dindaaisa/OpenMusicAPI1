const amqp = require('amqplib');
require('dotenv').config();

(async () => {
  try {
    const conn = await amqp.connect(process.env.RABBITMQ_SERVER);
    const ch = await conn.createChannel();
    console.log('Connected to RabbitMQ and created channel OK');
    await ch.close();
    await conn.close();
  } catch (err) {
    console.error('RabbitMQ connection failed:', err.message || err);
    process.exit(1);
  }
})();