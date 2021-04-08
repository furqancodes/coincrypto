const Block = require("./block");
const { GENESIS_DATA } = require("./config");
const cryptoHash = require("./cryptoHash");
describe("Block", () => {
  const timestamp = "foo-timestamp";
  const lastHash = "foo-lastHash";
  const hash = "foo-hash";
  const data = ["blockchain", "data"];
  const nonce = 1;
  const difficulty = 1;
  const block = new Block({
    timestamp,
    lastHash,
    hash,
    data,
    nonce,
    difficulty,
  });
  it("has a timestamp", () => {
    expect(block.timestamp).toEqual(timestamp);
  });
  it("has a lastHash", () => {
    expect(block.lastHash).toEqual(lastHash);
  });
  it("has a hash", () => {
    expect(block.hash).toEqual(hash);
  });
  it("has a data", () => {
    expect(block.data).toEqual(data);
  });
  it("has a nonce", () => {
    expect(block.nonce).toEqual(nonce);
  });
  it("has a difficulty", () => {
    expect(block.difficulty).toEqual(difficulty);
  });
  describe("genesis()", () => {
    const genesisBlock = Block.genesis();
    it("returns a Block Instance", () => {
      expect(genesisBlock instanceof Block).toBe(true);
    });
    it("returns data of genesis block", () => {
      expect(genesisBlock).toEqual(GENESIS_DATA);
    });
  });
  describe("mineBlock(", () => {
    const lastBlock = Block.genesis();
    const data = "mined data";
    const minedBlock = Block.mineBlock({ lastBlock, data });
    it("returns a Block Instance", () => {
      expect(minedBlock instanceof Block).toBe(true);
    });
    it("sets `lastHashaa` equal to `hash` of lastBlock", () => {
      expect(minedBlock.lastHash).toEqual(lastBlock.hash);
    });
    it("sets the `data`", () => {
      expect(minedBlock.data).toEqual(data);
    });
    it("timestamp exists", () => {
      expect(minedBlock.timestamp).not.toEqual(undefined);
    });
    it("generates sha-256 hash on the current timestamp,lastBlock hash and current data", () => {
      expect(minedBlock.hash).toEqual(
        cryptoHash(
          minedBlock.timestamp,
          lastBlock.hash,
          minedBlock.nonce,
          minedBlock.difficulty,
          data
        )
      );
    });
    it("sets hash that matches difficulty critera", () => {
      expect(minedBlock.hash.substring(0, minedBlock.difficulty)).toEqual(
        "0".repeat(minedBlock.difficulty)
      );
    });
  });
});
