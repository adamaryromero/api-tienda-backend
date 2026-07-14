import { Router } from "express";
import { verificarToken } from "../middlewares/auth.js";
import { guardarFCMToken, eliminarFCMToken } from "../controladores/fcmctrl.js";

const router = Router();

router.post('/fcm/guardar', verificarToken, guardarFCMToken);
router.delete('/fcm/eliminar', verificarToken, eliminarFCMToken);

export default router;