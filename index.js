require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Root route
app.get("/", (req, res) => {
  res.send("Welcome to the Bank API 🚀");
});

// ✅ Connect MongoDB
mongoose
  .connect('mongodb://127.0.0.1:27017/bankDB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ DB CONNECTED"))
  .catch((err) => {
    console.error("❌ DB connection error:", err.message);
  });

// ✅ Schema & Model
const dataSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  amount: { type: Number, default: 0 },
});
const Data = mongoose.model("User", dataSchema);

// ✅ Fetch all users
app.get("/data", async (req, res) => {
  try {
    const items = await Data.find();
    res.json(items);
  } catch (err) {
    console.error("Error fetching data:", err.message);
    res.status(500).json({ error: "Failed to fetch users", details: err.message });
  }
});

// ✅ Create new user
app.post("/create", async (req, res) => {
  try {
    const item = await Data.create(req.body);
    res.status(201).json(item);
  } catch (err) {
    console.error("Error creating user:", err.message);
    res.status(500).json({ error: "Failed to create user", details: err.message });
  }
});

// ✅ Delete user
app.delete("/data/:id", async (req, res) => {
  try {
    const deletedUser = await Data.findByIdAndDelete(req.params.id);
    if (!deletedUser) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User deleted successfully", deletedUser });
  } catch (error) {
    console.error("Delete Error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ Update user
app.put("/data/:id", async (req, res) => {
  try {
    const updatedUser = await Data.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedUser) return res.status(404).json({ message: "User not found" });
    res.json({ message: "User updated successfully", updatedUser });
  } catch (error) {
    console.error("Update Error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ Deposit
app.post("/data/deposit", async (req, res) => {
  const { email, amount } = req.body;
  try {
    const user = await Data.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const depositAmount = parseFloat(amount);
    if (isNaN(depositAmount) || depositAmount <= 0) {
      return res.status(400).json({ message: "Invalid deposit amount" });
    }

    user.amount += depositAmount;
    await user.save();
    res.json({ message: "Deposit successful", newBalance: user.amount });
  } catch (error) {
    console.error("Deposit Error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ Withdraw
app.post("/data/withdraw", async (req, res) => {
  const { email, amount } = req.body;
  try {
    const user = await Data.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const withdrawAmount = parseFloat(amount);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      return res.status(400).json({ message: "Invalid withdrawal amount" });
    }

    if (user.amount < withdrawAmount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    user.amount -= withdrawAmount;
    await user.save();
    res.json({ message: "Withdrawal successful", newBalance: user.amount });
  } catch (error) {
    console.error("Withdraw Error:", error.message);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

