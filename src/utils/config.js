// utils/config.js

const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const config = {
  app: {
    host: process.env.HOST,
    port: process.env.PORT,
  },
  redis: {
    host: process.env.REDIS_SERVER, // Redis server hostname
  },
  s3: {
    bucketName: process.env.AWS_BUCKET_NAME, // AWS S3 bucket name
  },
  rabbitMq: {
    server: process.env.RABBITMQ_SERVER, // RabbitMQ server URL
  },
  smtp: {
    host: process.env.SMTP_HOST, // SMTP server hostname
    port: process.env.SMTP_PORT, // SMTP server port
    user: process.env.SMTP_USER, // SMTP user
    password: process.env.SMTP_PASSWORD, // SMTP password
  },
};

module.exports = config;
