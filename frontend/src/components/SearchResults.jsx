// frontend/src/components/SearchResults.jsx
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const SearchResults = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

   
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
               
                const res = await axios.get(`http://localhost:3001/search?q=${encodeURIComponent(query)}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                setResults(res.data.results); 
            } catch (error) {
                console.error('Search Error:', error);
                toast.error('An error occurred while fetching search results.');
            } finally {
                setLoading(false);
            }
        };

        fetchResults();
    }, [query]);

    if (loading) {
        return <div className="container mt-5"><h3>Loading...</h3></div>;
    }

    return (
        <div className="container mt-5">
            <h2>Search Results for "{query}"</h2>
            {results.length === 0 ? (
                <p>No results found.</p>
            ) : (
                <ul className="list-group">
                    {results.map((result, index) => (
                        <li key={index} className="list-group-item">
                        
                            <h5>{result.title}</h5>
                            <p>{result.description}</p>
                            
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default SearchResults;
