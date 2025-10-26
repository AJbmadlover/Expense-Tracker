const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getSummary
} = require("../controllers/transactionController");

// Protected transaction routes
router.post("/", protect, createTransaction);
router.get("/", protect, getTransactions);
router.get("/summary", protect, getSummary);
router.get("/:id", protect, getTransactionById);
router.put("/:id", protect, updateTransaction);
router.delete("/:id", protect, deleteTransaction);


module.exports = router;
