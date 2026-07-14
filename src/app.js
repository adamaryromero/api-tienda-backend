import express from 'express'
import cors from 'cors';
import './firebase.js';
import clientesRoutes from './routes/clientes.routes.js'
import productosRoutes from './routes/productos.routes.js';
import pedidosRoutes from './routes/pedidos.routes.js';
import fcmRoutes from './routes/fcm.routes.js';

const app=express();
const corsOptions={
origin:'*',
methods:['GET','POST','PUT','PATCH','DELETE'],
credentials:true
}

app.use(cors(corsOptions)); //habilitar los cors
app.use(express.json());//para que interprete los objetos json

//rutas
app.use('/api',clientesRoutes)
app.use('/api', productosRoutes);
app.use('/uploads', express.static('uploads'));
app.use("/api", pedidosRoutes);
app.use('/api', fcmRoutes);

app.use((req,res,next)=>{
    res.status(400).json({
        message:'Endpoint not found'
    })
})

app.use((err, req, res, next) => {
    console.error("ERROR REAL DEL SERVIDOR:", err.message || err);
    
    res.status(500).json({
        message: "error en el servidor",
        detalle: err.message || "Error desconocido en la nube"
    });
});
export default app;

