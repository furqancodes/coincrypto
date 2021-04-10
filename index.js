const express = require("express");
const Blockchain = require("./Blockchain");

const app = express();
const blockchain = new Blockchain();

app.use(express.json());

app.get("/api/blocks", (req, res) => {
  res.json(blockchain.chain);
});

app.post("/api/mine", (req, res) => {
  const { data } = req.body;
  blockchain.addBlock({ data });
  res.redirect("/api/blocks");
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});
