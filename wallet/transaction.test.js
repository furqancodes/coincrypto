const Transactions = require("./transactions");
const Wallet = require("./index");
const { verifySignature } = require("../utils");

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
  describe("input", () => {
    it("has an `input`", () => {
      expect(transactions).toHaveProperty("input");
    });

    it("has a `timestamp` in the input", () => {
      expect(transactions.input).toHaveProperty("timestamp");
    });

    it("sets the `amount` to the `senderWallet` balance", () => {
      expect(transactions.input.amount).toEqual(senderWallet.balance);
    });

    it("sets the `address` to the `senderWallet` publicKey", () => {
      expect(transactions.input.address).toEqual(senderWallet.publicKey);
    });

    it("signs the input", () => {
      expect(
        verifySignature({
          publicKey: senderWallet.publicKey,
          data: transactions.outputMap,
          signature: transactions.input.signature,
        })
      ).toBe(true);
    });
  });
  describe("validTransactions()", () => {
    describe("when the transaction is valid", () => {
      it("returns true", () => {
        expect(Transactions.validtransactions(transactions)).toBe(true);
      });
    });
    describe("when the transactions is invalid", () => {
      describe("when the transactions output value is invalid", () => {
        it("returns false", () => {
          transactions.outputMap[senderWallet.publicKey] = 99999;
          expect(Transactions.validtransactions(transactions)).toBe(false);
        });
      });
      describe("when the transactions input signature is invalid", () => {
        it("returns false", () => {
          transactions.input.signature = new Wallet().sign("foulData");
          expect(Transactions.validtransactions(transactions)).toBe(false);
        });
      });
    });
  });
});
