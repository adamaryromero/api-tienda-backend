import admin from '../firebase.js';

export const enviarNotificacion = async (fcmToken, title, body) => {
    if (!admin) {
        console.log('Firebase no inicializado. Notificacion no enviada.');
        return null;
    }

    const message = {
        notification: {
            title: title,
            body: body,
        },
        token: fcmToken,
        android: {
            priority: 'high',
            notification: {
                sound: 'default'
            }
        }
    };

    try {
        const response = await admin.messaging().send(message);
        console.log('Notificacion enviada exitosamente');
        return response;
    } catch (error) {
        console.error('Error al enviar notificacion:', error);
        throw error;
    }
};

export const notificarNuevoPedido = async (pedidoId, nombreCliente, adminToken) => {
    const title = 'Nuevo Pedido';
    const body = `Pedido #${pedidoId} creado por ${nombreCliente}`;
    return await enviarNotificacion(adminToken, title, body);
};