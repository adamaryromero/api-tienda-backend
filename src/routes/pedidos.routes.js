import { Router } from "express";
import { guardarPedido, getPedidos } from "./controladores/pedidosctrl.js";

const router = Router();

router.post("/pedidos", guardarPedido);
router.get("/pedidos", getPedidos);

export default router;