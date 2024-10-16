// frontend/src/components/EditEvent.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';

const EditEvent = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
        location: '',
        ticketPrice: '',
        ticketsAvailable: '',
        isPrivate: false,
    });
    const [loading, setLoading] = useState(true);

    
    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    toast.error('No token found. Please login.');
                    navigate('/login');
                    return;
                }
                const res = await axios.get(`http://localhost:3001/events/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                
                const eventDate = new Date(res.data.date);
                setFormData({
                    title: res.data.title,
                    description: res.data.description,
                    date: eventDate.toISOString().split('T')[0], // Format date for input
                    time: eventDate.toTimeString().split(' ')[0].substring(0, 5), // Format time for input
                    location: res.data.location,
                    ticketPrice: res.data.ticketPrice,
                    ticketsAvailable: res.data.ticketsAvailable,
                    isPrivate: res.data.isPrivate,
                });
                setLoading(false);
            } catch (error) {
                console.error('Error fetching event:', error);
                toast.error(
                    error.response?.data?.message || 'Failed to fetch event. Please try again.'
                );
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id, navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value,
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

            
            const { title, description, date, time, location, ticketPrice, ticketsAvailable } = formData;
            if (!title || !description || !date || !time || !location || ticketPrice === '' || ticketsAvailable === '') {
                toast.error('Please fill in all required fields.');
                return;
            }

            
            const eventDateTime = new Date(`${date}T${time}`);
            
            const res = await axios.put(`http://localhost:3001/events/${id}`, {
                ...formData,
                date: eventDateTime.toISOString(), 
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            toast.success('Event updated successfully!');
            navigate('/dashboard'); 
        } catch (error) {
            console.error('Update Event Error:', error);
            toast.error(
                error.response?.data?.message || 'An error occurred while updating the event.'
            );
        }
    };

    if (loading) {
        return (
            <div className="text-center mt-5">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-5">
            <h2 className="text-center mb-4">Edit Event</h2>
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
                <button type="submit" className="btn btn-primary">Update Event</button>
            </form>
        </div>
    );
};

export default EditEvent;
