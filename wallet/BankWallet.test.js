const Wallet = require("./index");
const BankWallet = require("./BankWallet");
const Blockchain = require("../blockchain");

const Transaction = require("./transaction");

describe("BankWallet", () => {
  let wallet, BANKWALLET

  beforeEach(() => {
    BANKWALLET = new BankWallet();
    wallet = new Wallet();
  });

  describe("createWallet", () => {
    it("creates a new wallet", () => {
      const newWallet = BankWallet.createWallet();
      expect(newWallet instanceof Wallet).toBe(true);
    });
  });

  describe("createDepositTransaction()", () => {
    describe("amount is valid", () => {
      let transaction, amount;
      let orginalBalance, blockchain, orginalBankWalletBalance;
      beforeEach(() => {
        orginalBankWalletBalance = BANKWALLET.balance;
        wallet.balance = 1000;
        orginalBalance = 0;
        amount = 1024;
        blockchain = new Blockchain();
        transaction = BANKWALLET.createDepositTransaction({
          amount,
          recipient: wallet.publicKey,
          chain: blockchain.chain,
        });
        blockchain.addBlock({ data: [transaction] });
      });
      it("creates an instance of `Transaction`", () => {
        expect(transaction instanceof Transaction).toBe(true);
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
        expect(
          Wallet.calculateBalance({
            chain: blockchain.chain,
            address: BANKWALLET.publicKey,
          })
        ).toEqual(orginalBankWalletBalance - amount);
      });
    });
  });
});
