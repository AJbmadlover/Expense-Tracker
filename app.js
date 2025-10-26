const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const fs = require('fs')
const path = require('path')

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware to parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔹 Serve static files from the "public" folder
// app.use(express.static('public'));

app.use(express.static(path.join(__dirname, "public")));


// Routes
const userRoutes = require("./routes/userRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

// Mount routes
app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);

// 🔹 Frontend routes
// When you go to localhost:5000/signup → loads signup.html
app.get("/api/users/signup", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "signUp.html"));
});

// When you go to localhost:5000/signin → loads signin.html
app.get("/api/users/signin", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "signIn.html"));
});

app.get("/api/users/dashboard", (req,res)=>{
  res.sendFile(path.join(__dirname, "public", "dashboard.html"));
})

app.get("/api/users/transactions", (req,res)=>{
  res.sendFile(path.join(__dirname, "public", "transactions.html"))
})

app.get("/api/users/summary", (req,res)=>{
  res.sendFile(path.join(__dirname, "public", "summary.html"))
})

// You can add more static pages later (dashboard, profile, etc.)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});


// Root endpoint
app.get("/", (req, res) => {
  res.json({ message: "Expense Tracker API is running 🚀" });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler (optional, can be expanded)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server error", error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
