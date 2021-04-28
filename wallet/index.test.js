const Wallet = require("./index");
const BankWallet = require("./BankWallet");
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
    describe("and a chain is passed", () => {
      it("calls`Wallet.calculateBalance`", () => {
        const calculateBalanceMock = jest.fn();
        const orginalCalculateBalance = Wallet.calculateBalance;
        Wallet.calculateBalance = calculateBalanceMock;
        wallet.createTransactions({
          recipient: "fooo",
          amount: 50,
          chain: new Blockchain().chain,
        });
        expect(calculateBalanceMock).toHaveBeenCalled();
        Wallet.calculateBalance = orginalCalculateBalance;
      });
    });
  });
  describe("createDepositTransaction()", () => {
    describe("amount is valid", () => {
      let transaction, amount;
      let orginalBalance, blockchain, BANKWALLET;
      beforeEach(() => {
        BANKWALLET = new BankWallet();
        orginaBankWalletBalance = BANKWALLET.balance;
        orginalBalance = wallet.balance;
        amount = 1024;
        blockchain = new Blockchain();
        transaction = BANKWALLET.createDepositTransactions({
          amount,
          recipient: wallet.publicKey,
          chain: blockchain.chain,
        });
        blockchain.addBlock({ data: [transaction] });
      });
      it("creates an instance of `Transaction`", () => {
        expect(transaction instanceof Transactions).toBe(true);
      });
      it("matches the transaction input with the Bankwallet", () => {
        expect(transaction.input.address).toEqual(BANKWALLET.publicKey);
      });
      it("Transaction consist of outputMap", () => {
        expect(transaction.outputMap[wallet.publicKey]).toEqual(amount);
      });
      it("adds amount to balance of wallet", () => {
        expect(
          Wallet.calculateBalance({
            chain: blockchain.chain,
            address: wallet.publicKey,
          })
        ).toEqual(orginalBalance + amount);
      });
      it("withdraw amount from balance of BANK_WALLET", () => {
        expect(BANKWALLET.balance).toEqual(orginaBankWalletBalance - amount);
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
        transactionOne = new Wallet().createTransactions({
          recipient: wallet.publicKey,
          amount: 30,
        });
        transactionTwo = new Wallet().createTransactions({
          recipient: wallet.publicKey,
          amount: 400,
        });
        transactionThree = new Wallet().createTransactions({
          recipient: new Wallet().publicKey,
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
          recentTransaction = wallet.createTransactions({
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
            recentTransaction = wallet.createTransactions({
              recipient: "saome later foo address",
              amount: 90,
            });
            sameBlockTransaction = Transactions.rewardTransaction({
              minerWallet: wallet,
            });
            blockchain.addBlock({
              data: [recentTransaction, sameBlockTransaction],
            });
            nextBlockTransction = new Wallet().createTransactions({
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
