const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');

app.use(cors());
app.use(express.json());

// Create a root path
app.get('/', (req, res) => {
    res.send('Welcome');
});

// Start server
app.listen(8080, () => {
    console.log("Server Connected");
});

// Connect MongoDB
mongoose.connect('mongodb+srv://sudhagar:sudhagar1234@cluster0.pnulv.mongodb.net/bank')
    .then(() => {
        console.log("DB CONNECTED");
    })
    .catch((err) => console.error("DB connection error:", err));

// Create Schema
let dataSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    amount: Number
});
let Data = mongoose.model("test", dataSchema);

// API for fetching data
app.get('/data', (req, res) => {
    Data.find()
        .then((items) => res.send(items))
        .catch((err) => res.status(500).send(err));
});

// API for creating data
app.post('/create', (req, res) => {
    Data.create(req.body)
        .then((item) => res.send(item))
        .catch((err) => res.status(500).send(err));
});

// API for deleting data
app.delete('/data/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deletedUser = await Data.findByIdAndDelete(id);

        if (!deletedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User deleted successfully', deletedUser });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

app.put('/data/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const updatedUser = await Data.findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User updated successfully', updatedUser });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: 'Server error', error });
    }
});
// deposit data
app.post("/data/deposit", async (req, res) => {
    const { email, amount ,password } = req.body;

    try {
        // Find user by email
        const user = await Data.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

        // Ensure deposit amount is valid
        const depositAmount = parseFloat(amount);
        if (isNaN(depositAmount) || depositAmount <= 0) {
            return res.status(400).json({ message: "Invalid deposit amount" });
        }

        // Update user balance (amount field)
        user.amount += depositAmount;
        await user.save();

        res.json({ message: "Deposit successful", newBalance: user.amount });
    } catch (error) {
        console.error("Deposit Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

    
//   withdraw method
app.post("/data/withdraw", async (req, res) => {
    const { email, amount ,password } = req.body;

    try {
        const user = await Data.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "User not found" });
        }

    
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
        console.error("Withdraw Error:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});


