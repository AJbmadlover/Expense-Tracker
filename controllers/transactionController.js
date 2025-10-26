const Transaction = require("../models/transactionModel");

//  Create a new transaction
exports.createTransaction = async (req, res) => {
  try {
    const { amount, type, category, description, date } = req.body;

    if (!amount || !type || !category) {
      return res.status(400).json({ message: "Amount, type, and category are required" });
    }
    if (type !== "income" && type !== "expense")
        return res.status(400).json({ message: "Type must be 'income' or 'expense'" });

    if (amount <= 0)
        return res.status(400).json({ message: "Amount must be greater than 0" });

    const transaction = await Transaction.create({
      userId: req.user._id, // we’ll get this from the auth middleware later
      amount,
      type,
      category,
      description,
      date,
    });

    res.status(201).json({
      message: "Transaction added successfully",
      transaction,
    });



  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all transactions for logged-in user
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ userId: req.user._id }).sort({
      date: -1, //newest transaction is displayed first
    });
    res.json(transactions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

//  Gets a single transaction
exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id:req.params.id,
      userId: req.user._id,
    });

    if (!transaction)
      return res.status(404).json({ message: "Transaction not found" });

    res.json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

//  Update a transaction
exports.updateTransaction = async (req, res) => {
  try {

    if (req.body.userId) delete req.body.userId; //prevents accidentally updating user ID

    if (req.body.type && req.body.type !== "income" && req.body.type !== "expense") {
        return res.status(400).json({ message: "Type must be 'income' or 'expense'" });
    }
    if (req.body.amount && req.body.amount <= 0) {
        return res.status(400).json({ message: "Amount must be greater than 0" });
    }
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );


    if (!transaction)
      return res.status(404).json({ message: "Transaction not found" });

    res.json({
      message: "Transaction updated successfully",
      transaction,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

//  Delete a transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!transaction)
      return res.status(404).json({ message: "Transaction not found" });

    res.json({ message: "Transaction deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get income, expenses, and balance summary
// @route   GET /api/transactions/summary
// @access  Private
exports.getSummary = async (req, res) => {

  try {
    const transactions = await Transaction.find({ userId: req.user._id });

    const income = transactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    // Group expenses by category
    const expensesByCategory = {};
    transactions
      .filter(t => t.type === "expense")
      .forEach(t => {
        if (expensesByCategory[t.category]) {
          expensesByCategory[t.category] += t.amount;
        } else {
          expensesByCategory[t.category] = t.amount;
        }
      });

    const balance = income - expenses;

    res.status(200).json({
      income,
      expenses,
      balance,
      totalTransactions: transactions.length,
      expensesByCategory, // new addition
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
