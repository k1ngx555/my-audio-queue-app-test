const express = require("express");
const router = express.Router();

// Calculate donation fees (demo)
router.post("/calculate-fees", (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) return res.status(400).json({ error: "Invalid amount" });
  const stripeFee = amount * 0.029 + 0.30;
  const platformFee = amount * 0.05;
  const net = amount - stripeFee - platformFee;
  res.json({
    amount,
    stripeFee: Number(stripeFee.toFixed(2)),
    platformFee: Number(platformFee.toFixed(2)),
    net: Number(net.toFixed(2))
  });
});

module.exports = router;
