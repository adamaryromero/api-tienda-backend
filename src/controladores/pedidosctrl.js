// backend/src/controladores/pedidosctrl.js
import { conmysql } from "../db.js";
import admin from "firebase-admin";

const serviceAccount = {
    type: "service_account",
    project_id: "apptienda-60819",
    private_key_id: "c4bc90c87b528431adec0148f5d7e3e213683cf9",
    private_key: `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCgiuMneCeaKVTj
q4JPbMxFpMaav5x4E+zRsOnTuwUIvWhAmVuAj1f0UxUUhg27R567YaHzuuSEP808
bAEWrg78Z3xFGnXLtryJucwTaNc3BSvT6/5g/+s6QJZL0EEH4EjzcFbUjTLN3Y16
siWc5jeMdID/2EvbzFq4YwE2MiBHPh711VRJllcFBQi1Manxqus/1fKXqJB8kava
eyQU5NUX/S8wXQ6XseWrAbRv9Hy7icTyNXqb5KomVlahSYWOlTBCJPDucsY8d5jf
pLDXpdEttJef85IdE6/0QA9Tc0rB763ZQ7SRqS0p381erBS/veS/JcvUSv9gSCjU
nFFnGx0HAgMBAAECggEAGXU8xT8EBKnGON4zKVYm5GpXRiXZcZ8zQCNOSRGQoEys
0gWfoXjZqThdkOYbGlYmoS8/x88cuq4FZS35VDfgz3y3k5u5D0dYiXyJlJBdBHAQ
/aegLJCYpCGm07nf/hg+aUAovMbxRfz6mPjUBxfouiClbizGBsJWpoOopwf232UF
l4Qzq+m021ituqMktlcG0lZ9Rd9pjv4HOrs88F4f3q4jMI3oyYUSgVrOxCAlf4j7
CoJo9CxiHFSg5PpghnS8uU3h5hdChUr9+aXBVgB9kXwcyEnMhTqR3Cm/sHsreeaE
yGUDfX7gNWTK72XNi8VZh+URMU1xx/krjoejGGFMlQKBgQDTt+RGR/ubtcXtKjFJ
fVjXnWdLhG4KP8lXMa8UfBFW0o6DMCWzxp+/+l9dkmv7PxiNJi/jMetnEhRU4iea
amJFNXPrLvCQa0zvRDRiVv60IMzCbZ0MEP7I7F7B7AklVwemxkfMiYI8+cWUgt/E
1nEHzcccfklwypvEYfU7Rv2kZQKBgQDCHt86XiRQQKmuWUhYoj5EhbbyvT32XrAc
YOf0KlUk25I4gOwHzgHs+VTHZCfRUVKMPVkMqmsCyy1+gsly0AVd9lJtGNyJiBFF
fp/iz/nOI4OuHlvGcytN2ysR6MRKzxoQu4RHQEUMFzLCzK4G7w396IYumBGdoA63
AD0/PN1W+wKBgQC7y938SVVxZOdP26EkYr8vYjuBzNIe3T2mzjdSoEpxDQvEaizH
LmP9UgTNZ1fI4MrSSREpIdqA7pSCRqiCW+MXKLbN4jEYqVTw1zrwD+KVvJJj0/79
+QVHDANxWAE00eHDmRWO5FpV4+fSN9RtMRnJpkn7iDl0hwNsSsfP8MSD0QKBgGfh
W3YBsQ8dO3BoqPV9hTLoF3oY2VLBYx8coKQiD0RVGA+StjyK+q7U0pCNQV2bVkBk
CAZmIDPzhJoB5UnClkytJ3joaARVQ2DcHTWkNDsi+DGyX0x4j0Dvu0GvPXQHFhzE
LEpw00JgG7LxE2P0g5lP2JaQnESsxZMa1qvDp3MHAoGAcbPorBXNRV9+KBS7Ee5x
b2Zy1t9j9RuYpG3OhD3oZTXKqYiX1B9yQruSbnMeAE9Fkt4RRrwUkYQyeNLhCoq2
S89WbInNP4+7CkHw1TTWba+rJ33YilYF+yhGwiJo7hrKMoDh1aAuRtLw+IIgj4hp
NVrXrwa2OkRkjD/Ax4JyFYM=
-----END PRIVATE KEY-----`,
    client_email: "firebase-adminsdk-fbsvc@apptienda-60819.iam.gserviceaccount.com",
    client_id: "111260683629266585270",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://oauth2.googleapis.com/token",
    auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
    client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40apptienda-60819.iam.gserviceaccount.com",
    universe_domain: "googleapis.com"
};

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

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
            const tokenAdmin = "AQUI_VA_TU_TOKEN_FCM_REAL";

            const mensajePush = {
                notification: {
                    title: 'Nuevo Pedido',
                    body: `El cliente ${cli_nombre} ha realizado un pedido`
                },
                data: {
                    pedido_id: String(ped_id),
                    type: 'nuevo_pedido'
                },
                token: tokenAdmin
            };

            await admin.messaging().send(mensajePush);
            console.log("Notificacion enviada al Admin");

        } catch (errorPush) {
            console.error("La venta se guardo, pero fallo la notificacion:", errorPush.message);
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