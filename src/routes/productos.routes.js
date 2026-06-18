import { Router } from 'express';
import { getProductos, postProducto, putProducto, deleteProducto } from '../controladores/productosctrl.js';
import { verificarToken } from '../middlewares/auth.js';
import multer from 'multer';
//import path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
  cloud_name: 'deeebt81k', 
  api_key: '816345526847518',       
  api_secret: '5DWxsWHPAw3DrT_YqYSeAKCm50IT'  
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'tiendaproductos', 
    allowedFormats: ['jpg', 'png', 'jpeg', 'webp']
  },
});

const upload = multer({ storage: storage });
const router = Router();

router.get('/productos', verificarToken, getProductos);
router.post('/productos', verificarToken, upload.single('imagen'), postProducto);
router.put('/productos/:id', verificarToken, upload.single('imagen'), putProducto);
router.delete('/productos/:id', verificarToken, deleteProducto);

export default router;