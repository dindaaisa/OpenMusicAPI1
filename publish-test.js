require('dotenv').config();
const amqp = require('amqplib');

const QUEUE_NAME = process.env.EXPORT_QUEUE_NAME || 'export_playlists';

(async () => {
  try {
    const conn = await amqp.connect(process.env.RABBITMQ_SERVER);
    const ch = await conn.createChannel();
    await ch.assertQueue(QUEUE_NAME, { durable: true });

    const payload = { playlistId: 'playlist-xxxxx', targetEmail: 'your-email@example.com' };
    ch.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(payload)), { persistent: true });
    console.log('Message published:', payload);

    await ch.close();
    await conn.close();
  } catch (err) {
    console.error('Publish error:', err && err.message);
    process.exit(1);
  }
})();