const express = require('express');
const bodyParser = require("body-parser");
const cors = require("cors");
const Razorpay = require("razorpay");
const nodemailer = require('nodemailer');

const app = express();
const port = 5000;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'rajeshyanamadala2000@gmail.com',
        pass: 'thpr ipkp cubr hupw'  // Use App Password, not your real Gmail password
    },
    tls: {
        rejectUnauthorized: false
    }
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); 

app.get('/', (req, res) => {
    res.send("Hello World!");
})

app.post('/orders', async(req, res) => {
    const razorpay = new Razorpay({
        key_id: "rzp_test_PhWbtmUxU6a9Vf",
        key_secret: "jw2cBoogPEj2jzIvwlAiTJuk"
    })

    const options = {
        amount: req.body.amount,
        currency: req.body.currency,
        receipt: "receipt#1",
        payment_capture: 1
    }

    try {
        const response = await razorpay.orders.create(options)

        res.json({
            order_id: response.id,
            currency: response.currency,
            amount: response.amount
        })
    } catch (error) {
        res.status(500).send("Internal server error")
    }
})

app.get("/payment/:paymentId", async(req, res) => {
    const {paymentId} = req.params;

    const razorpay = new Razorpay({
        key_id: "rzp_test_PhWbtmUxU6a9Vf",
        key_secret: "jw2cBoogPEj2jzIvwlAiTJuk"
    })
    
    try {
        const payment = await razorpay.payments.fetch(paymentId)

        if (!payment){
            return res.status(500).json("Error at razorpay loading")
        }

        res.json({
            status: payment.status,
            method: payment.method,
            amount: payment.amount,
            currency: payment.currency
        })
    } catch(error) {
        res.status(500).json("failed to fetch")
    }
})
const adminEmail = 'uppalahemanth4@gmail.com';

app.post('/send-order-confirmation', async (req, res) => {
  console.log("Headers:", req.headers);
  console.log("Raw body:", req.body);
  
  if (!req.body) {
    return res.status(400).json({ error: "No request body received" });
  }

  const { email, orderId, amount, items } = req.body;
  console.log("Received email request:", { email, orderId, amount, items });

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
    // Send emails to customer and admin in parallel
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




app.listen(port, () => {
    console.log(`server is running on ${port}`);
})