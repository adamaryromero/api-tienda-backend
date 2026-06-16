import jwt from 'jsonwebtoken';

import { conmysql } from "../db.js";
export const getProductos = async (req, res) => {
    try {
        const [result] = await conmysql.query('SELECT * FROM productos');
        res.json(result);
    } catch (error) {
        console.error("Error al consultar productos:", error);
        return res.status(500).json({ message: "error al consultar productos" });
    }
};

export const postProducto = async (req, res) => {
    try {
        const { prod_codigo, prod_nombre, prod_stock, prod_precio } = req.body;
        const stockConvertido = prod_stock ? parseInt(prod_stock) : 0;
        const precioConvertido = prod_precio ? parseFloat(prod_precio) : 0.00;
        
        const prod_imagen = req.file ? req.file.filename : null;

        const [result] = await conmysql.query(
            'INSERT INTO productos (prod_codigo, prod_nombre, prod_stock, prod_precio, prod_imagen) VALUES (?,?,?,?,?)',
            [prod_codigo, prod_nombre, stockConvertido, precioConvertido, prod_imagen]
        );
        
        res.status(201).json({ prod_id: result.insertId, message: "Producto y evidencia gráfica guardados con éxito" });
    } catch (error) {
        console.error("Error al guardar nuevo producto en MySQL:", error);
        return res.status(500).json({ message: "error en el servidor" });
    }
};

export const putProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { prod_codigo, prod_nombre, prod_stock, prod_precio } = req.body;
        
        const stockConvertido = prod_stock !== undefined ? parseInt(prod_stock) : null;
        const precioConvertido = prod_precio !== undefined ? parseFloat(prod_precio) : null;

        const prod_imagen = req.file ? req.file.filename : null;

        const [result] = await conmysql.query(
            `UPDATE productos SET 
                prod_codigo = IFNULL(?, prod_codigo), 
                prod_nombre = IFNULL(?, prod_nombre), 
                prod_stock = IFNULL(?, prod_stock), 
                prod_precio = IFNULL(?, prod_precio),
                prod_imagen = IFNULL(?, prod_imagen)
            WHERE prod_id = ?`,
            [
                prod_codigo ?? null, 
                prod_nombre ?? null, 
                stockConvertido, 
                precioConvertido, 
                prod_imagen, 
                id
            ]
        );

        if (result.affectedRows === 0 && !result.info.includes("Rows matched: 1")) {
             return res.status(404).json({ message: "Producto no encontrado en la base de datos" });
        }
        
        res.json({ message: 'Producto actualizado con éxito' });
    } catch (error) {
        console.error("Error al editar producto en MySQL:", error);
        return res.status(500).json({ message: "Error en el servidor al actualizar el producto" });
    }
};

export const putProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const { prod_codigo, prod_nombre, prod_stock, prod_precio } = req.body;

        const stockConvertido = prod_stock !== undefined ? parseInt(prod_stock) : null;
        const precioConvertido = prod_precio !== undefined ? parseFloat(prod_precio) : null;


        const prod_imagen = req.file ? req.file.filename : null;

        const [result] = await conmysql.query(
            `UPDATE productos SET 
                prod_codigo = IFNULL(?, prod_codigo), 
                prod_nombre = IFNULL(?, prod_nombre), 
                prod_stock = IFNULL(?, prod_stock), 
                prod_precio = IFNULL(?, prod_precio),
                prod_imagen = IFNULL(?, prod_imagen)
            WHERE prod_id = ?`,
            [
                prod_codigo ?? null, 
                prod_nombre ?? null, 
                stockConvertido, 
                precioConvertido, 
                prod_imagen, 
                id
            ]
        );

        if (result.affectedRows === 0 && !result.info.includes("Rows matched: 1")) {
             return res.status(404).json({ message: "Producto no encontrado en la base de datos" });
        }
        
        res.json({ message: 'Producto actualizado con éxito' });
    } catch (error) {
        console.error("Error al editar producto en MySQL:", error);
        return res.status(500).json({ message: "Error en el servidor al actualizar el producto" });
    }
};

export const deleteProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await conmysql.query('DELETE FROM productos WHERE prod_id = ?', [id]);
        res.json({ message: "Producto eliminado" });
    } catch (error) {
        console.error("Error al eliminar producto en MySQL:", error);
        return res.status(500).json({ message: "error en el servidor" });
    }
};