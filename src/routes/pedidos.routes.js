import { Router } from "express";
import { guardarPedido, getPedidos } from "./pedidosctrl.js";

const router = Router();

router.post("/pedidos", guardarPedido);
router.get("/pedidos", getPedidos);

export default router;