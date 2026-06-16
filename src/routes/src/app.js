import express from 'express'
import cors from 'cors';
import clientesRoutes from './routes/clientes.routes.js'
import productosRoutes from './routes/productos.routes.js';


const app=express();
const corsOptions={
origin:'*',
methods:['GET','POST','PUT','PATCH','DELETE'],
credentials:true
}

app.use(cors(corsOptions)); //habilitar los cors
app.use(express.json());//para que interprete los objetos json

/* app.use('/uploads', express.static('uploads')); */

//rutas
app.use('/api',clientesRoutes)
app.use('/api', productosRoutes);
app.use('/uploads', express.static('uploads'));

app.use((req,res,next)=>{
    res.status(400).json({
        message:'Endpoint not found'
    })
})
export default app;

