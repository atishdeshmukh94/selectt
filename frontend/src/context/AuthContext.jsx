import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_URL } from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

const API = API_URL;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [redirectAfterLogin, setRedirectAfterLogin] = useState(null);
  const [loginSuccessCallback, setLoginSuccessCallback] = useState(null);
  const [prefilledPhone, setPrefilledPhone] = useState('');

  // Load user from local storage on mount and validate token
  useEffect(() => {
    const storedToken = localStorage.getItem('customerToken');
    const storedUser = localStorage.getItem('customerUser');
    if (storedToken && storedUser) {
      // Quick validity check: decode token and see if it's expired
      try {
        const payload = JSON.parse(atob(storedToken.split('.')[1]));
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          // Token expired — clear storage
          localStorage.removeItem('customerToken');
          localStorage.removeItem('customerUser');
        } else {
          setToken(storedToken);
          const initialUser = JSON.parse(storedUser);
          setUser(initialUser);

          // Fetch fresh user profile details from DB to sync first_name/last_name
          fetch(`${API}/api/customers/profile`, {
            headers: { 'Authorization': `Bearer ${storedToken}` }
          })
          .then(res => {
            if (res.status === 401) {
              localStorage.removeItem('customerToken');
              localStorage.removeItem('customerUser');
              setUser(null);
              setToken(null);
              throw new Error('Expired or invalid token');
            }
            return res.json();
          })
          .then(freshUser => {
            if (freshUser && freshUser.phone) {
              const updated = { ...initialUser, ...freshUser };
              setUser(updated);
              localStorage.setItem('customerUser', JSON.stringify(updated));
            }
          })
          .catch(() => {});
        }
      } catch {
        // Malformed token — clear storage
        localStorage.removeItem('customerToken');
        localStorage.removeItem('customerUser');
      }
    }
  }, []);

  const login = async (phone, password = null) => {
    const res = await fetch(`${API}/api/customers/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');
    localStorage.setItem('customerToken', data.token);
    localStorage.setItem('customerUser', JSON.stringify(data.customer));
    setToken(data.token);
    setUser(data.customer);
    setIsLoginModalOpen(false);
    return data;
  };

  const register = async (phone, first_name = '', last_name = '', email = '') => {
    const res = await fetch(`${API}/api/customers/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, first_name, last_name, email })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');
    localStorage.setItem('customerToken', data.token);
    localStorage.setItem('customerUser', JSON.stringify(data.customer));
    setToken(data.token);
    setUser(data.customer);
    setIsLoginModalOpen(false);
    return data;
  };

  const sendOtp = async (phone) => {
    const res = await fetch(`${API}/api/auth/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to send OTP');
    return data;
  };

  const verifyOtp = async (credentials) => {
    const res = await fetch(`${API}/api/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Verification failed');
    
    if (data.token && data.customer) {
      localStorage.setItem('customerToken', data.token);
      localStorage.setItem('customerUser', JSON.stringify(data.customer));
      setToken(data.token);
      setUser(data.customer);
      setIsLoginModalOpen(false);
      // Fire the post-login callback if registered
      if (loginSuccessCallback) {
        setTimeout(() => loginSuccessCallback(data.token, data.customer), 100);
        setLoginSuccessCallback(null);
      }
    }
    return data;
  };


  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerUser');
  };

  // Call this whenever an API returns 401 or 'Invalid token'
  const handleAuthError = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('customerToken');
    localStorage.removeItem('customerUser');
    setIsLoginModalOpen(true);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('customerUser', JSON.stringify(updatedUser));
  };

  const openLoginModal = (redirectUrlOrCallback = null, phone = '') => {
    if (phone) {
      setPrefilledPhone(phone);
    }
    if (typeof redirectUrlOrCallback === 'function') {
      setLoginSuccessCallback(() => redirectUrlOrCallback);
      setRedirectAfterLogin(null);
    } else {
      setRedirectAfterLogin(redirectUrlOrCallback);
      setLoginSuccessCallback(null);
    }
    setIsLoginModalOpen(true);
  };

  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
    setRedirectAfterLogin(null);
  };

  const value = {
    user,
    token,
    login,
    register,
    sendOtp,
    verifyOtp,
    logout,
    handleAuthError,
    updateUser,
    isLoginModalOpen,
    openLoginModal,
    closeLoginModal,
    redirectAfterLogin,
    prefilledPhone,
    setPrefilledPhone,
    API
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
