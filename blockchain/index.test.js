const Blockchain = require("./index.js");
const block = require("./block");
const cryptoHash = require("../utils/cryptoHash.js");
describe("blockchain", () => {
  let blockchain;
  beforeEach(() => {
    blockchain = new Blockchain();
    newChain = new Blockchain();
    orginalChain = blockchain.chain;
  });

  it("blockchain-should-have-`chain`-array", () => {
    expect(blockchain.chain instanceof Array).toBe(true);
  });
  it("starts with genesis block", () => {
    expect(blockchain.chain[0]).toEqual(block.genesis());
  });
  it("adds a new block to block chain", () => {
    const newData = "fooNewData";
    blockchain.addBlock({ data: newData });
    expect(blockchain.chain[blockchain.chain.length - 1].data).toEqual(newData);
  });
  describe("isValidChain", () => {
    describe("starts with Genesis Block", () => {
      it("returns false", () => {
        blockchain.chain[0] = { data: "u got sum fake ass genesis block!" };
        expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
      });
    });
    describe("starts with genesis block and have multiple blocks", () => {
      beforeEach(() => {
        blockchain.addBlock({ data: "test-one-data" });
        blockchain.addBlock({ data: "test-two-data" });
        blockchain.addBlock({ data: "test-three-data" });
      });
      describe("lasthash of a node has changed", () => {
        it("returns false", () => {
          blockchain.chain[2].lastHash = "got some fakass lasthash nigah";
          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
        });
      });
      describe("Data of a block has changed", () => {
        it("returns false", () => {
          blockchain.chain[2].data = "some fake ass data ";
          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
        });
      });
      describe("contains Jumped difficulty", () => {
        it("returns false", () => {
          const lastBlock = blockchain.chain[blockchain.chain.length - 1];
          const lastHash = lastBlock.hash;
          const timestamp = Date.now();
          const nonce = 0;
          const data = [];
          const difficulty = lastBlock.difficulty - 3;
          const hash = cryptoHash(timestamp, lastHash, difficulty, nonce, data);
          const badBlock = new block({
            timestamp,
            lastHash,
            hash,
            nonce,
            difficulty,
            data,
          });
          blockchain.chain.push(badBlock);
          expect(Blockchain.isValidChain(blockchain.chain)).toBe(false);
        });
      });

      describe("clean", () => {
        it("returns true", () => {
          expect(Blockchain.isValidChain(blockchain.chain)).toBe(true);
        });
      });
    });
  });
  describe("replaceChain", () => {
    let errorMock, logMock;
    beforeEach(() => {
      errorMock = jest.fn();
      logMock = jest.fn();
      global.console.error = errorMock;
      global.console.log = logMock;
    });
    describe("when the new chain is not long enough", () => {
      beforeEach(() => {
        newChain.chain[0] = { new: "chainis" };
        blockchain.replaceChain(newChain.chain);
      });
      it("does not replace the chain", () => {
        expect(blockchain.chain).toEqual(orginalChain);
      });
      it("logs error", () => {
        expect(errorMock).toHaveBeenCalled();
      });
    });
    describe("when the newChain is longer", () => {
      beforeEach(() => {
        newChain.addBlock({ data: "test-one-data" });
        newChain.addBlock({ data: "test-two-data" });
        newChain.addBlock({ data: "test-three-data" });
      });
      describe("when the chain is valid", () => {
        beforeEach(() => {
          blockchain.replaceChain(newChain.chain);
        });
        it("does  replace chain", () => {
          expect(blockchain.chain).toEqual(newChain.chain);
        });
        it("logs the chain replacement", () => {
          expect(logMock).toHaveBeenCalled();
        });
      });
      describe("when the chain is invalid", () => {
        beforeEach(() => {
          newChain.chain[2].hash = "again some fake ass hash";
          blockchain.replaceChain(newChain.chain);
        });
        it("does not replace chain", () => {
          expect(blockchain.chain).toEqual(orginalChain);
        });
        it("logs an errot", () => {
          expect(errorMock).toHaveBeenCalled();
        });
      });
    });
  });
});
