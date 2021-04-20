const Transaction = require("./transactions");
const Wallet = require("./index");
const Transactionpool = require("./transaction-pool.js");
describe("Transactionpool", () => {
  let transactionPool, transaction;
  beforeEach(() => {
    transactionPool = new Transactionpool();
    transaction = new Transaction({
      senderWallet: new Wallet(),
      recipient: "a fake recipient",
      amount: 125,
    });
  });
  describe("setTransactions()", () => {
    it("adds a transaction", () => {
      transactionPool.setTransaction(transaction);
      expect(transactionPool.transactionMap[transactionPool.id]).toBe(
        transaction
      );
    });
  });
});
