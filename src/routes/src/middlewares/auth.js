import jwt from 'jsonwebtoken';

export const verificarToken = (req, res, next) => {
    //recibir el token desde los headers 
    const authHeader = req.headers['authorization'];
    
    //si no hay token, denegamos el acceso
    if (!authHeader) {
        return res.status(403).json({ message: 'No tienes permiso. Envía un token.' });
    }

    //extraer el token (viene como "Bearer eyJhbG...")
    const token = authHeader.split(' ')[1]; 

    //verificar si es válido usando una clave secreta
    jwt.verify(token, 'CLAVE_SECRETA_APPTIENDA', (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Token inválido o expirado' });
        }
        req.usuario = decoded;
        next();
    });
};