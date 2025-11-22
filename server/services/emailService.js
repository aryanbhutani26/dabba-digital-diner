import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const createTransporter = () => {
  // For development, use Ethereal (fake SMTP)
  // For production, use real SMTP service (Gmail, SendGrid, etc.)
  
  if (process.env.EMAIL_SERVICE === 'gmail') {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  
  // Default: Use Ethereal for testing (creates test account automatically)
  return null; // Will be created dynamically
};

// Send order confirmation email
export const sendOrderConfirmation = async (orderData) => {
  try {
    let transporter = createTransporter();
    
    // If no transporter, create test account
    if (!transporter) {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Indiya Restaurant" <noreply@indiya.com>',
      to: orderData.customerEmail,
      subject: `Order Confirmation - #${orderData.orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #D97706 0%, #F59E0B 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .order-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .total { font-size: 18px; font-weight: bold; color: #D97706; margin-top: 15px; }
            .button { display: inline-block; background: #D97706; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Order Confirmed!</h1>
              <p>Thank you for your order</p>
            </div>
            <div class="content">
              <h2>Hi ${orderData.customerName},</h2>
              <p>Your order has been confirmed and is being prepared. We'll notify you when it's on the way!</p>
              
              <div class="order-details">
                <h3>Order #${orderData.orderNumber}</h3>
                <p><strong>Order Date:</strong> ${new Date(orderData.createdAt).toLocaleString()}</p>
                <p><strong>Delivery Address:</strong><br>${orderData.deliveryAddress}</p>
                
                <h4 style="margin-top: 20px;">Items:</h4>
                ${orderData.items.map(item => `
                  <div class="item">
                    <span>${item.quantity}x ${item.name}</span>
                    <span>₹${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                `).join('')}
                
                <div class="item">
                  <span>Delivery Fee</span>
                  <span>₹${orderData.deliveryFee}</span>
                </div>
                
                <div class="total">
                  <div class="item" style="border: none;">
                    <span>Total</span>
                    <span>₹${orderData.totalAmount}</span>
                  </div>
                </div>
              </div>
              
              <center>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/track-order?id=${orderData._id}" class="button">
                  Track Your Order
                </a>
              </center>
              
              <p style="margin-top: 30px;">If you have any questions, feel free to contact us at ${process.env.RESTAURANT_PHONE || '+91 98765 43210'}</p>
            </div>
            <div class="footer">
              <p>Indiya Bar & Restaurant</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    
    // Log preview URL for Ethereal
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Email Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Send reservation confirmation email
export const sendReservationConfirmation = async (reservationData) => {
  try {
    let transporter = createTransporter();
    
    if (!transporter) {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Indiya Restaurant" <noreply@indiya.com>',
      to: reservationData.email,
      subject: `Reservation Confirmed - ${reservationData.name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #D97706 0%, #F59E0B 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .reservation-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { padding: 10px 0; border-bottom: 1px solid #eee; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🍽️ Reservation Confirmed!</h1>
              <p>We look forward to serving you</p>
            </div>
            <div class="content">
              <h2>Hi ${reservationData.name},</h2>
              <p>Your table reservation has been confirmed. We can't wait to welcome you!</p>
              
              <div class="reservation-details">
                <h3>Reservation Details</h3>
                <div class="detail-row">
                  <strong>Name:</strong> ${reservationData.name}
                </div>
                <div class="detail-row">
                  <strong>Date:</strong> ${reservationData.date}
                </div>
                <div class="detail-row">
                  <strong>Time:</strong> ${reservationData.time}
                </div>
                <div class="detail-row">
                  <strong>Guests:</strong> ${reservationData.guests} people
                </div>
                <div class="detail-row">
                  <strong>Phone:</strong> ${reservationData.phone}
                </div>
                ${reservationData.specialRequests ? `
                <div class="detail-row">
                  <strong>Special Requests:</strong> ${reservationData.specialRequests}
                </div>
                ` : ''}
              </div>
              
              <p><strong>Important:</strong> Please arrive 10 minutes before your reservation time. If you need to cancel or modify your reservation, please call us at ${process.env.RESTAURANT_PHONE || '+91 98765 43210'}</p>
              
              <p style="margin-top: 30px;">We look forward to providing you with an exceptional dining experience!</p>
            </div>
            <div class="footer">
              <p>Indiya Bar & Restaurant</p>
              <p>${process.env.RESTAURANT_ADDRESS || 'Your Restaurant Address'}</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Email Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Send delivery assignment notification
export const sendDeliveryAssignment = async (deliveryData) => {
  try {
    let transporter = createTransporter();
    
    if (!transporter) {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    const mailOptions = {
      from: process.env.EMAIL_FROM || '"Indiya Restaurant" <noreply@indiya.com>',
      to: deliveryData.deliveryBoyEmail,
      subject: `New Delivery Assignment - Order #${deliveryData.orderNumber}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .delivery-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { padding: 10px 0; border-bottom: 1px solid #eee; }
            .button { display: inline-block; background: #3B82F6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📦 New Delivery Assignment</h1>
              <p>Order #${deliveryData.orderNumber}</p>
            </div>
            <div class="content">
              <h2>Hi ${deliveryData.deliveryBoyName},</h2>
              <p>You have been assigned a new delivery. Please check the details below:</p>
              
              <div class="delivery-details">
                <h3>Delivery Information</h3>
                <div class="detail-row">
                  <strong>Customer:</strong> ${deliveryData.customerName}
                </div>
                <div class="detail-row">
                  <strong>Phone:</strong> ${deliveryData.customerPhone}
                </div>
                <div class="detail-row">
                  <strong>Address:</strong><br>${deliveryData.deliveryAddress}
                </div>
                <div class="detail-row">
                  <strong>Order Total:</strong> ₹${deliveryData.totalAmount}
                </div>
                <div class="detail-row">
                  <strong>Items:</strong> ${deliveryData.itemCount} items
                </div>
              </div>
              
              <center>
                <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/delivery" class="button">
                  View in Dashboard
                </a>
              </center>
              
              <p style="margin-top: 30px;"><strong>Next Steps:</strong></p>
              <ol>
                <li>Pick up the order from the restaurant</li>
                <li>Update status to "Picked Up"</li>
                <li>Navigate to customer location</li>
                <li>Update status to "Out for Delivery"</li>
                <li>Complete delivery and mark as "Delivered"</li>
              </ol>
            </div>
            <div class="footer">
              <p>Indiya Bar & Restaurant - Delivery Team</p>
              <p>This is an automated email. Please do not reply.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('📧 Email Preview URL:', nodemailer.getTestMessageUrl(info));
    }
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};
