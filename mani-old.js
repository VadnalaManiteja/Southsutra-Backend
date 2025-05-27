const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // default XAMPP username
  password: '', // default XAMPP password is empty
  database: 'bulk_orders_db'
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// API Endpoint to handle form submission
app.post('/api/bulk-order', (req, res) => {
  const {
    full_name,
    company_name,
    email,
    phone,
    selectedProducts = {
      lemon: false,
      pulihora: false,
      sorakaya: false,
      tomato: false
    },
    shipping_city,
    shipping_pincode,
    additional_message
  } = req.body;

  const query = `
    INSERT INTO bulk_orders 
    (full_name, company_name, email, phone, 
     lemon_chutney, pulihora_chutney, sorakaya_chutney, tomato_chutney,
     shipping_city, shipping_pincode, additional_message)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    query,
    [
      full_name,
      company_name,
      email,
      phone,
      selectedProducts.lemon || false,
      selectedProducts.pulihora || false,
      selectedProducts.sorakaya || false,
      selectedProducts.tomato || false,
      shipping_city || null,
      shipping_pincode || null,
      additional_message || null
    ],
    (err, result) => {
      if (err) {
        console.error('Error saving order:', err);
        return res.status(500).json({ error: 'Failed to save order' });
      }
      res.json({ message: 'Order submitted successfully!', id: result.insertId });
    }
  );
});

app.post('/api/contact', (req, res) => {
  const { name, email, phone, message } = req.body;
  
  const query = 'INSERT INTO contact_submissions (name, email, phone, message) VALUES (?, ?, ?, ?)';
  
  db.query(query, [name, email, phone, message], (err, result) => {
    if (err) {
      console.error('Error saving contact form:', err);
      return res.status(500).json({ error: 'Failed to submit form' });
    }
    res.status(200).json({ message: 'Form submitted successfully!' });
  });
});




//theme

app.get('/get-active-theme', (req, res) => {
  // Query to fetch the active theme
  db.query("SELECT * FROM themes WHERE is_active = 1 LIMIT 1", (err, results) => {
    if (err) {
      console.error('Error fetching theme:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: 'No active theme found' });
    }

    // Return the first active theme
    res.status(200).json(results[0]);
  });
});


app.get('/contact-submissions', (req, res) => {
  const sql = 'SELECT * FROM contact_submissions ORDER BY submission_date DESC';
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database query failed' });
    }
    res.json(results);
  });
});


app.get('/bulk-order-leads', (req, res) => {
  const sql = 'SELECT * FROM bulk_orders ORDER BY created_at DESC';
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Database query failed' });
    }
    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});