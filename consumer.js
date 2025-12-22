require('dotenv').config();
const amqp = require('amqplib');
const nodemailer = require('nodemailer');
const pool = require('./src/validator/pool'); // sesuaikan jika path pool berbeda

const QUEUE_NAME = process.env.EXPORT_QUEUE_NAME || 'export_playlists';

async function getPlaylistFromDb(playlistId) {
  const playlistRes = await pool.query('SELECT id, name FROM playlists WHERE id = $1', [playlistId]);
  if (playlistRes.rowCount === 0) throw new Error('Playlist not found');

  const songsRes = await pool.query(
    `SELECT s.id, s.title, s.performer
     FROM playlistsongs ps
     JOIN songs s ON ps.song_id = s.id
     WHERE ps.playlist_id = $1`,
    [playlistId],
  );

  return {
    playlist: {
      id: playlistRes.rows[0].id,
      name: playlistRes.rows[0].name,
      songs: songsRes.rows,
    },
  };
}

async function createTransporter() {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  // fallback: Ethereal test account (development)
  const testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  console.log('Ethereal test account created; preview emails via returned URL in logs');
  return transporter;
}

(async () => {
  try {
    const conn = await amqp.connect(process.env.RABBITMQ_SERVER);
    const ch = await conn.createChannel();
    await ch.assertQueue(QUEUE_NAME, { durable: true });
    console.log(`Consumer ready, waiting messages on queue "${QUEUE_NAME}"...`);

    ch.consume(
      QUEUE_NAME,
      async (msg) => {
        if (!msg) return;
        try {
          const payload = JSON.parse(msg.content.toString());
          console.log('Message received:', payload);

          const { playlistId, targetEmail } = payload;
          const data = await getPlaylistFromDb(playlistId);
          const transporter = await createTransporter();

          const info = await transporter.sendMail({
            from: process.env.SMTP_USER || 'no-reply@example.com',
            to: targetEmail,
            subject: `Export playlist ${data.playlist.name}`,
            text: JSON.stringify(data, null, 2),
            attachments: [{ filename: `${playlistId}.json`, content: JSON.stringify(data) }],
          });

          const preview = nodemailer.getTestMessageUrl(info);
          if (preview) console.log('Email preview URL:', preview);

          console.log('Email sent:', info.messageId || info);
          ch.ack(msg);
        } catch (err) {
          console.error('Failed to process message:', err && err.message);
          // ch.nack(msg, false, true) untuk requeue, di sini kita drop agar tidak stuck
          ch.nack(msg, false, false);
        }
      },
      { noAck: false },
    );
  } catch (err) {
    console.error('Consumer error:', err && err.message);
    process.exit(1);
  }
})();