import { Router } from 'express';
import { getProductos, postProducto, putProducto, deleteProducto } from '../controladores/productosctrl.js';
import { verificarToken } from '../middlewares/auth.js';

const router = Router();

router.get('/productos', verificarToken, getProductos);
router.post('/productos', verificarToken, postProducto);
router.put('/productos/:id', verificarToken, putProducto);
router.delete('/productos/:id', verificarToken, deleteProducto);

export default router;