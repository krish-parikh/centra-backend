const express = require("express");
const { MongoClient } = require("mongodb");
const app = express();
const PORT = 3000;

// Replace with your actual MongoDB connection string
const uri =
  "mongodb+srv://krish:100392@cluster0.weggwww.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri);

app.use(express.json());

app.get("/api/data", async (req, res) => {
  try {
    await client.connect();
    const collection = client.db("mydatabase").collection("mycollection");
    const data = await collection.find({}).toArray();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await client.close();
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
