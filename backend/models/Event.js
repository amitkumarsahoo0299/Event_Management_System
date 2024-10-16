// backend/models/Event.js
const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
    organizer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String, 
        required: true
    },
    location: {
        type: String,
        required: true,
        trim: true
    },
  
    ticketPrice: {
        type: Number,
        required: true,
        default: 0
    },
    ticketsAvailable: {
        type: Number,
        required: true,
        default: 0
    },
    isPrivate: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

EventSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model('Event', EventSchema);
