// backend/index.js
require('dotenv').config();
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const FormDataModel = require('./models/FormData');
const Event = require('./models/Event'); 
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');


const app = express();
app.use(express.json());
app.use(cors({
    origin: 'http://localhost:5173', 
    credentials: true,
}));

// Initialize Google OAuth Client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/event_management_system", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log('MongoDB connection error:', err));

// Authentication Middleware
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided, authorization denied' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// Register Route
app.post('/register', async (req, res) => {
    const { email, password, name } = req.body;
    try {
        const existingUser = await FormDataModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Already registered" });
        }
        const newUser = await FormDataModel.create({ email, password, name });
        const payload = {
            user: {
                id: newUser._id
            }
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ token });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Login Route
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await FormDataModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "No records found!" });
        }
        const isMatch = await user.matchPassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: "Wrong password" });
        }
        const payload = {
            user: {
                id: user._id
            }
        };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// ----------------------- Google Auth Route ----------------------- //

// Google Login Route
app.post('/auth/google', async (req, res) => {
    const { token } = req.body;

    try {
        // Verify the token with Google
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID, 
        });

        const payload = ticket.getPayload();
        const { email, name, sub } = payload;

        // Check if user exists
        let user = await FormDataModel.findOne({ email });

        if (!user) {
            // If user doesn't exist, create a new one
            user = await FormDataModel.create({
                name,
                email,
                password: bcrypt.hashSync(sub, 10), 
            });
        }

        // Create JWT token
        const jwtPayload = {
            user: {
                id: user._id
            }
        };

        const jwtToken = jwt.sign(jwtPayload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token: jwtToken });
    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(401).json({ message: 'Google Authentication failed', error: error.message });
    }
});

// ----------------------- End of Google Auth Route ----------------------- //

// ----------------------- Event Routes ----------------------- //

// Create a new event
app.post('/events', authenticate, async (req, res) => {
    const { title, description, date, time, location, ticketPrice, ticketsAvailable, isPrivate } = req.body;
    try {
        const newEvent = new Event({
            organizer: req.user.id,
            title,
            description,
            date,
            time,
            location,
            ticketPrice,
            ticketsAvailable,
            isPrivate
        });
        await newEvent.save();
        res.status(201).json(newEvent);
    } catch (error) {
        console.error('Create Event Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});


// Get all events created by the authenticated user
app.get('/events', authenticate, async (req, res) => {
    try {
        const { location, date, category, q } = req.query; // 'q' is the search query

        // Initialize the query object with the organizer filter
        let query = { organizer: req.user.id };

       
        if (location) {
            query.location = { $regex: location, $options: 'i' }; 
        }

        
        if (date) {
            const start = new Date(date);
            const end = new Date(date);
            end.setDate(end.getDate() + 1); 
            query.date = { $gte: start, $lt: end };
        }

        
        if (category) {
            query.category = category;
        }

        if (q) {
            query.$text = { $search: q };
        }

       
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        
        // console.log('Searching completed !!');
        

        
        const events = await Event.find(query)
                                  .populate('organizer', ['name', 'email'])
                                  .sort({ date: 1 }) 
                                  .skip(skip)
                                  .limit(limit);

       
        const total = await Event.countDocuments(query);

        res.json({
            events,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalEvents: total
        });
    } catch (error) {
        console.error('Get Events Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});



app.get('/events/organizer', authenticate, async (req, res) => {
    try {
        const events = await Event.find({ organizer: req.user.id }).populate('organizer', ['name', 'email']);
        res.json(events);
    } catch (error) {
        console.error('Get Organizer Events Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// Update an event
app.put('/events/:id', authenticate, async (req, res) => {
    const { title, description, date, time, location, ticketPrice, ticketsAvailable, isPrivate } = req.body;
    try {
        let event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        if (event.organizer.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }
        event.title = title || event.title;
        event.description = description || event.description;
        event.date = date || event.date;
        event.time = time || event.time;
        event.location = location || event.location;
        event.ticketPrice = ticketPrice !== undefined ? ticketPrice : event.ticketPrice;
        event.ticketsAvailable = ticketsAvailable !== undefined ? ticketsAvailable : event.ticketsAvailable;
        event.isPrivate = isPrivate !== undefined ? isPrivate : event.isPrivate;
        await event.save();
        res.json(event);
    } catch (error) {
        console.error('Update Event Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// Delete an event
app.delete('/events/:id', authenticate, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        if (event.organizer.toString() !== req.user.id) {
            return res.status(401).json({ message: 'User not authorized' });
        }
        await event.deleteOne(); // Updated method
        res.json({ message: 'Event removed' });
    } catch (error) {
        console.error('Delete Event Error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
});

// ----------------------- End of Event Routes ----------------------- //

app.listen(3001, () => {
    console.log("Server listening on http://127.0.0.1:3001");
});
