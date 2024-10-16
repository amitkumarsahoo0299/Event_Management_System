// backend/routes/Events.js

const express = require('express');
const router = express.Router();
const Event = require('../models/Event'); 


router.get('/search', async (req, res) => {
    const { location, date, category, keyword, sortBy } = req.query;

    
    let query = {};

    
    if (location) {
        query.location = { $regex: location, $options: 'i' }; 
    }
    if (date) {
        query.date = date; 
    }
    if (category) {
        query.category = category; 
    }
    if (keyword) {
        query.title = { $regex: keyword, $options: 'i' };
    }

    
    let sortCriteria = {};
    if (sortBy === 'date') {
        sortCriteria.date = 1; 
    } else if (sortBy === 'popularity') {
        sortCriteria.popularity = -1; 
    }

    try {
        const events = await Event.find(query).sort(sortCriteria);
        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
