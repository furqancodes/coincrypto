const mongoose = require("mongoose");
const walletUserSchema = new mongoose.Schema({
  privateKey: {
    type: String,
    required: true,
  },
  publicKey: {
    type: String,
    required: true,
  },
  balance: {
    type: Number,
    default: 0,
  },
});
const WalletUser = mongoose.model("WalletUser", walletUserSchema);
module.exports = WalletUser;
