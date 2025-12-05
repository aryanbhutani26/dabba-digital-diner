import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

console.log('Testing nodemailer...');
console.log('nodemailer version:', nodemailer);
console.log('createTransporter exists:', typeof nodemailer.createTransporter);

// Test Gmail configuration
if (process.env.EMAIL_SERVICE === 'gmail') {
  console.log('\n✅ Gmail configuration detected');
  console.log('Email User:', process.env.EMAIL_USER);
  console.log('Email Password:', process.env.EMAIL_PASSWORD ? '***configured***' : 'NOT SET');
  
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    
    console.log('✅ Transporter created successfully!');
    
    // Verify connection
    transporter.verify((error, success) => {
      if (error) {
        console.log('❌ Connection error:', error.message);
      } else {
        console.log('✅ Server is ready to send emails!');
      }
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Error creating transporter:', error.message);
    process.exit(1);
  }
} else {
  console.log('⚠️  Gmail not configured, using Ethereal test account');
  process.exit(0);
}
