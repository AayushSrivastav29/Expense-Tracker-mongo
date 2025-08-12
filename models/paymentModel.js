const mongoose = require("mongoose");

const Payment = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
  },
  paymentSessionId: {
    type: String,
    required: true,
  },
  orderAmount: {
    type: Number,
    required: true,
  },
  orderCurrency: {
    type: String,
    default: "INR",
  },
  paymentStatus: {
    type: String,
    default: "pending",
  },
}, { timestamps: true });

module.exports= mongoose.model('Payment', Payment);

// const { Sequelize, DataTypes } = require("sequelize");
// const sequelize = require("../utils/db-connection");

// const Payment = sequelize.define('Payment', {
//     orderId: {
//         type: Sequelize.STRING(),
//         allowNull: false,
//         primaryKey: true
//     },
//     paymentSessionId: {
//         type: Sequelize.STRING(),
//         allowNull: false
//     },
//     orderAmount:{
//         type: Sequelize.INTEGER,
//         allowNull :false
//     },
//     orderCurrency:{
//         type: Sequelize.STRING(),
//         defaultValue:"INR",
//     },
//     paymentStatus:{
//         type: Sequelize.STRING(),
//         defaultValue:"pending",
//     }
// })
// module.exports=Payment;
