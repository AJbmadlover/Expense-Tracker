const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// creates JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d", // tokens last a week
  });
};

// Temporary in-memory blacklist (can be stored in DB later)
let tokenBlacklist = [];

// Signup controller
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    const user = await User.create({ name, email, password });

    const token = generateToken(user._id);
    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

//  Login controller
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Please provide email and password" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user._id);
    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

//  Logout controller
exports.logout = async (req, res) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return res.status(400).json({ message: "No token provided" });

    tokenBlacklist.push(token); // invalidate token
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};


exports.profile = async (req,res) => {
  // try {
  //   // req.user is already attached by the protect middleware
  //   const user = req.user;

  //   if (!user) {
  //     return res.status(404).json({ message: "User not found" });
  //   }

  //   res.status(200).json({
  //     name: user.name,
  //     email: user.email,
  //     id: user._id,
  //     createdAt: user.createdAt,
  //   });
  // } catch (error) {
  //   console.error("Error fetching user profile:", error);
  //   res.status(500).json({ message: "Server error" });
  // }

  try {
    // req.user is set in your auth middleware
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.status(200).json({
      name: user.name,
      email: user.email,
      id: user._id,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error("Error fetching user profile:",error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Helper for middleware to check if token is blacklisted
exports.isTokenBlacklisted = (token) => tokenBlacklist.includes(token);
