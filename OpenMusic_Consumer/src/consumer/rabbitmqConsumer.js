require('dotenv').config();
const amqp = require('amqplib');

const MailSender = require('./MailSender');
const PlaylistService = require('../services/PlaylistService');

const QUEUE = 'export:playlists';

const init = async () => {
  const rabbitUrl = process.env.RABBITMQ_SERVER;
  if (!rabbitUrl) throw new Error('RABBITMQ_SERVER env is missing');

  const connection = await amqp.connect(rabbitUrl);
  const channel = await connection.createChannel();

  await channel.assertQueue(QUEUE, { durable: true });

  const mailSender = new MailSender();
  const playlistService = new PlaylistService();

  console.log(`✅ RabbitMQConsumer connected to ${rabbitUrl}`);
  console.log(`📥 Waiting messages on queue "${QUEUE}"...`);

  channel.consume(QUEUE, async (msg) => {
    if (!msg) return;

    try {
      const payload = JSON.parse(msg.content.toString());
      const { playlistId, targetEmail } = payload;

      const playlist = await playlistService.getPlaylistWithSongs(playlistId);

      const jsonExport = JSON.stringify(
        { playlist: { id: playlist.id, name: playlist.name, songs: playlist.songs } },
        null,
        2
      );

      await mailSender.sendEmail(
        targetEmail,
        `Export Playlist: ${playlist.name}`,
        jsonExport
      );

      channel.ack(msg);
      console.log(`📧 Export sent to ${targetEmail}`);
    } catch (err) {
      // supaya message tidak nyangkut terus2an, kita drop (no requeue)
      console.error('❌ Export failed:', err.message);
      channel.nack(msg, false, false);
    }
  });
};

init();
