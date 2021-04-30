const { ec } = require("../utils");
const cryptoHash = require("../utils/cryptoHash");
const Transactions = require("./transactions");

class BankWallet {
  constructor() {
    this.keyPair = ec.genKeyPair();
    this.balance = 0;
    this.publicKey = this.keyPair.getPublic().encode("hex");
  }
  sign(data) {
    return this.keyPair.sign(cryptoHash(data));
  }
  createDepositTransactions({ amount, recipient, chain }) {
    if (chain) {
      this.balance = this.balance - amount;
    } else {
      throw new Error("chain not found");
    }
    const transaction = new Transactions({
      senderWallet: this,
      amount,
      recipient,
    });
    return transaction;
  }
}
module.exports = BankWallet;
