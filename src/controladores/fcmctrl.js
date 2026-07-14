import { conmysql } from "../db.js";

export const guardarFCMToken = async (req, res) => {
    try {
        const { fcm_token } = req.body;
        const usr_id = req.usuario.id;

        if (!fcm_token) {
            return res.status(400).json({ ok: false, message: "Token FCM es requerido" });
        }

        await conmysql.query(
            'UPDATE usuarios SET fcm_token = ? WHERE usr_id = ?',
            [fcm_token, usr_id]
        );

        res.json({ ok: true, message: "Token FCM guardado correctamente" });
    } catch (error) {
        console.error("Error al guardar token FCM:", error);
        res.status(500).json({ ok: false, message: "Error al guardar token FCM" });
    }
};

export const eliminarFCMToken = async (req, res) => {
    try {
        const usr_id = req.usuario.id;
        await conmysql.query(
            'UPDATE usuarios SET fcm_token = NULL WHERE usr_id = ?',
            [usr_id]
        );
        res.json({ ok: true, message: "Token FCM eliminado" });
    } catch (error) {
        console.error("Error al eliminar token FCM:", error);
        res.status(500).json({ ok: false, message: "Error al eliminar token" });
    }
};