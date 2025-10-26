const express = require("express");
const router = express.Router();
const {
  signup,
  login,
  logout,
  profile,
} = require("../controllers/userController");
const { protect } = require("../middleware/auth");

// Public routes
router.post("/signup", signup); 
router.post("/login", login);

// Protected routes
router.post("/logout", protect, logout);
router.get("/profile", protect, profile); // optional: get current user info

module.exports = router;
