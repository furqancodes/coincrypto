const Blockchain = require("./Blockchain");
const block = require("./block");
describe("blockchain", () => {
  const blockchain = new Blockchain();
  it("blockchain should have `chain` array", () => {
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
});
