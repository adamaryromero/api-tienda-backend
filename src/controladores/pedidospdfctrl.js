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

        const doc = new PDFDocument({ 
            size: 'A4', 
            margin: 50,
            bufferPages: true 
        });
        
        // Configurar headers para descarga
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=pedido_${id}.pdf`);
        res.setHeader('Cache-Control', 'no-cache');
        
        doc.pipe(res);

        // === COLORES ===
        const colors = {
            primary: '#8fb4e5',      // Azul principal
            secondary: '#34d399',    // Verde
            dark: '#4776c7',         // Fondo oscuro
            light: '#f8f9fa',        // Fondo claro
            text: '#2d2d2d',         // Texto principal
            textLight: '#4e5d7a',    // Texto secundario
            border: '#e5e7eb',       // Bordes
            accent: '#60a5fa'        // Acento
        };

        // === HEADER CON LOGO ===
        // Barra superior decorativa
        doc.rect(50, 40, 495, 4)
           .fill(colors.primary);
        
        doc.rect(50, 44, 495, 2)
           .fill(colors.accent);

        // Título principal
        doc.fontSize(24)
           .font('Poppins-Bold')
           .fillColor(colors.primary)
           .text('FACTURA', 50, 60, { align: 'left' });
        
        doc.fontSize(16)
           .font('Poppins')
           .fillColor(colors.textLight)
           .text('DE PEDIDO', 50, 88, { align: 'left' });

        // Número de pedido a la derecha
        doc.fontSize(14)
           .font('Poppins-Bold')
           .fillColor(colors.dark)
           .text(`#${pedido[0].ped_id}`, 450, 60, { align: 'right' });
        
        doc.fontSize(10)
           .font('Poppins')
           .fillColor(colors.textLight)
           .text(`Fecha: ${new Date(pedido[0].ped_fecha).toLocaleDateString('es-ES', {
               year: 'numeric',
               month: 'long',
               day: 'numeric',
               hour: '2-digit',
               minute: '2-digit'
           })}`, 450, 78, { align: 'right' });

        // Línea separadora
        doc.moveTo(50, 115)
           .lineTo(550, 115)
           .strokeColor(colors.border)
           .lineWidth(1)
           .stroke();

        doc.moveDown(1);

        // === INFORMACIÓN DEL CLIENTE ===
        // Título sección
        doc.fontSize(11)
           .font('Poppins-Bold')
           .fillColor(colors.text)
           .text('INFORMACIÓN DEL CLIENTE', 50, 150);
        
        // Caja de información
        const boxY = 160;
        doc.rect(50, boxY, 495, 100)
           .fillColor('#f8fafc')
           .fill()
           .strokeColor(colors.border)
           .lineWidth(1)
           .stroke();

        // Datos en dos columnas
        const col1 = 70;
        const col2 = 300;
        const startY = boxY + 20;

        doc.fontSize(10)
           .font('Poppins-Bold')
           .fillColor(colors.textLight)
           .text('NOMBRE', col1, startY);
        doc.font('Helvetica')
           .fillColor(colors.text)
           .text(pedido[0].cli_nombre, col1, startY + 14);

        doc.font('Poppins-Bold')
           .fillColor(colors.textLight)
           .text('IDENTIFICACIÓN', col2, startY);
        doc.font('Poppins')
           .fillColor(colors.text)
           .text(pedido[0].cli_identificacion, col2, startY + 14);

        doc.font('Helvetica-Bold')
           .fillColor(colors.textLight)
           .text('TELÉFONO', col1, startY + 40);
        doc.font('Poppins')
           .fillColor(colors.text)
           .text(pedido[0].cli_telefono || 'No registrado', col1, startY + 54);

        doc.font('Poppins-Bold')
           .fillColor(colors.textLight)
           .text('CORREO', col2, startY + 40);
        doc.font('Poppins')
           .fillColor(colors.text)
           .text(pedido[0].cli_correo || 'No registrado', col2, startY + 54);

        doc.font('Poppins-Bold')
           .fillColor(colors.textLight)
           .text('DIRECCIÓN', col1, startY + 80);
        doc.font('Poppins')
           .fillColor(colors.text)
           .text(pedido[0].cli_direccion || 'No registrada', col1, startY + 94);

        doc.moveDown(2);

        // === DETALLE DE PRODUCTOS ===
        doc.fontSize(11)
           .font('Poppins-Bold')
           .fillColor(colors.text)
           .text('DETALLE DE PRODUCTOS', 50, doc.y);

        doc.moveDown(0.5);

        // Tabla
        const tableTop = doc.y;
        const colPositions = {
            code: 50,
            name: 130,
            qty: 370,
            price: 420,
            subtotal: 490
        };

        // Encabezados de tabla
        doc.rect(50, tableTop, 495, 25)
           .fillColor(colors.primary)
           .fill();

        doc.fontSize(9)
           .font('Poppins-Bold')
           .fillColor('#ffffff')
           .text('CÓDIGO', colPositions.code, tableTop + 6, { width: 80, align: 'left' })
           .text('PRODUCTO', colPositions.name, tableTop + 6, { width: 220, align: 'left' })
           .text('CANT.', colPositions.qty, tableTop + 6, { width: 50, align: 'center' })
           .text('PRECIO', colPositions.price, tableTop + 6, { width: 70, align: 'right' })
           .text('SUBTOTAL', colPositions.subtotal, tableTop + 6, { width: 70, align: 'right' });

        // Filas de productos
        let total = 0;
        let currentY = tableTop + 25;

        if (detalle.length === 0) {
            doc.font('Poppins')
               .fillColor(colors.textLight)
               .text('No hay productos en este pedido', 50, currentY + 10);
        } else {
            detalle.forEach((item, index) => {
                const precio = Number(item.det_precio) || 0;
                const cantidad = Number(item.det_cantidad) || 0;
                const subtotal = precio * cantidad;
                total += subtotal;

                // Color alternado para filas
                if (index % 2 === 0) {
                    doc.rect(50, currentY, 495, 22)
                       .fillColor('#f9fafb')
                       .fill();
                }

                const nombreProducto = item.prod_nombre || 'Producto';
                const nombreTruncado = nombreProducto.length > 35 ? 
                    nombreProducto.substring(0, 32) + '...' : 
                    nombreProducto;

                doc.fontSize(9)
                   .font('Helvetica')
                   .fillColor(colors.text)
                   .text(item.prod_codigo || '-', colPositions.code, currentY + 4, { width: 80, align: 'left' })
                   .text(nombreTruncado, colPositions.name, currentY + 4, { width: 240, align: 'left' })
                   .text(cantidad.toString(), colPositions.qty, currentY + 4, { width: 50, align: 'center' })
                   .text(`$${precio.toFixed(2)}`, colPositions.price, currentY + 4, { width: 70, align: 'right' })
                   .text(`$${subtotal.toFixed(2)}`, colPositions.subtotal, currentY + 4, { width: 70, align: 'right' });

                currentY += 22;
            });
        }

        // Línea final de la tabla
        const finalTableY = currentY;
        doc.rect(50, finalTableY - 2, 495, 2)
           .fillColor(colors.border)
           .fill();

        // === TOTAL ===
        doc.moveDown(0.5);
        const totalY = doc.y + 10;

        // Caja de total
        doc.rect(380, totalY, 165, 50)
           .fillColor(colors.primary)
           .fill()
           .roundedRect(380, totalY, 165, 50, 4)
           .stroke();

        doc.fontSize(12)
           .font('Poppins-Bold')
           .fillColor('#ffffff')
           .text('TOTAL', 395, totalY + 8);
        doc.fontSize(20)
           .font('Poppins-Bold')
           .fillColor('#ffffff')
           .text(`$${total.toFixed(2)}`, 395, totalY + 26, { align: 'left' });

        doc.moveDown(4);

        // === FOOTER ===
        // Línea decorativa
        doc.rect(50, doc.y, 495, 1)
           .fillColor(colors.border)
           .fill();

        doc.moveDown(0.5);

        doc.fontSize(8)
           .font('Poppins')
           .fillColor(colors.textLight)
           .text('Gracias por su compra', 50, doc.y, { align: 'center' })
           .text(`Documento generado el ${new Date().toLocaleString('es-ES')}`, 50, doc.y + 14, { align: 'center' });

        // === PIE DE PÁGINA CON NÚMERO DE PÁGINA ===
        doc.fontSize(8)
           .font('Poppins')
           .fillColor(colors.textLight)
           .text(
               `Página ${doc.page}`,
               50,
               doc.page.height - 50,
               { align: 'center' }
           );

        // Finalizar PDF
        doc.end();

    } catch (error) {
        console.error('Error al generar PDF:', error);
        if (!res.headersSent) {
            res.status(500).json({ 
                message: "Error al generar el PDF",
                error: error.message 
            });
        }
    }
};