const mongoose = require("mongoose");

const Order = new mongoose.Schema(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
    },
    amount: {
      type: Number,
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

module.exports = mongoose.model("Order", Order);

// const { Sequelize, DataTypes } = require("sequelize");
// const sequelize = require("../utils/db-connection");

// const Order = sequelize.define('Order', {
//     id: {
//         type: DataTypes.INTEGER,
//         autoIncrement: true,
//         allowNull: false,
//         primaryKey: true
//     },
//     orderId: {
//         type: DataTypes.STRING,
//         allowNull: false,
//         unique: true
//     },
//     status: {
//         type: DataTypes.ENUM('PENDING', 'SUCCESS', 'FAILED'),
//         defaultValue: "PENDING",
//     },
//     amount: {
//         type: DataTypes.INTEGER,
//         allowNull: false
//     }
// });

// module.exports = Order;
