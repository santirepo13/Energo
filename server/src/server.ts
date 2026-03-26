import { App } from './app';

console.log('Starting server');

const app = new App();

async function startServer() {
  try {
    await app.start();
  } catch (e) {
    console.error('Failed to start server', e);
    process.exit(1);
  }
}

startServer();