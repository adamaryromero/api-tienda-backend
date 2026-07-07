import PDFDocument from 'pdfkit';
import { conmysql } from "../db.js";

export const generarPDFPedido = async (req, res) => {
    try {
        const { id } = req.params;
        console.log(`Generando PDF para pedido #${id}`);

        // Obtener datos del pedido
        const [pedido] = await conmysql.query(`
            SELECT p.*, c.cli_nombre, c.cli_identificacion, c.cli_direccion, c.cli_telefono, c.cli_correo
            FROM pedidos p 
            INNER JOIN clientes c ON p.cli_id = c.cli_id 
            WHERE p.ped_id = ?`, [id]
        );

        if (pedido.length === 0) {
            return res.status(404).json({ message: "Pedido no encontrado" });
        }

        // Obtener detalle del pedido
        const [detalle] = await conmysql.query(`
            SELECT d.*, pr.prod_nombre, pr.prod_codigo 
            FROM pedidos_detalle d
            INNER JOIN productos pr ON d.prod_id = pr.prod_id
            WHERE d.ped_id = ?`, [id]
        );

        // Crear el PDF
        const doc = new PDFDocument({ 
            size: 'A4', 
            margin: 50,
            bufferPages: true 
        });
        
        // Configurar headers para descarga
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=pedido_${id}.pdf`);
        res.setHeader('Cache-Control', 'no-cache');
        
        // Pipe directamente a la respuesta
        doc.pipe(res);

        // === DISEÑO DEL PDF ===
        
        // Header
        doc.fontSize(20)
           .font('Helvetica-Bold')
           .text('FACTURA DE PEDIDO', { align: 'center' })
           .moveDown(0.5);
        
        doc.fontSize(10)
           .font('Helvetica')
           .text(`Pedido #${pedido[0].ped_id}`, { align: 'center' })
           .text(`Fecha: ${new Date(pedido[0].ped_fecha).toLocaleString('es-ES')}`, { align: 'center' })
           .moveDown(1);

        // Línea separadora
        doc.moveTo(50, doc.y)
           .lineTo(550, doc.y)
           .stroke()
           .moveDown(0.5);

        // Datos del cliente
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .text('DATOS DEL CLIENTE', { underline: true })
           .moveDown(0.3);
        
        doc.fontSize(10)
           .font('Helvetica')
           .text(`Nombre: ${pedido[0].cli_nombre}`)
           .text(`Identificación: ${pedido[0].cli_identificacion}`)
           .text(`Teléfono: ${pedido[0].cli_telefono || 'No registrado'}`)
           .text(`Correo: ${pedido[0].cli_correo || 'No registrado'}`)
           .text(`Dirección: ${pedido[0].cli_direccion || 'No registrada'}`)
           .moveDown(0.5);

        // Línea separadora
        doc.moveTo(50, doc.y)
           .lineTo(550, doc.y)
           .stroke()
           .moveDown(0.5);

        // Detalle de productos
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .text('DETALLE DE PRODUCTOS', { underline: true })
           .moveDown(0.3);

        // Encabezados de tabla
        const startX = 50;
        let currentY = doc.y;
        
        doc.fontSize(9)
           .font('Helvetica-Bold')
           .text('Código', startX, currentY, { width: 80, align: 'left' })
           .text('Producto', startX + 80, currentY, { width: 200, align: 'left' })
           .text('Cant.', startX + 280, currentY, { width: 60, align: 'center' })
           .text('Precio', startX + 340, currentY, { width: 80, align: 'right' })
           .text('Subtotal', startX + 420, currentY, { width: 80, align: 'right' });

        // Línea separadora
        currentY = doc.y + 10;
        doc.moveTo(startX, currentY)
           .lineTo(530, currentY)
           .stroke();

        // Productos
        let total = 0;
        doc.moveDown(0.5);
        doc.fontSize(9)
           .font('Helvetica');

        if (detalle.length === 0) {
            doc.text('No hay productos en este pedido', startX, doc.y);
        } else {
            detalle.forEach((item, index) => {
                // ✅ CONVERTIR A NÚMERO ANTES DE USAR toFixed
                const precio = Number(item.det_precio) || 0;
                const cantidad = Number(item.det_cantidad) || 0;
                const subtotal = precio * cantidad;
                total += subtotal;
                currentY = doc.y;

                // Manejar nombres largos
                let nombreProducto = item.prod_nombre || 'Producto';
                if (nombreProducto.length > 30) {
                    nombreProducto = nombreProducto.substring(0, 27) + '...';
                }

                doc.text(item.prod_codigo || '-', startX, currentY, { width: 80, align: 'left' })
                   .text(nombreProducto, startX + 80, currentY, { width: 200, align: 'left' })
                   .text(cantidad.toString(), startX + 280, currentY, { width: 60, align: 'center' })
                   .text(`$${precio.toFixed(2)}`, startX + 340, currentY, { width: 80, align: 'right' })
                   .text(`$${subtotal.toFixed(2)}`, startX + 420, currentY, { width: 80, align: 'right' });
                
                if (index < detalle.length - 1) {
                    doc.moveDown(0.3);
                }
            });
        }

        // Línea separadora
        currentY = doc.y + 10;
        doc.moveTo(startX, currentY)
           .lineTo(530, currentY)
           .stroke();

        // Total
        doc.moveDown(0.5);
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .text(`TOTAL: $${total.toFixed(2)}`, 350, doc.y, { align: 'right' })
           .moveDown(2);

        // Estado del pedido
        doc.fontSize(10)
           .font('Helvetica')
           .text(`Estado: ${pedido[0].ped_estado === 1 ? '✅ COMPLETADO' : '❌ CANCELADO'}`, { align: 'center' })
           .moveDown(1);

        // Footer
        doc.fontSize(8)
           .font('Helvetica')
           .text('Gracias por su compra', { align: 'center' })
           .text(`Documento generado el ${new Date().toLocaleString('es-ES')}`, { align: 'center' });

        // Finalizar PDF
        doc.end();

    } catch (error) {
        console.error('Error al generar PDF:', error);
        // Si el error ocurrió antes de enviar headers, enviar respuesta JSON
        if (!res.headersSent) {
            res.status(500).json({ 
                message: "Error al generar el PDF",
                error: error.message 
            });
        }
    }
};