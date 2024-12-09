
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const cors = require('cors')

const app = express();
const PORT = 8000;
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))
// app.use(cors())
app.use(express.json());  // to parse JSON data
app.use(cookieParser());  // to parse cookies

// Secret key for JWT
const SECRET_KEY = 'your_secret_key';

// Dummy users (in production, you'd use a database)
const users = [
    { username: 'harry', password: bcrypt.hashSync("pass@123") } // bcrypt hash for "password123"
];

// Generate JWT Token
function generateToken(username) {
    return jwt.sign({ username }, SECRET_KEY, { expiresIn: '7d' });  // 7 days expiry
}

// Auth middleware to check the JWT token
function authenticateToken(req, res, next) {
    const token = req.cookies.token;
    console.log({ token });

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        req.user = user;
        next();
    });
}

// Login route (for getting the JWT token)
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log(username, password);

    // Find user in the database (here we use a dummy users array)
    const user = users.find(u => u.username === username);

    if (!user) {
        return res.status(400).json({ message: 'Invalid username or password' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid username or password' });
    }
    // Generate JWT token
    const token = generateToken(username);

    // Set the token as an HTTP-only cookie
    // res.cookie('token', token, {
    //     httpOnly: true,
    //     secure: process.env.NODE_ENV === 'production',
    //     sameSite: "None", 
    //     expiresIn: '7d'
    // });  // 7 days expiry

    res.cookie('token', token, {
        httpOnly: true,         // Prevents client-side access
        secure: process.env.NODE_ENV === 'production',          // Use true in HTTPS
        sameSite: 'Lax',        // Cross-site request protection
        maxAge: 60 * 1000, // 1 day in milliseconds
    });
    return res.json({ message: 'Logged in successfully' });
});

// Protected route that requires authentication
app.get('/protected', authenticateToken, (req, res) => {

    res.json({ message: 'This is a protected route', user: req.user });
});

// Logout route to clear the cookie
app.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
