const Blockchain = require('./Blockchain')
const Block = require('./Block')
const {cryptoHash} = require('../utils')
const Wallet = require('../Wallet')
const Transaction = require('../transaction/Transaction')
describe('blockchain', () => {
  let blockchain, newChain, errorMock
  beforeEach(() => {
    blockchain = new Blockchain()
    newChain = new Blockchain()
    errorMock = jest.fn()

    global.console.error = errorMock
  })

  it('blockchain-should-have-`chain`-array', () => {
    expect(blockchain.chain instanceof Array).toBe(true)
  })
  it('starts with genesis block', () => {
    expect(blockchain.chain[0]).toEqual(Block.genesis())
  })
  it('adds a new block to block chain', () => {
    const newData = 'fooNewData'
    blockchain.addBlock({data: newData})
    expect(blockchain.chain[blockchain.chain.length - 1].data).toEqual(newData)
  })
  describe('isValidChain', () => {
    describe('starts with Genesis Block', () => {
      it('returns false', () => {
        blockchain.chain[0] = {data: 'u got sum fake ass genesis block!'}
        expect(Blockchain.isValidChain(blockchain.chain)).toBe(false)
      })
    })
    describe('starts with genesis block and have multiple blocks', () => {
      beforeEach(() => {
        blockchain.addBlock({data: 'test-one-data'})
        blockchain.addBlock({data: 'test-two-data'})
        blockchain.addBlock({data: 'test-three-data'})
      })
      describe('lasthash of a node has changed', () => {
        it('returns false', () => {
          blockchain.chain[2].lastHash = 'got some fakass lasthash nigah'
          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false)
        })
      })
      describe('Data of a block has changed', () => {
        it('returns false', () => {
          blockchain.chain[2].data = 'some fake ass data '
          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false)
        })
      })
      describe('contains Jumped difficulty', () => {
        it('returns false', () => {
          const lastBlock = blockchain.chain[blockchain.chain.length - 1]
          const lastHash = lastBlock.hash
          const timestamp = Date.now()
          const nonce = 0
          const data = []
          const difficulty = lastBlock.difficulty - 3
          const hash = cryptoHash(timestamp, lastHash, difficulty, nonce, data)
          const badBlock = new Block({
            timestamp,
            lastHash,
            hash,
            nonce,
            difficulty,
            data,
          })
          blockchain.chain.push(badBlock)
          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false)
        })
      })

      describe('clean', () => {
        it('returns true', () => {
          expect(Blockchain.isValidChain(blockchain.chain)).toBe(true)
        })
      })
    })
  })

  describe('validTransactionData()', () => {
    let transaction, rewardTransaction, wallet

    beforeEach(() => {
      wallet = new Wallet()
      wallet.balance = 1000
      transaction = Wallet.createTransaction({
        senderWallet: wallet,
        recipient: 'foo-address',
        amount: 0,
        chain: blockchain.chain,
      })
      rewardTransaction = Transaction.rewardTransaction({
        minerWallet: wallet,
      })
    })

    describe('and the transaction data is valid', () => {
      it('returns true', () => {
        newChain.addBlock({data: [transaction, rewardTransaction]})
        expect(blockchain.validTransactionData({chain: newChain})).toBe(true)
        expect(errorMock).not.toHaveBeenCalled()
      })
    })

    describe('and the transaction data has multiple rewards', () => {
      it('returns false and logs an error', () => {
        newChain.addBlock({
          data: [transaction, rewardTransaction, rewardTransaction],
        })

        expect(blockchain.validTransactionData({chain: newChain.chain})).toBe(
          false
        )
        expect(errorMock).toHaveBeenCalled()
      })
    })

    describe('and the transaction data has at least one malformed outputMap', () => {
      describe('and the transaction is not a reward transaction', () => {
        it('returns false and logs an error', () => {
          transaction.outputMap[wallet.publicKey] = 999999

          newChain.addBlock({data: [transaction, rewardTransaction]})

          expect(
            blockchain.validTransactionData({chain: newChain.chain})
          ).toBe(false)
          expect(errorMock).toHaveBeenCalled()
        })
      })

      describe('and the transaction is a reward transaction', () => {
        it('returns false and logs an error', () => {
          rewardTransaction.outputMap[wallet.publicKey] = 999999

          newChain.addBlock({data: [transaction, rewardTransaction]})

          expect(
            blockchain.validTransactionData({chain: newChain.chain})
          ).toBe(false)
          expect(errorMock).toHaveBeenCalled()
        })
      })
    })

    describe('and the transaction data has at least one malformed input', () => {
      it('returns false and logs an error', () => {
        wallet.balance = 9000

        const evilOutputMap = {
          [wallet.publicKey]: 8900,
          fooRecipient: 100,
        }

        const evilTransaction = {
          input: {
            timestamp: Date.now(),
            amount: wallet.balance,
            address: wallet.publicKey,
            signature: wallet.sign(evilOutputMap),
          },
          outputMap: evilOutputMap,
        }

        newChain.addBlock({data: [evilTransaction, rewardTransaction]})

        expect(blockchain.validTransactionData({chain: newChain.chain})).toBe(
          false
        )
        expect(errorMock).toHaveBeenCalled()
      })
    })

    describe('and a block contains multiple identical transactions', () => {
      it('returns false and logs an error', () => {
        newChain.addBlock({
          data: [transaction, transaction, transaction, rewardTransaction],
        })

        expect(blockchain.validTransactionData({chain: newChain.chain})).toBe(
          false
        )
        expect(errorMock).toHaveBeenCalled()
      })
    })
  })
})
