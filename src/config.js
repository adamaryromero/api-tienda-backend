import { config } from 'dotenv'
config()

export const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_por_defecto';
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
export const BD_HOST=process.env.BD_HOST || 'localhost'
export const BD_DATABASE=process.env.BD_DATABASE || 'base2026'
export const DB_USER=process.env.DB_USER || 'root'
export const DB_PASSWORD=process.env.DB_PASSWORD ||''
export const DB_PORT=process.env.DB_PORT || 3306
export const PORT=process.env.PORT || 3000
