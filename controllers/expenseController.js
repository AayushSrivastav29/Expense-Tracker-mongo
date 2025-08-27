const User = require("../models/userModel");
const Expense = require("../models/expenseModel");
const sequelize = require("../utils/db-connection");
const fs = require("fs");
const mongoose = require('mongoose');
const path = require("path");
//create
const createExpense = async (req, res) => {
  try {
    const { amount, description, category } = req.body;
    const userId = req.user._id;

    const expense = new Expense({
      amount: parseFloat(amount),
      description,
      category,
      UserId: userId,
    });

    await expense.save();

    await User.findByIdAndUpdate(userId, {
      $inc: { totalExpense: parseFloat(amount) },
    });

    res.status(201).send(expense);
  } catch (error) {
    console.log(error);
    res.status(500).send(`error in creating expense: ${error}`);
  }
};

//read
const getExpense = async (req, res) => {
  try {
    const userId = req.user._id;
    const allExpense = await Expense.find({ UserId: userId }).sort({
      createdAt: -1,
    });

    if (!allExpense || allExpense.length === 0) {
      return res.status(404).send(`No expense record found`);
    } else {
      res.status(200).send(allExpense);
    }
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .send(`error in retreiving all expense record: ${error.message}`);
  }
};

// DELETE
const deleteExpense = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const id = req.params.id;
    const userId = req.user._id;

    // find the expense
    const expense = await Expense.findById(id).session(session);
    if (!expense) {
      await session.abortTransaction();
      session.endSession();
      return res
        .status(404)
        .send(`Expense not found to be deleted with id: ${id}`);
    }

    // delete expense
    await Expense.deleteOne({ _id: id }).session(session);

    // subtract from totalExpense (atomic)
    await User.findByIdAndUpdate(
      userId,
      { $inc: { totalExpense: -parseFloat(expense.amount) } },
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(200).send("expense deleted successfully");
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error(error);
    res.status(500).send("Expense cannot be deleted");
  }
};

//update
const updateExpense = async (req, res) => {
  try {
    const id = req.params.id;
    const { amount, description, category } = req.body;
    const userId = req.user._id;

    // First find the expense to update
    const expenseToUpdate = await Expense.findById(id);

    if (!expenseToUpdate) {
      return res.status(404).send(`Expense with id: ${id} not found`);
    }

    // Update the expense with new values
    const oldAmount = expenseToUpdate.amount;
    const newAmount = parseFloat(amount);

    expenseToUpdate.amount = newAmount;
    if (description !== undefined) expenseToUpdate.description = description;
    expenseToUpdate.category = category;
    await expenseToUpdate.save();

    //update user totalExpense
    const diff = oldAmount - newAmount;
    await User.findByIdAndUpdate(userId, {
      $inc: { totalExpense: diff },
    });

    res.status(200).json(expenseToUpdate);
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(500).send("Expense could not be updated");
  }
};

//download expense report
const downloadExpenseReport = async (req, res) => {
  try {
    const userId = req.user._id;

    const allExpense = await Expense.find({ UserId: userId }).sort({
      createdAt: -1,
    });
    if (!allExpense || allExpense.length === 0) {
      return res.status(404).send("No expense records found");
    }

    // 2. Create CSV content
    let csvData = "Date,Description,Category,Expense,Income\n";

    allExpense.forEach((expense) => {
      const date = new Date(expense.createdAt).toLocaleDateString("en-IN");
      const description = expense.description;
      let category = expense.category;
      const amount = expense.amount;

      // Validate category
      const validCategories = [
        "groceries",
        "entertainment",
        "rent",
        "bills",
        "fuel",
        "salary",
        "essentials",
      ];
      if (!validCategories.includes(category)) {
        category = "uncategorized";
      }

      // Income column only shows salary, others go to Expense
      const income = category === "salary" ? amount : "";
      const expenseAmount = category !== "salary" ? amount : "";

      csvData += `${date},${description},${category},${expenseAmount},${income}\n`;
    });

    // 3. Generate monthly summary
    const monthlySummary = {};
    allExpense.forEach((expense) => {
      const monthYear = new Date(expense.createdAt).toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
      if (!monthlySummary[monthYear]) {
        monthlySummary[monthYear] = { income: 0, expense: 0 };
      }

      if (expense.category === "salary") {
        monthlySummary[monthYear].income += parseFloat(expense.amount);
      } else {
        monthlySummary[monthYear].expense += parseFloat(expense.amount);
      }
    });

    // 4. Generate yearly summary
    const yearlySummary = {};
    allExpense.forEach((expense) => {
      const year = new Date(expense.createdAt).getFullYear();
      if (!yearlySummary[year]) {
        yearlySummary[year] = { income: 0, expense: 0 };
      }

      if (expense.category === "salary") {
        yearlySummary[year].income += parseFloat(expense.amount);
      } else {
        yearlySummary[year].expense += parseFloat(expense.amount);
      }
    });

    // 5. Add summary tables to CSV
    csvData += "\n\nMonthly Summary\nMonth,Income,Expense,Savings\n";
    Object.entries(monthlySummary).forEach(([month, data]) => {
      const savings = data.income - data.expense;
      csvData += `${month},${data.income},${data.expense},${savings}\n`;
    });

    csvData += "\n\nYearly Summary\nYear,Income,Expense,Savings\n";
    Object.entries(yearlySummary).forEach(([year, data]) => {
      const savings = data.income - data.expense;
      csvData += `${year},${data.income},${data.expense},${savings}\n`;
    });
     // 6. Create temp directory and file
    const dir = path.join(__dirname, "..", "temp");
    console.log(dir);
    
    // Create temp directory if it doesn't exist
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const filepath = path.join(dir, `expenses-${userId}-${Date.now()}.csv`);
    fs.writeFileSync(filepath, csvData, "utf8");
    
    res.download(filepath, "expenses.csv", (err) => {
      if (err) {
        console.error("Error in downloading file: ", err);
      }
      // Clean up: delete the temporary file
      try {
        fs.unlinkSync(filepath);
      } catch (unlinkErr) {
        console.error("Error deleting temporary file:", unlinkErr);
      }
    });
    
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Failed to generate expense report" });
  }
};

module.exports = {
  getExpense,
  createExpense,
  deleteExpense,
  updateExpense,
  downloadExpenseReport,
};
