// frontend/src/components/CreateEvent.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const CreateEvent = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        ticketPrice: '',
        ticketsAvailable: '',
        isPrivate: false
    });
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('No token found. Please login.');
                navigate('/login');
                return;
            }

            if (!formData.title || !formData.description || !formData.date || 
                !formData.time || !formData.location || formData.ticketPrice === '' || 
                formData.ticketsAvailable === '') {
                toast.error('Please fill in all required fields.');
                return;
            }

            const res = await axios.post('http://localhost:3001/events', formData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            toast.success('Event created successfully!');
            navigate('/dashboard'); 
        } catch (error) {
            console.error('Create Event Error:', error);
            if (error.response && error.response.data && error.response.data.message) {
                toast.error(`Failed to create event: ${error.response.data.message}`);
            } else {
                toast.error('An error occurred while creating the event.');
            }
        }
    };

    return (
        <div className="container mt-5">
            <h2 className="text-center mb-4">Create New Event</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="title" className="form-label"><strong>Event Title</strong></label>
                    <input 
                        type="text" 
                        className="form-control" 
                        id="title" 
                        name="title" 
                        value={formData.title} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="description" className="form-label"><strong>Description</strong></label>
                    <textarea 
                        className="form-control" 
                        id="description" 
                        name="description" 
                        rows="3" 
                        value={formData.description} 
                        onChange={handleChange} 
                        required
                    ></textarea>
                </div>
                <div className="mb-3">
                    <label htmlFor="date" className="form-label"><strong>Date</strong></label>
                    <input 
                        type="date" 
                        className="form-control" 
                        id="date" 
                        name="date" 
                        value={formData.date} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="time" className="form-label"><strong>Time</strong></label>
                    <input 
                        type="time" 
                        className="form-control" 
                        id="time" 
                        name="time" 
                        value={formData.time} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="location" className="form-label"><strong>Location</strong></label>
                    <input 
                        type="text" 
                        className="form-control" 
                        id="location" 
                        name="location" 
                        value={formData.location} 
                        onChange={handleChange} 
                        required 
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="ticketPrice" className="form-label"><strong>Ticket Price ($)</strong></label>
                    <input 
                        type="number" 
                        className="form-control" 
                        id="ticketPrice" 
                        name="ticketPrice" 
                        value={formData.ticketPrice} 
                        onChange={handleChange} 
                        required 
                        min="0"
                        step="0.01"
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="ticketsAvailable" className="form-label"><strong>Tickets Available</strong></label>
                    <input 
                        type="number" 
                        className="form-control" 
                        id="ticketsAvailable" 
                        name="ticketsAvailable" 
                        value={formData.ticketsAvailable} 
                        onChange={handleChange} 
                        required 
                        min="0"
                    />
                </div>
                <div className="form-check mb-3">
                    <input 
                        className="form-check-input" 
                        type="checkbox" 
                        id="isPrivate" 
                        name="isPrivate" 
                        checked={formData.isPrivate} 
                        onChange={handleChange} 
                    />
                    <label className="form-check-label" htmlFor="isPrivate">
                        Private Event
                    </label>
                </div>
                <button type="submit" className="btn btn-primary">Create Event</button>
            </form>
        </div>
    );
};

export default CreateEvent;
