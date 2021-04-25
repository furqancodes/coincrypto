const Wallet = require("./index");
const { verifySignature } = require("../utils");
const Transactions = require("./transactions");
const Blockchain = require("../blockchain");
const { STARTING_BALANCE } = require("../config");

describe("Wallet", () => {
  let wallet;
  beforeEach(() => {
    wallet = new Wallet();
  });

  it("has a `balance`", () => {
    expect(wallet).toHaveProperty("balance");
  });
  it("has a `public key`", () => {
    expect(wallet).toHaveProperty("publicKey");
  });
  describe("Signing data", () => {
    const data = "foobar testing data";
    it("verifies a signature", () => {
      expect(
        verifySignature({
          publicKey: wallet.publicKey,
          data,
          signature: wallet.sign(data),
        })
      ).toBe(true);
    });
    it("does not verifies a signature", () => {
      expect(
        verifySignature({
          publicKey: wallet.publicKey,
          data,
          signature: new Wallet().sign(data),
        })
      ).toBe(false);
    });
  });
  describe("createTransaction()", () => {
    describe("and the amount exceeds the balance", () => {
      it("throws the eror", () => {
        expect(() => {
          wallet.createTransactions({
            amount: 9090,
            recipient: "some wrong address",
          });
        }).toThrow("amount exceeds balance");
      });
    });
    describe("amount is valid", () => {
      let transaction, amount, recipient;
      beforeEach(() => {
        amount = 500;
        recipient = "some nice guy";
        transaction = wallet.createTransactions({ amount, recipient });
      });
      it("creates an instance of `Transaction`", () => {
        expect(transaction instanceof Transactions).toBe(true);
      });
      it("matches the transaction input with the wallet", () => {
        expect(transaction.input.address).toEqual(wallet.publicKey);
      });
      it("outputs the amount the recipient", () => {
        expect(transaction.outputMap[recipient]).toEqual(amount);
      });
    });
  });
  describe("calculateBalance()", () => {
    let blockchain;
    beforeEach(() => {
      blockchain = new Blockchain();
    });
    describe("and there are no outputmap", () => {
      it("returns the Starting Balance", () => {
        expect(
          Wallet.calculateBalance({
            chain: blockchain.chain,
            address: wallet.publicKey,
          })
        ).toEqual(STARTING_BALANCE);
      });
    });
    describe("and there are outputs for the wallet", () => {
      let transactionOne, transactionTwo;
      beforeEach(() => {
        transactionOne = new Wallet().createTransactions({
          recipient: wallet.publicKey,
          amount: 30,
        });
        transactionTwo = new Wallet().createTransactions({
          recipient: wallet.publicKey,
          amount: 403,
        });
        blockchain.addBlock({ data: [transactionOne, transactionTwo] });
      });
      it("adds the sum of all outputs to the wallet", () => {
        expect(
          Wallet.calculateBalance({
            chain: blockchain.chain,
            address: wallet.publicKey,
          })
        ).toEqual(
          STARTING_BALANCE +
            transactionTwo.outputMap[wallet.publicKey] +
            transactionOne.outputMap[wallet.publicKey]
        );
      });
    });
  });
});
