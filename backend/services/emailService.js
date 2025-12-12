import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter using environment variables
const createTransporter = () => {
  return nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
};

// Send birthday coupon email
export const sendBirthdayCouponEmail = async (emailData) => {
  try {
    const transporter = createTransporter();
    
    const { to, name, couponCode, discountPercentage, birthdayDate, expiryDate, message } = emailData;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>🎉 Your Birthday Surprise from Indiya Restaurant!</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .header {
            background: linear-gradient(135deg, #c3a85c, #d4b86a);
            color: white;
            padding: 30px 20px;
            text-align: center;
          }
          .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
          }
          .content {
            padding: 30px 20px;
          }
          .birthday-message {
            background: linear-gradient(135deg, #fff8e1, #f3e5ab);
            border-left: 4px solid #c3a85c;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
          }
          .coupon-box {
            background: linear-gradient(135deg, #000000, #1a1a1a);
            color: white;
            padding: 25px;
            margin: 25px 0;
            border-radius: 10px;
            text-align: center;
            border: 2px solid #c3a85c;
          }
          .coupon-code {
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 2px;
            color: #c3a85c;
            margin: 10px 0;
            padding: 10px;
            border: 2px dashed #c3a85c;
            border-radius: 5px;
            background: rgba(195, 168, 92, 0.1);
          }
          .discount-badge {
            background: #c3a85c;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 18px;
            font-weight: bold;
            display: inline-block;
            margin: 10px 0;
          }
          .details {
            background: #f9f9f9;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
            border: 1px solid #e0e0e0;
          }
          .details h3 {
            color: #c3a85c;
            margin-top: 0;
          }
          .cta-button {
            background: linear-gradient(135deg, #c3a85c, #d4b86a);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 25px;
            font-weight: bold;
            display: inline-block;
            margin: 20px 0;
            transition: transform 0.2s;
          }
          .footer {
            background: #333;
            color: white;
            padding: 20px;
            text-align: center;
            font-size: 14px;
          }
          .restaurant-info {
            margin: 15px 0;
            padding: 15px;
            background: rgba(195, 168, 92, 0.1);
            border-radius: 5px;
          }
          @media (max-width: 600px) {
            .container {
              margin: 10px;
            }
            .header h1 {
              font-size: 24px;
            }
            .coupon-code {
              font-size: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <h1>🎂 Happy Early Birthday!</h1>
            <p>Your special celebration awaits at Indiya Bar & Restaurant</p>
          </div>
          
          <!-- Main Content -->
          <div class="content">
            <h2>Dear ${name},</h2>
            
            <div class="birthday-message">
              <p><strong>${message}</strong></p>
            </div>
            
            <p>We're excited to celebrate your upcoming birthday with you! As a special gift, we've prepared an exclusive birthday coupon just for you.</p>
            
            <!-- Coupon Section -->
            <div class="coupon-box">
              <h3>🎁 Your Exclusive Birthday Coupon</h3>
              <div class="discount-badge">${discountPercentage}% OFF</div>
              <div class="coupon-code">${couponCode}</div>
              <p>Present this code when ordering to enjoy your birthday discount!</p>
            </div>
            
            <!-- Details -->
            <div class="details">
              <h3>📋 Coupon Details</h3>
              <ul>
                <li><strong>Your Birthday:</strong> ${birthdayDate}</li>
                <li><strong>Discount:</strong> ${discountPercentage}% off your entire order</li>
                <li><strong>Valid Until:</strong> ${expiryDate}</li>
                <li><strong>Usage:</strong> One-time use</li>
                <li><strong>Applicable:</strong> All menu items</li>
              </ul>
            </div>
            
            <div class="restaurant-info">
              <h3>🏪 Visit Us</h3>
              <p><strong>Indiya Bar & Restaurant</strong><br>
              180 High Street, Orpington, BR6 0JW<br>
              📞 ${process.env.RESTAURANT_PHONE || '+44 (0)1689451403'}<br>
              🌐 Order online or visit us in person</p>
            </div>
            
            <p>We can't wait to make your birthday celebration memorable with our authentic Indian cuisine and warm hospitality!</p>
            
            <center>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/menu" class="cta-button">
                🍽️ Order Now & Use Your Coupon
              </a>
            </center>
          </div>
          
          <!-- Footer -->
          <div class="footer">
            <p><strong>Indiya Bar & Restaurant</strong></p>
            <p>Authentic Indian Cuisine • Fresh Ingredients • Exceptional Service</p>
            <p>Thank you for choosing us for your special celebration! 🎉</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    const textContent = `
🎉 Happy Early Birthday, ${name}!

Your special birthday coupon is ready!

Coupon Code: ${couponCode}
Discount: ${discountPercentage}% OFF
Your Birthday: ${birthdayDate}
Valid Until: ${expiryDate}

${message}

Visit us at:
Indiya Bar & Restaurant
180 High Street, Orpington, BR6 0JW
Phone: ${process.env.RESTAURANT_PHONE || '+44 (0)1689451403'}

Order online: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/menu

We can't wait to celebrate with you!

Best regards,
The Indiya Restaurant Team
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Indiya Restaurant" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: `🎂 ${name}, Your Birthday Surprise is Here! ${discountPercentage}% OFF Coupon Inside`,
      text: textContent,
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Birthday email sent to ${to}:`, result.messageId);
    
    return {
      success: true,
      messageId: result.messageId,
      recipient: to
    };
    
  } catch (error) {
    console.error(`❌ Failed to send birthday email to ${emailData.to}:`, error);
    return {
      success: false,
      error: error.message,
      recipient: emailData.to
    };
  }
};

// Send bulk birthday emails
export const sendBulkBirthdayEmails = async (emailsData) => {
  const results = [];
  
  for (const emailData of emailsData) {
    const result = await sendBirthdayCouponEmail(emailData);
    results.push(result);
    
    // Add small delay between emails to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  return results;
};

// Send order confirmation email
export const sendOrderConfirmation = async (emailData) => {
  try {
    const transporter = createTransporter();
    
    const { to, customerName, orderNumber, orderItems, totalAmount, deliveryAddress } = emailData;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation - Indiya Restaurant</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .header { background: linear-gradient(135deg, #c3a85c, #d4b86a); color: white; padding: 30px 20px; text-align: center; }
          .content { padding: 30px 20px; }
          .order-details { background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Order Confirmed!</h1>
            <p>Thank you for your order, ${customerName}</p>
          </div>
          <div class="content">
            <h2>Order #${orderNumber}</h2>
            <div class="order-details">
              <h3>Order Items:</h3>
              <ul>
                ${orderItems.map(item => `<li>${item.name} x ${item.quantity} - £${(item.price * item.quantity).toFixed(2)}</li>`).join('')}
              </ul>
              <p><strong>Total: £${totalAmount.toFixed(2)}</strong></p>
              <p><strong>Delivery Address:</strong> ${deliveryAddress}</p>
            </div>
            <p>Your order is being prepared and will be delivered soon!</p>
          </div>
          <div class="footer">
            <p><strong>Indiya Bar & Restaurant</strong></p>
            <p>180 High Street, Orpington, BR6 0JW</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Indiya Restaurant" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: `Order Confirmation #${orderNumber} - Indiya Restaurant`,
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Order confirmation email sent to ${to}:`, result.messageId);
    
    return { success: true, messageId: result.messageId, recipient: to };
    
  } catch (error) {
    console.error(`❌ Failed to send order confirmation email to ${emailData.to}:`, error);
    return { success: false, error: error.message, recipient: emailData.to };
  }
};

// Send delivery assignment email
export const sendDeliveryAssignment = async (emailData) => {
  try {
    const transporter = createTransporter();
    
    const { to, deliveryBoyName, orderNumber, customerName, deliveryAddress, customerPhone } = emailData;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Delivery Assignment - Indiya Restaurant</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .header { background: linear-gradient(135deg, #c3a85c, #d4b86a); color: white; padding: 30px 20px; text-align: center; }
          .content { padding: 30px 20px; }
          .delivery-details { background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚚 New Delivery Assignment</h1>
            <p>Hello ${deliveryBoyName}</p>
          </div>
          <div class="content">
            <h2>Order #${orderNumber}</h2>
            <div class="delivery-details">
              <h3>Delivery Details:</h3>
              <p><strong>Customer:</strong> ${customerName}</p>
              <p><strong>Phone:</strong> ${customerPhone}</p>
              <p><strong>Address:</strong> ${deliveryAddress}</p>
            </div>
            <p>Please prepare for delivery. Contact the customer if needed.</p>
          </div>
          <div class="footer">
            <p><strong>Indiya Bar & Restaurant</strong></p>
            <p>180 High Street, Orpington, BR6 0JW</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Indiya Restaurant" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: `Delivery Assignment #${orderNumber} - Indiya Restaurant`,
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Delivery assignment email sent to ${to}:`, result.messageId);
    
    return { success: true, messageId: result.messageId, recipient: to };
    
  } catch (error) {
    console.error(`❌ Failed to send delivery assignment email to ${emailData.to}:`, error);
    return { success: false, error: error.message, recipient: emailData.to };
  }
};

// Send reservation confirmation email
export const sendReservationConfirmation = async (emailData) => {
  try {
    const transporter = createTransporter();
    
    const { to, customerName, reservationDate, reservationTime, partySize, specialRequests } = emailData;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reservation Confirmation - Indiya Restaurant</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
          .header { background: linear-gradient(135deg, #c3a85c, #d4b86a); color: white; padding: 30px 20px; text-align: center; }
          .content { padding: 30px 20px; }
          .reservation-details { background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 5px; }
          .footer { background: #333; color: white; padding: 20px; text-align: center; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🍽️ Reservation Confirmed!</h1>
            <p>Thank you ${customerName}, we look forward to serving you</p>
          </div>
          <div class="content">
            <div class="reservation-details">
              <h3>Reservation Details:</h3>
              <p><strong>Date:</strong> ${reservationDate}</p>
              <p><strong>Time:</strong> ${reservationTime}</p>
              <p><strong>Party Size:</strong> ${partySize} ${partySize === 1 ? 'person' : 'people'}</p>
              ${specialRequests ? `<p><strong>Special Requests:</strong> ${specialRequests}</p>` : ''}
            </div>
            <p>We have reserved your table and look forward to providing you with an exceptional dining experience.</p>
            <p>If you need to make any changes or cancel your reservation, please contact us at least 2 hours in advance.</p>
          </div>
          <div class="footer">
            <p><strong>Indiya Bar & Restaurant</strong></p>
            <p>180 High Street, Orpington, BR6 0JW</p>
            <p>Phone: ${process.env.RESTAURANT_PHONE || '+44 (0)1689451403'}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.EMAIL_FROM || `"Indiya Restaurant" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: `Reservation Confirmation - ${reservationDate} at ${reservationTime}`,
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Reservation confirmation email sent to ${to}:`, result.messageId);
    
    return { success: true, messageId: result.messageId, recipient: to };
    
  } catch (error) {
    console.error(`❌ Failed to send reservation confirmation email to ${emailData.to}:`, error);
    return { success: false, error: error.message, recipient: emailData.to };
  }
};