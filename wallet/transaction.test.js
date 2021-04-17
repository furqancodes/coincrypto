const Transactions = require("./transactions");
const Wallet = require("./index");

describe("Transactions", () => {
  let transactions, senderWallet, recipient, amount;
  beforeEach(() => {
    senderWallet = new Wallet();
    recipient = "recpient-public-key";
    amount = 100;
    transactions = new Transactions({
      senderWallet,
      recipient,
      amount,
    });
  });
  it("has an`id`", () => {
    expect(transactions).toHaveProperty("id");
  });
  describe("outputMap", () => {
    it("has an `outputMap` property", () => {
      expect(transactions).toHaveProperty("outputMap");
    });
    it("outputs the amount to the recipient", () => {
      expect(transactions.outputMap[recipient]).toEqual(amount);
    });
    it("outputs the remaining balance for the`sender wallet`", () => {
      expect(transactions.outputMap[senderWallet.publicKey]).toEqual(
        senderWallet.balance - amount
      );
    });
  });
});
