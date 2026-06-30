import { conmysql } from "../db.js";

export const guardarPedido = async (req, res) => {
    const conexion = await conmysql.getConnection();

    try {
        await conexion.beginTransaction();
        
        const {
            cli_id,
            cli_identificacion,
            cli_nombre,
            cli_telefono,
            cli_correo,
            cli_direccion,
            cli_pais,
            cli_ciudad,
            ped_fecha,
            usr_id,
            ped_estado,
            detalle
        } = req.body;

        if (!detalle || detalle.length === 0) {
            throw new Error("El pedido no tiene productos.");
        }

        let idCliente = Number(cli_id);

        if (idCliente === 0) {
            const [cliente] = await conexion.query(
                `INSERT INTO clientes
                (
                    cli_identificacion,
                    cli_nombre,
                    cli_telefono,
                    cli_correo,
                    cli_direccion,
                    cli_pais,
                    cli_ciudad
                )
                VALUES (?,?,?,?,?,?,?)`,
                [
                    cli_identificacion,
                    cli_nombre,
                    cli_telefono,
                    cli_correo,
                    cli_direccion,
                    cli_pais,
                    cli_ciudad
                ]
            );

            idCliente = cliente.insertId;
        }

        const [pedido] = await conexion.query(
            `INSERT INTO pedidos
            (
                cli_id,
                ped_fecha,
                usr_id,
                ped_estado
            )
            VALUES (?,?,?,?)`,
            [
                idCliente,
                ped_fecha,
                usr_id,
                ped_estado
            ]
        );

        const ped_id = pedido.insertId;

        for (const item of detalle) {
            if (Number(item.det_cantidad) <= 0) {
                throw new Error(`Cantidad inválida del producto ${item.prod_id}`);
            }
            if (Number(item.det_precio) <= 0) {
                throw new Error(`Precio inválido del producto ${item.prod_id}`);
            }

            const [producto] = await conexion.query(
                "SELECT prod_id FROM productos WHERE prod_id=?",
                [item.prod_id]
            );
            
            if (producto.length === 0) {
                throw new Error(`El producto ${item.prod_id} no existe.`);
            }

            await conexion.query(
                `INSERT INTO pedidos_detalle
                (
                    prod_id,
                    ped_id,
                    det_cantidad,
                    det_precio
                )
                VALUES (?,?,?,?)`,
                [
                    item.prod_id,
                    ped_id,
                    item.det_cantidad,
                    item.det_precio
                ]
            );
        }

        await conexion.commit();
        
        res.status(201).json({
            ok: true,
            mensaje: "Pedido registrado correctamente.",
            ped_id,
            cli_id: idCliente
        });

    } catch (error) {
        await conexion.rollback();
        console.error("Error en la transacción de pedidos:", error);
        res.status(500).json({
            ok: false,
            mensaje: error.message
        });

    } finally {
        conexion.release();
    }
};

export const getPedidos = async (req, res) => {
    try {
        const [result] = await conmysql.query(`
            SELECT p.ped_id, p.ped_fecha, p.ped_estado, c.cli_nombre 
            FROM pedidos p 
            INNER JOIN clientes c ON p.cli_id = c.cli_id
            ORDER BY p.ped_id DESC
        `);
        res.json(result);
    } catch (error) {
        return res.status(500).json({ 
            message: "Error al consultar la lista de pedidos" 
        });
    }
};