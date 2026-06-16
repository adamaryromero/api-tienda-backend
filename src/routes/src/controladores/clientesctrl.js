import jwt from 'jsonwebtoken';

import { conmysql } from "../db.js"
export const getclientes=
    async (req,res)=>{
    try {
        const [result]= await conmysql.query('select * from clientes')
        res.json(result)
    } catch (error) {
        return res.status(500).json({message:"error al consultar clientes"})
    }
    } 

export const getclientesxid=
      async (req, res)=>{
        try{
            const[result]=await conmysql.query('select * from clientes where cli_id=?',[req.params.id]);
            if(result.length<=0) return res.json({
                cant:0,
                message:"Cliente no encontrado"
            })
            res.json({cantidad:result.length, data:result[0]}
            );
        } catch(error){
            return res.status(500).json({message:"error en el servidor"});
        }
}

export const postInsertarClientes= 
    async (req, res) => {
    try {
        const { cli_identificacion, cli_nombre, cli_telefono, cli_correo, cli_direccion, cli_pais, cli_ciudad } = req.body
        console.log(req.body)
        
        const [result] = await conmysql.query(
            'INSERT into clientes (cli_identificacion, cli_nombre, cli_telefono, cli_correo, cli_direccion, cli_pais, cli_ciudad) VALUES (?,?,?,?,?,?,?)', 
            [cli_identificacion, cli_nombre, cli_telefono, cli_correo, cli_direccion, cli_pais, cli_ciudad]
        )
        
        res.status(201).json({ cli_id: result.insertId }) 

    } catch (error) {
        return res.status(500).json({
            message: 'error en el servidor'
        })
    }
}

export const putClientes = async (req, res) => {
    try {
        const { id } = req.params;
        const { cli_identificacion, cli_nombre, cli_telefono, cli_correo, cli_direccion, cli_pais, cli_ciudad } = req.body;
        
        const [result] = await conmysql.query(
            'UPDATE clientes SET cli_identificacion=?, cli_nombre=?, cli_telefono=?, cli_correo=?, cli_direccion=?, cli_pais=?, cli_ciudad=? WHERE cli_id=?',
            [
                cli_identificacion ?? null, 
                cli_nombre ?? null, 
                cli_telefono ?? null, 
                cli_correo ?? null, 
                cli_direccion ?? null, 
                cli_pais ?? null, 
                cli_ciudad ?? null, 
                id
            ]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Cliente no encontrado para actualizar" });
        }
        res.json({ message: 'Cliente modificado con éxito' });
    } catch (error) {
        console.error("Error al editar cliente:", error);
        return res.status(500).json({ message: "Error en el servidor al actualizar" });
    }
};

export const patchClientes = async (req, res) => {
    try {
        const {id} = req.params;
        const {cli_identificacion, cli_nombre, cli_telefono, cli_correo, cli_direccion, cli_pais, cli_ciudad} = req.body;
        const [result] = await conmysql.query(
            `UPDATE clientes SET 
                cli_identificacion = IFNULL(?, cli_identificacion),
                cli_nombre = IFNULL(?, cli_nombre),
                cli_telefono = IFNULL(?, cli_telefono),
                cli_correo = IFNULL(?, cli_correo),
                cli_direccion = IFNULL(?, cli_direccion),
                cli_pais = IFNULL(?, cli_pais),
                cli_ciudad = IFNULL(?, cli_ciudad) 
            WHERE cli_id = ?`,
            [
                cli_identificacion ?? null,
                cli_nombre ?? null,
                cli_telefono ?? null,
                cli_correo ?? null,
                cli_direccion ?? null,
                cli_pais ?? null,
                cli_ciudad ?? null,
                id
            ]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({message: "cliente no encontrado para actualizar"});
        }
        res.json({ message: "cliente actualizado parcialmente con éxito", cli_id: id});
    } catch (error) {
        return res.status(500).json({message: "error en el servidor"});
    }
}

export const deleteClientes = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await conmysql.query('DELETE FROM clientes WHERE cli_id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({message: "cliente no encontrado"});
        }
        res.json({message: "Cliente eliminado con éxito", cli_id: id});
    } catch (error) {
        return res.status(500).json({message: "error en el servidor"});
    }
}
