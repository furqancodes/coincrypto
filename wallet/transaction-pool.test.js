const Transactions = require("./transactions");
const Wallet = require("./index");
const Transactionpool = require("./transaction-pool.js");
describe("Transactionpool", () => {
  let transactionPool, transaction, senderWallet;
  beforeEach(() => {
    transactionPool = new Transactionpool();
    senderWallet = new Wallet();
    transaction = new Transactions({
      senderWallet,
      recipient: "a fake recipient",
      amount: 125,
    });
  });
  describe("setTransactions()", () => {
    it("adds a transaction", () => {
      transactionPool.setTransaction(transaction);
      expect(transactionPool.transactionMap[transaction.id]).toBe(transaction);
    });
  });
  describe("existingTransactions()", () => {
    it("returns an existing transactions given an input address", () => {
      transactionPool.setTransaction(transaction);
      expect(
        transactionPool.existingTransaction({
          inputAddress: senderWallet.publicKey,
        })
      ).toBe(transaction);
    });
  });
});
