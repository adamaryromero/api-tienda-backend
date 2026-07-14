import {Router} from 'express'
import {deleteClientes, getclientes, getclientesxid, patchClientes, postInsertarClientes, putClientes} from '../controladores/clientesctrl.js'
import {verificarToken} from '../middlewares/auth.js';
import {login, registrarUsuario, guardarTokenFCM} from '../controladores/authctrl.js'
const router=Router();

router.post('/login', login);
router.post('/registrar', registrarUsuario);
//armar nuestras rutas
router.get('/clientes', verificarToken, getclientes);
router.get('/clientes/:id', verificarToken, getclientesxid);
router.post('/clientes', verificarToken, postInsertarClientes);
router.put('/clientes/:id', verificarToken, putClientes);
router.patch('/clientes/:id', verificarToken, patchClientes);
router.delete('/clientes/:id', verificarToken, deleteClientes);
router.post('/save-token', verificarToken, guardarTokenFCM);

export default router