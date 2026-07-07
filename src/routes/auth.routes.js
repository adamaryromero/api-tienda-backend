import { Router } from 'express';
import { login, registrarUsuario, guardarFCMToken } from '../controladores/authctrl.js';

const router = Router();

router.post('/login', login);
router.post('/registrar', registrarUsuario);
router.post('/guardar-fcm-token', guardarFCMToken);

export default router;