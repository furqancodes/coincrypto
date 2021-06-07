const Transaction = require('./Transaction')
const Wallet = require('../Wallet')
const {verifySignature} = require('../utils')
const {MINING_REWARD, REWARD_ADDRESS} = require('../../config')
describe('Transaction', () => {
  let transaction, senderWallet, recipient, amount
  beforeEach(() => {
    senderWallet = new Wallet()
    senderWallet.balance = 1000
    recipient = 'recpient-public-key'
    amount = 100
    transaction = new Transaction({
      senderWallet,
      recipient,
      amount,
    })
  })
  it('has an`id`', () => {
    expect(transaction).toHaveProperty('id')
  })
  describe('outputMap', () => {
    it('has an `outputMap` property', () => {
      expect(transaction).toHaveProperty('outputMap')
    })
    it('outputs the amount to the recipient', () => {
      expect(transaction.outputMap[recipient]).toEqual(amount)
    })
    it('outputs the remaining balance for the`sender wallet`', () => {
      expect(transaction.outputMap[senderWallet.publicKey]).toEqual(
        senderWallet.balance - amount
      )
    })
  })
  describe('input', () => {
    it('has an `input`', () => {
      expect(transaction).toHaveProperty('input')
    })

    it('has a `timestamp` in the input', () => {
      expect(transaction.input).toHaveProperty('timestamp')
    })

    it('sets the `amount` to the `senderWallet` balance', () => {
      expect(transaction.input.amount).toEqual(senderWallet.balance)
    })

    it('sets the `address` to the `senderWallet` publicKey', () => {
      expect(transaction.input.address).toEqual(senderWallet.publicKey)
    })

    it('signs the input', () => {
      expect(
        verifySignature({
          publicKey: senderWallet.publicKey,
          data: transaction.outputMap,
          signature: transaction.input.signature,
        })
      ).toBe(true)
    })
  })
  describe('validTransactions()', () => {
    describe('when the transaction is valid', () => {
      it('returns true', () => {
        expect(Transaction.validTransaction(transaction)).toBe(true)
      })
    })
    describe('when the transaction is invalid', () => {
      describe('when the transaction output value is invalid', () => {
        it('returns false', () => {
          transaction.outputMap[senderWallet.publicKey] = 99999
          expect(Transaction.validTransaction(transaction)).toBe(false)
        })
      })
      describe('when the transaction input signature is invalid', () => {
        it('returns false', () => {
          transaction.input.signature = new Wallet().sign('foulData')
          expect(Transaction.validTransaction(transaction)).toBe(false)
        })
      })
    })
  })
  describe('update()', () => {
    let orginalSignature, originalSenderOutput, nextRecipient, nextAmount
    describe('amount is invalid', () => {
      it('throw the error', () => {
        expect(() => {
          transaction.update({
            senderWallet,
            recipient: 'poop',
            amount: 99999,
          })
        }).toThrow('Amount exceeds balance')
      })
    })

    describe('amount is valid', () => {
      beforeEach(() => {
        orginalSignature = transaction.input.signature
        originalSenderOutput = transaction.outputMap[senderWallet.publicKey]
        nextRecipient = 'nextone'
        nextAmount = 110

        transaction.update({
          senderWallet,
          recipient: nextRecipient,
          amount: nextAmount,
        })
      })
      it('outputs the amount to the next recipient', () => {
        expect(transaction.outputMap[nextRecipient]).toEqual(nextAmount)
      })
      it('subtracts thr amount fromt the origina sender amount', () => {
        expect(transaction.outputMap[senderWallet.publicKey]).toEqual(
          originalSenderOutput - nextAmount
        )
      })
      it('maintain the total output amount that matches the input amount', () => {
        expect(
          Object.values(transaction.outputMap).reduce(
            (total, output) => total + output
          )
        ).toEqual(transaction.input.amount)
      })
      it('re-signs the transaction', () => {
        expect(transaction.input.signature).not.toEqual(orginalSignature)
      })
      describe('and another update for the same recipient', () => {
        let addedAmount
        beforeEach(() => {
          addedAmount = 180
          transaction.update({
            senderWallet,
            recipient: nextRecipient,
            amount: addedAmount,
          })
        })
        it('adds to the recipient amount', () => {
          expect(transaction.outputMap[nextRecipient]).toEqual(
            nextAmount + addedAmount
          )
        })
        it('subtracts the amount from the original sender output amount', () => {
          expect(transaction.outputMap[senderWallet.publicKey]).toEqual(
            originalSenderOutput - nextAmount - addedAmount
          )
        })
      })
    })
  })
  describe('rewardTransaction()', () => {
    let rewardTransaction, minerWallet
    beforeEach(() => {
      minerWallet = new Wallet()
      rewardTransaction = Transaction.rewardTransaction({minerWallet})
    })
    it('creates atrasaction with reward input', () => {
      expect(rewardTransaction.input).toEqual(REWARD_ADDRESS)
    })
    it('creates one transaction for the miner with the `MINING_REWARD`', () => {
      expect(rewardTransaction.outputMap[minerWallet.publicKey]).toEqual(
        MINING_REWARD
      )
    })
  })
})
