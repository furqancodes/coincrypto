const { STARTING_BALANCE } = require("../../config");
const { ec } = require("../utils");
const { cryptoHash } = require("../utils");
const Transaction = require("../transaction/Transaction");
require("dotenv").config();

class Wallet {
  constructor(privateKey) {
    this.keyPair = privateKey ? ec.keyFromPrivate(privateKey) : ec.genKeyPair();
    this.balance = STARTING_BALANCE;
    this.publicKey = this.keyPair.getPublic().encode("hex");
    this.privateKey = this.keyPair.getPrivate().toString("hex");
  }

  sign(data) {
    return this.keyPair.sign(cryptoHash(data));
  }

  static createTransaction({ senderWallet, amount, recipient, chain }) {
    senderWallet.balance = Wallet.calculateBalance({
      chain,
      address: senderWallet.publicKey,
    });
    if (amount > senderWallet.balance) {
      throw new Error("amount exceeds balance");
    }
    const transaction = new Transaction({
      senderWallet,
      recipient,
      amount,
    });
    return transaction;
  }

  static walletTransactions({ wallet, chain }) {
    const transactions = [];
    for (let i = 1; i < chain.length; i++) {
      const { data } = chain[i];
      for (let j = 0; j < data.length; j++) {
        const { outputMap } = data[j];
        if (outputMap[wallet.publicKey]) {
          transactions.push(data[j]);
        }
      }
    }
    return transactions;
  }

  static calculateBalance({ chain, address }) {
    let hasConductedTransaction = false;
    let totalAmount = 0;
    for (let i = chain.length - 1; i > 0; i--) {
      const { data } = chain[i];
      for (let j = 0; j < data.length; j++) {
        const { outputMap, input } = data[j];
        if (input.address === address) {
          hasConductedTransaction = true;
        }

        if (outputMap[address]) {
          totalAmount = totalAmount + outputMap[address];
        }
      }
      if (hasConductedTransaction) {
        break;
      }
    }
    return hasConductedTransaction
      ? totalAmount
      : STARTING_BALANCE + totalAmount;
  }
}
module.exports = Wallet;
