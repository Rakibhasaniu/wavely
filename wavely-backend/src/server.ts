import { Server } from 'http';
import mongoose from 'mongoose';
import app from './app';
import config from './app/config';

let server: Server;

async function main() {
  try {
    await mongoose.connect(config.database_url as string);
    console.log('MongoDB connected successfully');

    server = app.listen(config.port, () => {
      console.log(`Wavely server running on port ${config.port}`);
    });
  } catch (err) {
    console.log(err);
  }
}

main();

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
  // Only shut down for critical errors (DB connection loss, etc.)
  // Request-level errors (e.g. Cloudinary upload failure) are handled
  // by catchAsync → globalErrorHandler and should NOT kill the server.
});

process.on('uncaughtException', () => {
  console.log(`😈 uncaughtException is detected , shutting down ...`);
  process.exit(1);
});
