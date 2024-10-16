// frontend/src/components/PublicRoute.jsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const PublicRoute = ({ children }) => {
    const { isLoggedIn } = useContext(AuthContext);

    if (isLoggedIn) {
       
        return <Navigate to="/dashboard" replace />;
    }

    
    return children;
};

export default PublicRoute;
