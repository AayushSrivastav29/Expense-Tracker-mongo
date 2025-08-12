const mongoose = require("mongoose");

const Expense = new mongoose.Schema(
  {
    amount: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    UserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expense", Expense);

// const { Sequelize, DataTypes } = require("sequelize");
// const sequelize = require("../utils/db-connection");

// const Expense = sequelize.define("Expense", {
//   id: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     primaryKey: true,
//     autoIncrement: true,
//   },
//   amount: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//   },
//   description: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   category: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   UserId: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     references: {
//       model: "Users", // Matches table name
//       key: "id",
//     },
//   },
// });

// module.exports = Expense;
