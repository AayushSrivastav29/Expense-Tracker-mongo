const mongoose = require("mongoose");

const User = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  totalExpense: {
    type: Number,
    default: 0,
  },
  isPremium: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("User", User);

// const { Sequelize, DataTypes } = require("sequelize");
// const sequelize = require("../utils/db-connection");

// const Users = sequelize.define("Users", {
//   id: {
//     type: DataTypes.INTEGER,
//     allowNull: false,
//     primaryKey: true,
//     autoIncrement: true,
//   },
//   name: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   email: {
//     type: DataTypes.STRING,
//     allowNull: false,
//     unique: true,
//   },
//   password: {
//     type: DataTypes.STRING,
//     allowNull: false,
//   },
//   totalExpense: {
//     type: DataTypes.INTEGER,
//     defaultValue: 0,
//   },
//   isPremium: {
//     type: DataTypes.BOOLEAN,
//     defaultValue: false,
//   },
// });

// module.exports = Users;
