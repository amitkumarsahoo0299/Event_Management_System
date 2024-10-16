import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EventSearch from './EventSearch';
import EventCard from './EventCard'; 

const EventList = () => {
    const [events, setEvents] = useState([]);

    
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await axios.get('http://localhost:3001/events'); 
                setEvents(res.data);
            } catch (error) {
                console.error('Error fetching events:', error);
            }
        };

        fetchEvents();
    }, []);

    return (
        <div className="container mt-5">
            <h2 className="text-center mb-4">Upcoming Events</h2>
            <EventSearch setEvents={setEvents} />
            <div className="row">
                {events.map(event => (
                    <div className="col-md-4" key={event._id}>
                        <EventCard event={event} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EventList;
