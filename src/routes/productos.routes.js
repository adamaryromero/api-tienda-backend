import { Router } from 'express';
import { getProductos, postProducto, putProducto, deleteProducto } from '../controladores/productosctrl.js';
import { verificarToken } from '../middlewares/auth.js';
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const nombreUnico = Date.now() + path.extname(file.originalname);
        cb(null, nombreUnico);
    }
});

const upload = multer({ storage: storage });
const router = Router();

router.get('/productos', verificarToken, getProductos);
router.post('/productos', verificarToken, upload.single('imagen'), postProducto);
router.put('/productos/:id', verificarToken, upload.single('imagen'), putProducto);
router.delete('/productos/:id', verificarToken, deleteProducto);

export default router;