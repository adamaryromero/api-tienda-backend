import PDFDocument from 'pdfkit';
import { conmysql } from "../db.js";

export const generarPDFPedido = async (req, res) => {
    try {
        const { id } = req.params;

        //obtener datos del pedido
        const [pedido] = await conmysql.query(`
            SELECT p.*, c.cli_nombre, c.cli_identificacion, c.cli_direccion, c.cli_telefono, c.cli_correo
            FROM pedidos p 
            INNER JOIN clientes c ON p.cli_id = c.cli_id 
            WHERE p.ped_id = ?`, [id]
        );

        if (pedido.length === 0) {
            return res.status(404).json({ message: "Pedido no encontrado" });
        }

        //obtener detalle del pedido
        const [detalle] = await conmysql.query(`
            SELECT d.*, pr.prod_nombre, pr.prod_codigo 
            FROM pedidos_detalle d
            INNER JOIN productos pr ON d.prod_id = pr.prod_id
            WHERE d.ped_id = ?`, [id]
        );

        //crear el PDF
        const doc = new PDFDocument({ size: 'A4', margin: 50 });
        
        //configurar headers para descarga
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=pedido_${id}.pdf`);
        
        doc.pipe(res);

        //diseño del pdf

        doc.fontSize(20)
           .font('Helvetica-Bold')
           .text('FACTURA DE PEDIDO', { align: 'center' })
           .moveDown(0.5);
        
        doc.fontSize(10)
           .font('Helvetica')
           .text(`Pedido #${pedido[0].ped_id}`, { align: 'center' })
           .text(`Fecha: ${new Date(pedido[0].ped_fecha).toLocaleString()}`, { align: 'center' })
           .moveDown(1);

        //línea separadora
        doc.moveTo(50, doc.y)
           .lineTo(550, doc.y)
           .stroke()
           .moveDown(0.5);

        //datos del cliente
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

        //línea separadora
        doc.moveTo(50, doc.y)
           .lineTo(550, doc.y)
           .stroke()
           .moveDown(0.5);

        //detalle de productos
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .text('DETALLE DE PRODUCTOS', { underline: true })
           .moveDown(0.3);

        //encabezados de tabla
        const startX = 50;
        let currentY = doc.y;
        
        doc.fontSize(9)
           .font('Helvetica-Bold')
           .text('Código', startX, currentY, { width: 80, align: 'left' })
           .text('Producto', startX + 80, currentY, { width: 200, align: 'left' })
           .text('Cantidad', startX + 280, currentY, { width: 80, align: 'center' })
           .text('Precio', startX + 360, currentY, { width: 80, align: 'right' })
           .text('Subtotal', startX + 440, currentY, { width: 80, align: 'right' });

        //línea separadora
        currentY = doc.y + 10;
        doc.moveTo(startX, currentY)
           .lineTo(550, currentY)
           .stroke();

        //productos
        let total = 0;
        doc.moveDown(0.5);
        doc.fontSize(9)
           .font('Helvetica');

        detalle.forEach((item, index) => {
            const subtotal = item.det_precio * item.det_cantidad;
            total += subtotal;
            currentY = doc.y;

            doc.text(item.prod_codigo || '-', startX, currentY, { width: 80, align: 'left' })
               .text(item.prod_nombre, startX + 80, currentY, { width: 200, align: 'left' })
               .text(item.det_cantidad.toString(), startX + 280, currentY, { width: 80, align: 'center' })
               .text(`$${item.det_precio.toFixed(2)}`, startX + 360, currentY, { width: 80, align: 'right' })
               .text(`$${subtotal.toFixed(2)}`, startX + 440, currentY, { width: 80, align: 'right' });
            
            if (index < detalle.length - 1) {
                doc.moveDown(0.3);
            }
        });

        //línea separadora
        currentY = doc.y + 10;
        doc.moveTo(startX, currentY)
           .lineTo(550, currentY)
           .stroke();

        //total
        doc.moveDown(0.5);
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .text(`TOTAL A PAGAR: $${total.toFixed(2)}`, 350, doc.y, { align: 'right' })
           .moveDown(2);

        //estado del pedido
        doc.fontSize(10)
           .font('Helvetica')
           .text(`Estado: ${pedido[0].ped_estado === 1 ? '✅ COMPLETADO' : '❌ CANCELADO'}`, { align: 'center' })
           .moveDown(1);

        //pie de página
        doc.fontSize(8)
           .font('Helvetica')
           .text('Gracias por su compra', { align: 'center' })
           .text(`Documento generado el ${new Date().toLocaleString()}`, { align: 'center' });

        doc.end();

    } catch (error) {
        console.error('Error al generar PDF:', error);
        res.status(500).json({ message: "Error al generar el PDF" });
    }
};