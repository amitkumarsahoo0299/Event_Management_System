// frontend/src/components/Login.jsx
import React, { useState, useContext } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Link, useNavigate } from "react-router-dom";
import axios from 'axios';
import { toast } from 'react-toastify'; 
import { AuthContext } from '../contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { setIsLoggedIn } = useContext(AuthContext);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        try {
            const res = await axios.post('http://localhost:3001/login', { email, password });
            if (res.data.token) {
                toast.success('Login successful!');
                localStorage.setItem('token', res.data.token);
                setIsLoggedIn(true); 
                navigate('/dashboard'); 
            } else {
                toast.error('Unexpected response from server.');
                console.error('Unexpected response:', res.data);
            }
        } catch (error) {
            console.error('Login Error:', error);
            if (error.response && error.response.data && error.response.data.message) {
                toast.error(`Login Failed: ${error.response.data.message}`);
            } else {
                toast.error('An error occurred during login. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    }

    const handleGoogleLoginSuccess = async (credentialResponse) => {
        try {
            const { credential } = credentialResponse;
           
            const res = await axios.post('http://localhost:3001/auth/google', { token: credential });
            if (res.data.token) {
                toast.success('Google Login successful!');
                localStorage.setItem('token', res.data.token);
                setIsLoggedIn(true);
                navigate('/dashboard');
            } else {
                toast.error('Unexpected response from server.');
                console.error('Unexpected response:', res.data);
            }
        } catch (error) {
            console.error('Google Login Error:', error);
            if (error.response && error.response.data && error.response.data.message) {
                toast.error(`Google Login Failed: ${error.response.data.message}`);
            } else {
                toast.error('An error occurred during Google login. Please try again.');
            }
        }
    };

    const handleGoogleLoginFailure = (error) => {
        console.error('Google Login Error:', error);
        toast.error('Google login failed. Please try again.');
    };

    return (
        <div>
            <div className="d-flex justify-content-center align-items-center text-center vh-100" style={{ backgroundImage: "linear-gradient(#00d5ff,#0095ff,rgba(93,0,255,.555))" }}>
                <div className="bg-white p-4 rounded" style={{ width: '40%' }}>
                    <h2 className='mb-3 text-primary'>Login</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3 text-start">
                            <label htmlFor="email" className="form-label">
                                <strong>Email Id</strong>
                            </label>
                            <input 
                                type="email" 
                                placeholder="Enter Email"
                                className="form-control" 
                                id="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required 
                            /> 
                        </div>
                        <div className="mb-3 text-start">
                            <label htmlFor="password" className="form-label">
                                <strong>Password</strong>
                            </label>
                            <input 
                                type="password" 
                                placeholder="Enter Password"
                                className="form-control" 
                                id="password" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required 
                            />
                        </div>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Logging in...' : 'Login'}
                        </button>
                    </form>
                    <hr />
                    <GoogleLogin
                        onSuccess={handleGoogleLoginSuccess}
                        onError={handleGoogleLoginFailure}
                    />
                    <p className='container my-2'>Don't have an account?</p>
                    <Link to='/register' className="btn btn-secondary">Register</Link>
                </div>
            </div>
        </div>
    );
}

export default Login;
