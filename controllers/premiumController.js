// find total expenses & group by userid
// extract name of user from userid from usertable

const Users = require("../models/userModel");

const totalExpensesOfUsers = async (req, res) => {
  try {
    const users = await Users.find({}, "name totalExpense").sort({
      totalExpense: -1,
    });

    res.status(200).json({
      success: true,
      data: users.map((u) => ({
        userName: u.name,
        totalExpenses: parseFloat(u.totalExpense),
      })),
    });
  } catch (error) {
    console.error("Error fetching total expenses:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching total expenses",
      error: error.message,
    });
  }
};

module.exports = {
  totalExpensesOfUsers,
};
