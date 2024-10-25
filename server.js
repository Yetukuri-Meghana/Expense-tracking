const express = require('express');
const mongoose = require('mongoose');
const Grid = require('gridfs-stream');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const path = require('path');

// Initialize app
const app = express();

// Middleware
app.use(bodyParser.json());

app.use(express.urlencoded({ extended: true })); 
app.use(express.static('public')); 


// MongoDB URI
const mongoURI = 'mongodb://localhost:27017/Expense';

// Create MongoDB connection
mongoose.connect(mongoURI);
const db = mongoose.connection;
db.on('error', () => console.log("Error in connecting to the database"));
db.once('open', () => console.log("Connected to Database"));

// Initialize GridFS stream for file uploads
const expenseSchema = new mongoose.Schema({
    name: String,
    amount: Number,
    date: { type: Date, default: Date.now },
});
const Expense = mongoose.model('Expense', expenseSchema);

// @route GET /
// @desc  Home route, serving the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html')); 
});


// @route POST /login (User login)
app.post("/signin", async (req, res) => {
    const { email, password } = req.body;

    // Find user by email and check password (you can replace this with actual auth logic)
    const user = await db.collection('expense').findOne({ email });
    if (user && user.password === password) {
        // Login successful
        res.redirect('/index');
    } else {
        // Invalid login
        res.status(401).send("Invalid login credentials");
    }
});
app.post("/signup", async (req, res) => {
    const { fName, email, password } = req.body;

    try {
        const existingUser = await db.collection('expense').findOne({ email });
        if (existingUser) {
            return res.status(400).send("User already exists");
        }

        // Register the new user
        await db.collection('expense').insertOne({ name: fName, email, password });
        console.log("User registered successfully");

        // Redirect to login page after successful registration
        res.redirect('/index');
    } catch (err) {
        console.error("Registration Error:", err);
        res.status(500).send("Error registering user: " + err.message);
    }
});
app.post('/addExpense', async (req, res) => {
    const { name, amount } = req.body;

    console.log("Received:", { name, amount }); // Log the incoming values

    if (!name || amount <= 0) {
        return res.status(400).json({ message: 'Invalid expense details.' });
    }

    try {
        const newExpense = new Expense({ name, amount });
        await newExpense.save();
        res.status(201).json({ message: 'Expense added successfully.', expense: newExpense });
    } catch (error) {
        console.error("Error adding expense:", error); // Log the error
        res.status(500).json({ message: 'Error adding expense.', error });
    }
});


// @route POST /forgot-password (Handle forgot password)
app.post("/forgot-password", (req, res) => {
    const { email } = req.body;
    // Implement forgot password logic here (e.g., send reset link via email)
    res.send("Password reset link sent to your email");
});




app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'register.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'about.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'contact.html'));
});

app.get('/index', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});
app.get('/expense', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'expense.html'));
});

app.get('/forget-password', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'forget-password.html'));
});

// Set up server port
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

