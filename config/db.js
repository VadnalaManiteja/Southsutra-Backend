const admin = require("firebase-admin");
const serviceAccount = require("../southsutraecommerce.json");
const mysql = require('mysql2');

// Firebase configuration
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://tickettracker-dedc6-default-rtdb.firebaseio.com"
});

const dbFirestore = admin.firestore();
const auth = admin.auth();

// MySQL configuration
const dbMySQL = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'bulk_orders_db'
});

dbMySQL.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL database');
});

// Razorpay configuration
const Razorpay = require("razorpay");
const razorpay = new Razorpay({
  key_id: "rzp_test_PhWbtmUxU6a9Vf",
  key_secret: "jw2cBoogPEj2jzIvwlAiTJuk"
});

module.exports = {
  dbFirestore,
  auth,
  dbMySQL,
  razorpay
};