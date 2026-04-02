import 'dotenv/config';
import { App } from './app';

console.log('Iniciando servidor');

const app = new App();

async function startServer() {
  try {
    await app.start();
  } catch (e) {
    console.error('Falló al iniciar servidor', e);
    process.exit(1);
  }
}

startServer();