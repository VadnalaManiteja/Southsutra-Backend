const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const authRoutes = require('./routes/auth');
const emailRoutes = require('./routes/email');
const mysqlRoutes = require('./routes/mysql');
const paymentRoutes = require('./routes/payment');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/', authRoutes);
app.use('/', emailRoutes);
app.use('/', mysqlRoutes);
app.use('/', paymentRoutes);

// Root route
app.get('/', (req, res) => {
  res.send("Hello World! This is the modular SutraCart server.");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;