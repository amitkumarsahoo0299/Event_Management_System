// frontend/src/components/EventDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const EventDashboard = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    toast.error('No token found. Please login.');
                    window.location.href = '/login';
                    return;
                }
                const res = await axios.get('http://localhost:3001/events/organizer', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setEvents(res.data);
                setLoading(false);
            } catch (error) {
                console.error('Error fetching events:', error);
                if (error.response && error.response.data && error.response.data.message) {
                    toast.error(`Failed to fetch events: ${error.response.data.message}`);
                } else {
                    toast.error('Failed to fetch events. Please ensure you are logged in.');
                }
                setLoading(false);
            }
        };
        fetchEvents();
    }, []);

    
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this event?')) return;
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                toast.error('No token found. Please login.');
                window.location.href = '/login';
                return;
            }
            await axios.delete(`http://localhost:3001/events/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setEvents(events.filter(event => event._id !== id));
            toast.success('Event deleted successfully');
        } catch (error) {
            console.error('Error deleting event:', error);
            if (error.response && error.response.data && error.response.data.message) {
                toast.error(`Failed to delete the event: ${error.response.data.message}`);
            } else {
                toast.error('Failed to delete the event. Please try again.');
            }
        }
    };

    if (loading) {
        return <div className="text-center mt-5"><div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
        </div></div>;
    }

    return (
        <div className="container mt-5">
            <h2 className="text-center mb-4">My Events</h2>
            {events.length === 0 ? (
                <p className="text-center">You have not created any events yet.</p>
            ) : (
                <div className="table-responsive">
                    <table className="table table-bordered table-hover">
                        <thead className="table-light">
                            <tr>
                                <th>Title</th>
                                <th>Date & Time</th>
                                <th>Location</th>
                                <th>Ticket Price ($)</th>
                                <th>Tickets Available</th>
                                <th>Privacy</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {events.map(event => (
                                <tr key={event._id}>
                                    <td>{event.title}</td>
                                    <td>{new Date(event.date).toLocaleDateString()} at {event.time}</td>
                                    <td>{event.location}</td>
                                    <td>{event.ticketPrice.toFixed(2)}</td>
                                    <td>{event.ticketsAvailable}</td>
                                    <td>{event.isPrivate ? 'Private' : 'Public'}</td>
                                    <td>
                                        <Link to={`/edit-event/${event._id}`} className="btn btn-sm btn-warning me-2">Edit</Link>
                                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(event._id)}>Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default EventDashboard;
