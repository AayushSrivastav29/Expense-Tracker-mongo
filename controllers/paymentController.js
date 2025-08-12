const {
  createOrder,
  getPaymentStatus,
} = require("../services/cashfreeService");
const Payment = require("../models/paymentModel");
const Order = require("../models/orderModel");
const Users = require("../models/userModel");
const path = require("path");
const TemplateGenerator = require("../Template/htmltemp");

exports.getPaymentPage = (req, res) => {
  res.sendFile(path.join(__dirname, "../view/home.html"));
};

exports.processPayment = async (req, res) => {
  const UserId = req.user._id;
  const orderId = "ORDER-" + Date.now();
  const orderAmount = 2000;
  const orderCurrency = "INR";
  const customerId = "1";
  const customerPhone = "9999999999";

  try {
    // Create order in database first
    const order = await Order.create({
      orderId,
      status: "PENDING",
      amount: orderAmount,
      UserId,
    });

    // Create payment in Cashfree
    const paymentSessionId = await createOrder(
      orderId,
      orderAmount,
      orderCurrency,
      customerId,
      customerPhone
    );
    // Save payment details
    await Payment.create({
      orderId,
      paymentSessionId,
      orderAmount,
      orderCurrency,
      paymentStatus: "PENDING",
    });

    res.json({ paymentSessionId, orderId, success: true });
  } catch (error) {
    console.error("Error processing payment:", error);
    res.status(500).json({
      message: "Error processing payment",
      success: false,
    });
  }
};

exports.getPaymentStatus = async (req, res) => {
  const orderId = req.params.orderId;

  try {
    // Step 1: Fetch order status from Cashfree
    const orderStatus = await getPaymentStatus(orderId);

    const payment = await Payment.findOne({orderId});
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    //  Update Payment table
    payment.paymentStatus = orderStatus;
    await payment.save();

    //  Update Order table
    const order = await Order.findOneAndUpdate(
      { orderId: payment.orderId },
      { status: orderStatus },
      { new: true }
    );

    // Step 4: If payment is successful, mark user as premium
    if (orderStatus === "Success" || orderStatus === "SUCCESS") {
      const order = await Order.findOne({ orderId: payment.orderId });

      if (order && order.UserId) {
        await Users.findByIdAndUpdate(
          order.UserId,
          { isPremium: true },
          { new: true }
        );
      }
    }

    const htmlTemp = TemplateGenerator(
      payment.orderId,
      orderStatus,
      payment.orderAmount
    );
    res.send(htmlTemp);
  } catch (error) {
    console.error("Error fetching payment status:", error);
    res.status(500).json({ message: "Error fetching payment status" });
  }
};
