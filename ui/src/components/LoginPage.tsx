import React, { useState } from 'react';
import { api } from '../api';
import { Profile } from '../types';

interface LoginPageProps {
    onLoginSuccess: (profile: Profile) => void;
    onForgotPassword: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onForgotPassword }) => {
    const [email, setEmail] = useState('employee@example.com');
    const [password, setPassword] = useState('password123');
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const response = await api.login(email, password);
            if (response.success && response.profile) {
                onLoginSuccess(response.profile);
            } else {
                setError(response.message || 'Login failed. Please try again.');
            }
        } catch (err) {
            setError('An unexpected error occurred.');
        }
    };

    return (
        <div className="container">
            <h2>Employee Login</h2>
            <form onSubmit={handleLogin}>
                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p className="error-message">{error}</p>}
                <div className="button-group">
                     <button type="button" className="link-button" onClick={onForgotPassword}>
                        Forgot Password?
                    </button>
                    <button type="submit">Log In</button>
                </div>
            </form>
        </div>
    );
};
