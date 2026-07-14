import { Router } from "express";
import { verificarToken } from '../middlewares/auth.js';
import { getPedidos, getPedidosxid, postInsertarPedido, putPedidos, deletePedidos } from "../controladores/pedidosctrl.js";
import { generarPDFPedido } from "../controladores/pedidospdfctrl.js";

const router = Router();

router.get("/pedidos", verificarToken, getPedidos);
router.get("/pedidos/:id", verificarToken, getPedidosxid);
router.post("/pedidos", verificarToken, postInsertarPedido);
router.put("/pedidos/:id", verificarToken, putPedidos);
router.patch("/pedidos/:id", verificarToken, putPedidos);
router.delete("/pedidos/:id", verificarToken, deletePedidos);
router.get("/pedidos/:id/pdf", verificarToken, generarPDFPedido);

export default router;