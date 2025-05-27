const express = require('express');
const router = express.Router();
const { transporter, adminEmail } = require('../config/nodemailer');

router.post('/send-welcome-email', async (req, res) => {
  const { email, fullName, password } = req.body;

  try {
    const mailOptions = {
      from: 'rajeshyanamadala2000@gmail.com',
      to: email,
      subject: 'Welcome to SutraCart!',
      html: `
        <h2>Hi ${fullName},</h2>
        <p>Thank you for registering on SutraCart. We're excited to have you!</p>
        <p><strong>Your login credentials:</strong></p>
        <ul>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Password:</strong> ${password}</li>
        </ul>
        <p>We recommend changing your password after logging in for security purposes.</p>
        <br>
        <p>– SutraCart Team</p>
      `
    };

    await transporter.sendMail(mailOptions);
    res.status(200).send({ success: true, message: "Email sent successfully" });
  } catch (error) {
    console.error("Email send error:", error);
    res.status(500).send({ success: false, message: "Failed to send email" });
  }
});

router.post('/send-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const mailOptions = {
      from: 'rajeshyanamadala2000@gmail.com',
      to: email,
      subject: 'SutraCart OTP Verification',
      html: `<p>Your OTP is <strong>${otp}</strong>. It is valid for 5 minutes.</p>`
    };

    await transporter.sendMail(mailOptions);
    res.status(200).send({ success: true, message: 'OTP sent successfully' });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).send({ success: false, message: "Failed to send OTP" });
  }
});

router.post('/send-order-confirmation', async (req, res) => {
  const { email, orderId, amount, items } = req.body;

  if (!email || !orderId || !amount || !items) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const orderItemsHtml = items.map(item => 
    `<li>${item.name} (x${item.quantity}) - ₹${item.price}</li>`
  ).join('');

  const customerMailOptions = {
    from: 'rajeshyanamadala2000@gmail.com',
    to: email,
    subject: 'Order Confirmation',
    html: `
      <h1>Thank you for your order!</h1>
      <p>Your order #${orderId} has been received.</p>
      <p>Total amount: ₹${amount}</p>
      <h3>Order Items:</h3>
      <ul>${orderItemsHtml}</ul>
      <p>We'll notify you when your order ships.</p>
    `
  };

  const adminMailOptions = {
    from: 'rajeshyanamadala2000@gmail.com',
    to: adminEmail,
    subject: `New Order Received - #${orderId}`,
    html: `
      <h1>New Order Notification</h1>
      <p>Order ID: ${orderId}</p>
      <p>Customer Email: ${email}</p>
      <p>Total amount: ₹${amount}</p>
      <h3>Order Items:</h3>
      <ul>${orderItemsHtml}</ul>
    `
  };

  try {
    await Promise.all([
      transporter.sendMail(customerMailOptions),
      transporter.sendMail(adminMailOptions)
    ]);
    res.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

module.exports = router;