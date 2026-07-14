import { conmysql } from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const registrarUsuario = async(req, res)=>{
    try {
        const {usr_usuario, usr_clave, usr_nombre, usr_telefono, usr_correo, usr_activo} = req.body;

        const sal = await bcrypt.genSalt(10);
        const claveEncriptada = await bcrypt.hash(usr_clave, sal);

        const estadoUsuario = usr_activo !== undefined ? usr_activo : 1;

        await conmysql.query(
            'INSERT INTO usuarios (usr_usuario, usr_clave, usr_nombre, usr_telefono, usr_correo, usr_activo) VALUES (?, ?, ?, ?, ?, ?)',
            [usr_usuario, claveEncriptada, usr_nombre, usr_telefono, usr_correo, estadoUsuario]
        );

        res.status(201).json({message:'usuario registrado con exito'});
    } catch (error) {
        console.error(error);
        return res.status(500).json({message:'error al registrar usuario'});
    }
};

export const login = async (req, res) => {
    try {
        const { usr_usuario, usr_clave } = req.body;

        const [rows] = await conmysql.query('SELECT * FROM usuarios WHERE usr_usuario = ?', [usr_usuario]);
        
        if (rows.length === 0) {
            return res.status(401).json({message:'usuario o contraseña incorrectos'}); 
        }

        const usuario = rows[0];

        if (usuario.usr_activo === 0) {
            return res.status(403).json({ message: 'el usuario se encuentra inactivo' });
        }

        const claveValida = await bcrypt.compare(usr_clave, usuario.usr_clave);
        if (!claveValida) {
            return res.status(401).json({message:'usuario o contraseña incorrectos'});
        }

        const payload = { 
            id: usuario.usr_id, 
            usuario: usuario.usr_usuario,
            nombre: usuario.usr_nombre, 
            correo: usuario.usr_correo
        };
        
        const token = jwt.sign(payload, 'CLAVE_SECRETA_APPTIENDA', {expiresIn: '8h'});

        res.json({
            message: 'autenticacion exitosa',
            token: token
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: 'error en el inicio de sesion'});
    }
};


export const guardarTokenFCM = async (req, res) => {
    try {
        const { fcmToken } = req.body;
        const userId = req.usuario.id;

        if (!fcmToken) {
            return res.status(400).json({ error: 'Token FCM es requerido' });
        }

        const [result] = await conmysql.query(
            'UPDATE usuarios SET fcm_token = ? WHERE usr_id = ?',
            [fcmToken, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        res.json({ message: 'Token FCM guardado correctamente' });
    } catch (error) {
        console.error('Error al guardar token FCM:', error);
        res.status(500).json({ error: 'Error al guardar token' });
    }
};