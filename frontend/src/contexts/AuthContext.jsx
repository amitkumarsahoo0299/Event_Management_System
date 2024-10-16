// frontend/src/contexts/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import jwt_decode from 'jwt-decode'; // Using jwt-decode@3.1.2

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwt_decode(token); // Decode the JWT
                // Optionally, check token expiration here
                setIsLoggedIn(true);
                setUser(decoded.user); // Adjust based on your JWT payload structure
            } catch (error) {
                console.error('Invalid token:', error);
                setIsLoggedIn(false);
                setUser(null);
            }
        }
    }, []);

    return (
        <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn, user }}>
            {children}
        </AuthContext.Provider>
    );
};
