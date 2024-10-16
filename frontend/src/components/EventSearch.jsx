// frontend/src/components/EventSearch.jsx
import React, { useEffect, useState, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const EventSearch = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const { isLoggedIn } = useContext(AuthContext);

    
    const useQuery = () => {
        return new URLSearchParams(location.search);
    };

    const query = useQuery().get('q');

    useEffect(() => {
        const fetchResults = async () => {
            if (!query) {
                toast.error('No search query provided.');
                setLoading(false);
                return;
            }
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    toast.error('You must be logged in to perform a search.');
                    setLoading(false);
                    return;
                }

                const res = await axios.get(`http://localhost:3001/events?q=${encodeURIComponent(query)}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setResults(res.data.events);
            } catch (error) {
                console.error('Search Error:', error);
                toast.error('An error occurred while fetching search results.');
            } finally {
                setLoading(false);
            }
        };

        if (isLoggedIn) {
            fetchResults();
        } else {
            toast.error('You must be logged in to perform a search.');
            setLoading(false);
        }
    }, [query, isLoggedIn]);

    if (loading) {
        return <div className="container mt-5"><h3>Loading...</h3></div>;
    }

    return (
        <div className="container mt-5">
            <h2>Search Results for "{query}"</h2>
            {results.length === 0 ? (
                <p>No events found.</p>
            ) : (
                <ul className="list-group">
                    {results.map((event) => (
                        <li key={event._id} className="list-group-item">
                            <h5>{event.title}</h5>
                            <p>{event.description}</p>
                            <p><strong>Date:</strong> {new Date(event.date).toLocaleDateString()}</p>
                            <p><strong>Location:</strong> {event.location}</p>
                            
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default EventSearch;