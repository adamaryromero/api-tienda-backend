import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//leer el archivo de credenciales
const serviceAccount = JSON.parse(
  readFileSync(join(__dirname, '../../firebase-service-account.json'), 'utf8')
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export const sendPushNotification = async (token, title, body, data = {}) => {
  try {
    const message = {
      notification: {
        title,
        body,
        sound: 'default'
      },
      data: data,
      token: token
    };

    const response = await admin.messaging().send(message);
    console.log('Notificación enviada:', response);
    return response;
  } catch (error) {
    console.error('Error al enviar notificación:', error);
    throw error;
  }
};

export default admin;