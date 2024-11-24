// app.js

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Simple route for testing
app.get('/', (req, res) => {
  res.send('FamWallet Backend API is running');
});

// Define user routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/families', require('./routes/familyRoutes'));
app.use('/api/transactions', require('./routes/transactionRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/finance', require('./routes/userFinanceRoutes'));

// Start the server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
