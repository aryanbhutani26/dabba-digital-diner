import moment from 'moment';

class InvoiceService {
  
  // Generate HTML invoice for web display/printing
  generateHTMLInvoice(order) {
    const invoiceDate = moment(order.createdAt).format('DD/MM/YYYY HH:mm');
    const subtotal = order.items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    const deliveryFee = parseFloat(order.deliveryFee) || 0;
    const discount = parseFloat(order.discount) || 0;
    const total = subtotal + deliveryFee - discount;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice - ${order.orderNumber}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.6;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #333;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .restaurant-name {
            font-size: 28px;
            font-weight: bold;
            color: #d97706;
            margin-bottom: 5px;
        }
        .restaurant-details {
            color: #666;
            font-size: 14px;
        }
        .invoice-info {
            display: flex;
            justify-content: space-between;
            margin-bottom: 30px;
        }
        .invoice-info div {
            flex: 1;
        }
        .invoice-title {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
        }
        .customer-details {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        .items-table th,
        .items-table td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        .items-table th {
            background-color: #f8f9fa;
            font-weight: bold;
        }
        .items-table .qty {
            text-align: center;
            width: 60px;
        }
        .items-table .price {
            text-align: right;
            width: 100px;
        }
        .totals {
            float: right;
            width: 300px;
            margin-top: 20px;
        }
        .totals table {
            width: 100%;
            border-collapse: collapse;
        }
        .totals td {
            padding: 8px;
            border-bottom: 1px solid #eee;
        }
        .totals .total-row {
            font-weight: bold;
            font-size: 18px;
            border-top: 2px solid #333;
            border-bottom: 2px solid #333;
        }
        .footer {
            clear: both;
            text-align: center;
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            color: #666;
        }
        .print-button {
            background: #d97706;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
            margin: 20px 0;
        }
        .print-button:hover {
            background: #b45309;
        }
        @media print {
            .print-button {
                display: none;
            }
            body {
                margin: 0;
                padding: 15px;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="restaurant-name">INDIYA BAR & RESTAURANT</div>
        <div class="restaurant-details">
            180 High Street, Orpington, BR6 0JW, United Kingdom<br>
            Tel: 01689 451 403 | Email: info@indiyarestaurant.co.uk<br>
            Website: www.indiyarestaurant.co.uk
        </div>
    </div>

    <div class="invoice-info">
        <div>
            <div class="invoice-title">INVOICE</div>
            <strong>Order #:</strong> ${order.orderNumber}<br>
            <strong>Date:</strong> ${invoiceDate}<br>
            <strong>Status:</strong> ${order.status || 'Confirmed'}
        </div>
        <div style="text-align: right;">
            <strong>Payment Method:</strong> ${order.paymentMethod || 'N/A'}<br>
            ${order.tableNumber ? `<strong>Table:</strong> ${order.tableNumber}<br>` : ''}
        </div>
    </div>

    <div class="customer-details">
        <h3>Customer Details</h3>
        <strong>Name:</strong> ${order.customerName}<br>
        ${order.customerEmail ? `<strong>Email:</strong> ${order.customerEmail}<br>` : ''}
        ${order.customerPhone ? `<strong>Phone:</strong> ${order.customerPhone}<br>` : ''}
        ${order.deliveryAddress ? `<strong>Delivery Address:</strong><br>${order.deliveryAddress}<br>` : ''}
        ${order.specialInstructions ? `<strong>Special Instructions:</strong> ${order.specialInstructions}<br>` : ''}
    </div>

    <table class="items-table">
        <thead>
            <tr>
                <th>Item</th>
                <th class="qty">Qty</th>
                <th class="price">Unit Price</th>
                <th class="price">Total</th>
            </tr>
        </thead>
        <tbody>
            ${order.items.map(item => {
              const itemTotal = (parseFloat(item.price) * item.quantity).toFixed(2);
              return `
                <tr>
                    <td>
                        ${item.name}
                        ${item.selectedSize ? `<br><small>Size: ${item.selectedSize}</small>` : ''}
                        ${item.notes ? `<br><small>Notes: ${item.notes}</small>` : ''}
                    </td>
                    <td class="qty">${item.quantity}</td>
                    <td class="price">£${parseFloat(item.price).toFixed(2)}</td>
                    <td class="price">£${itemTotal}</td>
                </tr>
              `;
            }).join('')}
        </tbody>
    </table>

    <div class="totals">
        <table>
            <tr>
                <td>Subtotal:</td>
                <td style="text-align: right;">£${subtotal.toFixed(2)}</td>
            </tr>
            ${deliveryFee > 0 ? `
            <tr>
                <td>Delivery Fee:</td>
                <td style="text-align: right;">£${deliveryFee.toFixed(2)}</td>
            </tr>
            ` : ''}
            ${discount > 0 ? `
            <tr>
                <td>Discount:</td>
                <td style="text-align: right;">-£${discount.toFixed(2)}</td>
            </tr>
            ` : ''}
            <tr class="total-row">
                <td>TOTAL:</td>
                <td style="text-align: right;">£${total.toFixed(2)}</td>
            </tr>
        </table>
    </div>

    <div class="footer">
        <button class="print-button" onclick="window.print()">🖨️ Print Invoice</button>
        <p>Thank you for dining with us!</p>
        <p>Follow us on social media for updates and special offers</p>
    </div>

    <script>
        // Auto-focus for better printing experience
        window.onload = function() {
            document.querySelector('.print-button').focus();
        };
    </script>
</body>
</html>
    `;
  }

  // Generate kitchen receipt format
  generateKitchenReceipt(order) {
    const orderTime = moment(order.createdAt).format('HH:mm DD/MM/YYYY');
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Kitchen Order - ${order.orderNumber}</title>
    <style>
        body {
            font-family: 'Courier New', monospace;
            max-width: 400px;
            margin: 0 auto;
            padding: 10px;
            font-size: 14px;
            line-height: 1.4;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid #000;
            padding-bottom: 10px;
            margin-bottom: 15px;
        }
        .order-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 5px;
        }
        .order-info {
            margin-bottom: 15px;
        }
        .item {
            margin-bottom: 10px;
            padding-bottom: 8px;
            border-bottom: 1px dashed #ccc;
        }
        .item-name {
            font-weight: bold;
            font-size: 16px;
        }
        .item-details {
            margin-left: 10px;
            color: #666;
        }
        .special-instructions {
            background: #fff3cd;
            border: 2px solid #ffc107;
            padding: 10px;
            margin: 15px 0;
            border-radius: 5px;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 10px;
            border-top: 2px solid #000;
            font-weight: bold;
        }
        @media print {
            body { margin: 0; padding: 5px; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="order-title">🍽️ KITCHEN ORDER</div>
        <div><strong>${order.orderNumber}</strong></div>
    </div>

    <div class="order-info">
        <strong>Table:</strong> ${order.tableNumber || 'Delivery'}<br>
        <strong>Time:</strong> ${orderTime}<br>
        <strong>Customer:</strong> ${order.customerName}<br>
        ${order.customerPhone ? `<strong>Phone:</strong> ${order.customerPhone}<br>` : ''}
    </div>

    <div class="items">
        ${order.items.map(item => `
            <div class="item">
                <div class="item-name">${item.quantity}x ${item.name}</div>
                ${item.selectedSize ? `<div class="item-details">Size: ${item.selectedSize}</div>` : ''}
                ${item.notes ? `<div class="item-details">Notes: ${item.notes}</div>` : ''}
            </div>
        `).join('')}
    </div>

    ${order.specialInstructions ? `
    <div class="special-instructions">
        <strong>⚠️ SPECIAL INSTRUCTIONS:</strong><br>
        ${order.specialInstructions}
    </div>
    ` : ''}

    <div class="footer">
        TOTAL ITEMS: ${order.items.reduce((sum, item) => sum + item.quantity, 0)}
    </div>

    <script>
        window.onload = function() {
            window.print();
        };
    </script>
</body>
</html>
    `;
  }

  // Generate receipt data for thermal printer (plain text)
  generateThermalReceipt(order, type = 'bill') {
    if (type === 'kitchen') {
      return this.generateKitchenThermalReceipt(order);
    } else {
      return this.generateBillThermalReceipt(order);
    }
  }

  generateKitchenThermalReceipt(order) {
    const lines = [];
    lines.push('================================');
    lines.push('    KITCHEN ORDER #' + order.orderNumber);
    lines.push('================================');
    lines.push('');
    lines.push('Table: ' + (order.tableNumber || 'Delivery'));
    lines.push('Time: ' + moment(order.createdAt).format('HH:mm DD/MM/YYYY'));
    lines.push('Customer: ' + order.customerName);
    if (order.customerPhone) {
      lines.push('Phone: ' + order.customerPhone);
    }
    lines.push('--------------------------------');
    
    order.items.forEach(item => {
      lines.push(`${item.quantity}x ${item.name}`);
      if (item.selectedSize) {
        lines.push(`   Size: ${item.selectedSize}`);
      }
      if (item.notes) {
        lines.push(`   Notes: ${item.notes}`);
      }
      lines.push('');
    });
    
    lines.push('--------------------------------');
    
    if (order.specialInstructions) {
      lines.push('SPECIAL INSTRUCTIONS:');
      lines.push(order.specialInstructions);
      lines.push('--------------------------------');
    }
    
    lines.push(`TOTAL ITEMS: ${order.items.reduce((sum, item) => sum + item.quantity, 0)}`);
    lines.push('================================');
    
    return lines.join('\n');
  }

  generateBillThermalReceipt(order) {
    const lines = [];
    const subtotal = order.items.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    const deliveryFee = parseFloat(order.deliveryFee) || 0;
    const discount = parseFloat(order.discount) || 0;
    const total = subtotal + deliveryFee - discount;

    lines.push('================================');
    lines.push('     INDIYA BAR & RESTAURANT');
    lines.push('    180 High Street, Orpington');
    lines.push('      Tel: 01689 451 403');
    lines.push('================================');
    lines.push('');
    lines.push('Order #: ' + order.orderNumber);
    lines.push('Date: ' + moment(order.createdAt).format('DD/MM/YYYY HH:mm'));
    lines.push('Customer: ' + order.customerName);
    if (order.customerPhone) {
      lines.push('Phone: ' + order.customerPhone);
    }
    lines.push('--------------------------------');

    order.items.forEach(item => {
      const itemTotal = (parseFloat(item.price) * item.quantity).toFixed(2);
      const itemLine = `${item.quantity}x ${item.name}`;
      const priceLine = `£${itemTotal}`;
      const maxWidth = 32;
      const padding = maxWidth - itemLine.length - priceLine.length;
      lines.push(itemLine + ' '.repeat(Math.max(1, padding)) + priceLine);
      
      if (item.selectedSize) {
        lines.push(`   (${item.selectedSize})`);
      }
    });

    lines.push('--------------------------------');
    lines.push(`Subtotal:${' '.repeat(23)}£${subtotal.toFixed(2)}`);
    
    if (deliveryFee > 0) {
      lines.push(`Delivery Fee:${' '.repeat(19)}£${deliveryFee.toFixed(2)}`);
    }
    
    if (discount > 0) {
      lines.push(`Discount:${' '.repeat(22)}-£${discount.toFixed(2)}`);
    }
    
    lines.push('--------------------------------');
    lines.push(`TOTAL:${' '.repeat(25)}£${total.toFixed(2)}`);
    
    if (order.paymentMethod) {
      lines.push(`Payment: ${order.paymentMethod}`);
    }
    
    lines.push('--------------------------------');

    if (order.deliveryAddress) {
      lines.push('Delivery Address:');
      lines.push(order.deliveryAddress);
      lines.push('--------------------------------');
    }

    lines.push('Thank you for your order!');
    lines.push('Visit: www.indiyarestaurant.co.uk');
    lines.push('================================');
    
    return lines.join('\n');
  }
}

// Singleton instance
const invoiceService = new InvoiceService();

export { invoiceService };