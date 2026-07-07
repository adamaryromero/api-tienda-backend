import { conmysql } from '../db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const registrarUsuario = async(req, res)=>{
    try {
        const {usr_usuario, usr_clave, usr_nombre, usr_telefono, usr_correo, usr_activo} = req.body;

        //encriptar la clave antes de enviarla a MySQL
        const sal = await bcrypt.genSalt(10);
        const claveEncriptada = await bcrypt.hash(usr_clave, sal);

        //si no envían usr_activo, por defecto le ponemos 1 (Activo)
        const estadoUsuario = usr_activo !== undefined ? usr_activo : 1;

        await conmysql.query(
            'INSERT INTO usuarios (usr_usuario, usr_clave, usr_nombre, usr_telefono, usr_correo, usr_activo) VALUES (?, ?, ?, ?, ?, ?)',
            [usr_usuario, claveEncriptada, usr_nombre, usr_telefono, usr_correo, estadoUsuario]
        );

        res.status(201).json({message:'usuario registrado con éxito'});
    } catch (error) {
        console.error(error);
        return res.status(500).json({message:'error al registrar usuario'});
    }
};

export const login = async (req, res) => {
    try {
        const { usr_usuario, usr_clave } = req.body;

        //se busca en la base de datos por el nombre de usuario
        console.log("1. Datos recibidos de Ionic:", req.body);
        const [rows] = await conmysql.query('SELECT * FROM usuarios WHERE usr_usuario = ?', [usr_usuario]);
        
        console.log("2. Usuario en MySQL:", rows.length > 0 ? rows[0] : "Usuario no encontrado");
        if (rows.length === 0) {
            return res.status(401).json({message:'usuario o contraseña incorrectos'}); 
        }

        const usuario = rows[0];

        //validar si el estado es inactivo
        if (usuario.usr_activo === 0) {
            return res.status(403).json({ message: 'el usuario se encuentra inactivo' });
        }

        //comparar la clave encriptada
        const claveValida = await bcrypt.compare(usr_clave, usuario.usr_clave);
        if (!claveValida) {
            return res.status(401).json({message:'usuario o contraseña incorrectos'});
        }

        //el token
        const payload = { 
            id: usuario.usr_id, 
            usuario: usuario.usr_usuario,
            nombre: usuario.usr_nombre, 
            correo: usuario.usr_correo
        };
        
        const token = jwt.sign(payload, 'CLAVE_SECRETA_APPTIENDA', {expiresIn: '8h'});

        res.json({
            message: 'autenticación exitosa',
            token: token
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({message: 'error en el inicio de sesión'});
    }
};

