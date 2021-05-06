const Wallet = require("./index");
const { verifySignature } = require("../utils");
const Transaction = require("./transaction");
const Blockchain = require("../blockchain");
const { STARTING_BALANCE } = require("../config");

describe("Wallet", () => {
  let wallet;
  beforeEach(() => {
    wallet = new Wallet();
    wallet.balance = 1000;
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
          wallet.createTransaction({
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
        transaction = wallet.createTransaction({ amount, recipient });
      });
      it("creates an instance of `Transaction`", () => {
        expect(transaction instanceof Transaction).toBe(true);
      });
      it("matches the transaction input with the wallet", () => {
        expect(transaction.input.address).toEqual(wallet.publicKey);
      });
      it("outputs the amount the recipient", () => {
        expect(transaction.outputMap[recipient]).toEqual(amount);
      });
    });
    describe("and a chain is passed", () => {
      it("calls`Wallet.calculateBalance`", () => {
        const calculateBalanceMock = jest.fn();
        const orginalCalculateBalance = Wallet.calculateBalance;
        Wallet.calculateBalance = calculateBalanceMock;
        wallet.createTransaction({
          recipient: "fooo",
          amount: 50,
          chain: new Blockchain().chain,
        });
        expect(calculateBalanceMock).toHaveBeenCalled();
        Wallet.calculateBalance = orginalCalculateBalance;
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
      let transactionOne, transactionTwo, transactionThree;
      beforeEach(() => {
        walletOne = new Wallet();
        walletOne.balance = 1000;
        walletTwo = new Wallet();
        walletTwo.balance = 1000;
        walletthree = new Wallet();
        walletthree.balance = 1000;
        walletfour = new Wallet();
        walletfour.balance = 1000;
        transactionOne = walletOne.createTransaction({
          recipient: wallet.publicKey,
          amount: 30,
        });
        transactionTwo = walletTwo.createTransaction({
          recipient: wallet.publicKey,
          amount: 400,
        });
        transactionThree = walletthree.createTransaction({
          recipient: walletfour.publicKey,
          amount: 200,
        });
        blockchain.addBlock({
          data: [transactionOne, transactionTwo, transactionThree],
        });
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
      describe("and the wallet has made transaction", () => {
        let recentTransaction;
        beforeEach(() => {
          recentTransaction = wallet.createTransaction({
            recipient: "foo-address",
            amount: 20,
          });
          blockchain.addBlock({ data: [recentTransaction] });
        });
        it("returns the output amount aof the recent transaction", () => {
          expect(
            Wallet.calculateBalance({
              chain: blockchain.chain,
              address: wallet.publicKey,
            })
          ).toEqual(recentTransaction.outputMap[wallet.publicKey]);
        });
        describe("and there are outputs next to and after the recent transaction", () => {
          let sameBlockTransaction, nextBlockTransction;
          beforeEach(() => {
            recentTransaction = wallet.createTransaction({
              recipient: "saome later foo address",
              amount: 90,
            });
            sameBlockTransaction = Transaction.rewardTransaction({
              minerWallet: wallet,
            });
            blockchain.addBlock({
              data: [recentTransaction, sameBlockTransaction],
            });
            const someWallet = new Wallet();
            someWallet.balance = 1000;
            nextBlockTransction = someWallet.createTransaction({
              recipient: wallet.publicKey,
              amount: 400,
            });
            blockchain.addBlock({ data: [nextBlockTransction] });
          });
          it("includes the ouput amounts in the returned balance", () => {
            expect(
              Wallet.calculateBalance({
                chain: blockchain.chain,
                address: wallet.publicKey,
              })
            ).toEqual(
              recentTransaction.outputMap[wallet.publicKey] +
                sameBlockTransaction.outputMap[wallet.publicKey] +
                nextBlockTransction.outputMap[wallet.publicKey]
            );
          });
        });
      });
    });
  });
});
