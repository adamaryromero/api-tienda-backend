// backend/src/controladores/pedidosctrl.js
import { conmysql } from "../db.js";
import admin from "firebase-admin";

let serviceAccount;

try {
    if (process.env.FIREBASE_JSON) {
        serviceAccount = JSON.parse(process.env.FIREBASE_JSON);
    } else {
        console.error("FIREBASE_JSON no encontrada en variables de entorno");
        process.exit(1);
    }

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log("Firebase inicializado correctamente");
} catch (error) {
    console.error("Error al inicializar Firebase:", error.message);
}

export const postPedidos = async (req, res) => {
    const conexion = await conmysql.getConnection();

    try {
        await conexion.beginTransaction();
        
        const {
            cli_id, cli_identificacion, cli_nombre, cli_telefono,
            cli_correo, cli_direccion, cli_pais, cli_ciudad,
            ped_fecha, usr_id, ped_estado, detalle
        } = req.body;

        if (!detalle || detalle.length === 0) {
            throw new Error("El pedido no tiene productos.");
        }

        let idCliente = Number(cli_id);

        if (idCliente === 0) {
            const [cliente] = await conexion.query(
                `INSERT INTO clientes (cli_identificacion, cli_nombre, cli_telefono, cli_correo, cli_direccion, cli_pais, cli_ciudad)
                VALUES (?,?,?,?,?,?,?)`,
                [cli_identificacion, cli_nombre, cli_telefono, cli_correo, cli_direccion, cli_pais, cli_ciudad]
            );
            idCliente = cliente.insertId;
        }

        const [pedido] = await conexion.query(
            `INSERT INTO pedidos (cli_id, ped_fecha, usr_id, ped_estado) VALUES (?,?,?,?)`,
            [idCliente, ped_fecha, usr_id, ped_estado]
        );

        const ped_id = pedido.insertId;

        for (const item of detalle) {
            if (Number(item.det_cantidad) <= 0) throw new Error(`Cantidad invalida del producto ${item.prod_id}`);
            if (Number(item.det_precio) <= 0) throw new Error(`Precio invalido del producto ${item.prod_id}`);

            const [producto] = await conexion.query("SELECT prod_id FROM productos WHERE prod_id=?", [item.prod_id]);
            if (producto.length === 0) throw new Error(`El producto ${item.prod_id} no existe.`);

            await conexion.query(
                `INSERT INTO pedidos_detalle (prod_id, ped_id, det_cantidad, det_precio) VALUES (?,?,?,?)`,
                [item.prod_id, ped_id, item.det_cantidad, item.det_precio]
            );
        }

        await conexion.commit();

        try {
            const [admins] = await conmysql.query(
                "SELECT fcm_token FROM usuarios WHERE usr_rol = 'admin' AND fcm_token IS NOT NULL"
            );

            if (admins.length === 0) {
                console.log("No hay administradores con token FCM registrado");
            } else {
                for (const admin of admins) {
                    const mensajePush = {
                        notification: {
                            title: 'Nuevo Pedido',
                            body: `El cliente ${cli_nombre} ha realizado un pedido #${ped_id}`
                        },
                        data: {
                            pedido_id: String(ped_id),
                            type: 'nuevo_pedido'
                        },
                        token: admin.fcm_token
                    };

                    await admin.messaging().send(mensajePush);
                    console.log(`Notificación enviada a admin con token: ${admin.fcm_token.substring(0, 15)}...`);
                }
            }

        } catch (errorPush) {
            console.error("La venta se guardó, pero falló la notificación:", errorPush.message);
        }

        res.status(201).json({
            ok: true,
            mensaje: "Pedido registrado correctamente.",
            ped_id,
            cli_id: idCliente
        });

    } catch (error) {
        await conexion.rollback();
        console.error("Error en pedido:", error);
        res.status(500).json({ ok: false, mensaje: error.message });
    } finally {
        conexion.release();
    }
};

export const getPedidos = async (req, res) => {
    try {
        const [result] = await conmysql.query(`
            SELECT p.ped_id, p.ped_fecha, p.ped_estado, c.cli_nombre, c.cli_identificacion 
            FROM pedidos p 
            INNER JOIN clientes c ON p.cli_id = c.cli_id
            ORDER BY p.ped_id DESC
        `);
        res.json(result);
    } catch (error) {
        return res.status(500).json({ message: "Error al consultar la lista de pedidos" });
    }
};

export const getPedidosxid = async (req, res) => {
    try {
        const { id } = req.params;

        const [pedido] = await conmysql.query(`
            SELECT p.*, c.cli_nombre, c.cli_identificacion, c.cli_direccion 
            FROM pedidos p 
            INNER JOIN clientes c ON p.cli_id = c.cli_id 
            WHERE p.ped_id = ?`, [id]
        );

        if (pedido.length === 0) {
            return res.status(404).json({ message: "Pedido no encontrado" });
        }

        const [detalle] = await conmysql.query(`
            SELECT d.*, pr.prod_nombre, pr.prod_imagen 
            FROM pedidos_detalle d
            INNER JOIN productos pr ON d.prod_id = pr.prod_id
            WHERE d.ped_id = ?`, [id]
        );

        res.json({
            pedido: pedido[0],
            detalle: detalle
        });
    } catch (error) {
        return res.status(500).json({ message: "Error al consultar el pedido" });
    }
};

export const putPedidos = async (req, res) => {
    try {
        const { id } = req.params;
        const { ped_estado } = req.body;

        const [result] = await conmysql.query(
            'UPDATE pedidos SET ped_estado = ? WHERE ped_id = ?',
            [ped_estado, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Pedido no encontrado para actualizar" });
        }

        res.json({ message: "Estado del pedido actualizado correctamente" });
    } catch (error) {
        return res.status(500).json({ message: "Error al actualizar el pedido" });
    }
};

export const deletePedidos = async (req, res) => {
    const conexion = await conmysql.getConnection();
    try {
        await conexion.beginTransaction();
        const { id } = req.params;
        await conexion.query('DELETE FROM pedidos_detalle WHERE ped_id = ?', [id]);
        
        const [result] = await conexion.query('DELETE FROM pedidos WHERE ped_id = ?', [id]);

        if (result.affectedRows === 0) {
            await conexion.rollback();
            return res.status(404).json({ message: "Pedido no encontrado" });
        }

        await conexion.commit();
        res.json({ message: "Pedido y sus detalles eliminados correctamente" });

    } catch (error) {
        await conexion.rollback();
        return res.status(500).json({ message: "Error al eliminar el pedido" });
    } finally {
        conexion.release();
    }
};