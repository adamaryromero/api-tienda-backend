import { Router } from "express";
import { 
    getPedidos, 
    getPedidosxid, 
    postPedidos, 
    putPedidos, 
    deletePedidos 
} from "../controladores/pedidosctrl.js";

const router = Router();

router.get("/pedidos", getPedidos);
router.get("/pedidos/:id", getPedidosxid);
router.post("/pedidos", postPedidos);
router.put("/pedidos/:id", putPedidos);
router.patch("/pedidos/:id", putPedidos);
router.delete("/pedidos/:id", deletePedidos);

export default router;