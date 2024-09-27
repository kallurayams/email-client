import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const AuthHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const code = queryParams.get('code');

    if (code) {
      sessionStorage.setItem('outlookToken', code);
      navigate('/sync-status');
    } else {
      const token = sessionStorage.getItem('outlookToken');
      if (!token) {
        navigate('/');
      } else {
        navigate('/sync');
      }
    }
  }, [location, navigate]);

  return null; // This component doesn't render anything
};

export default AuthHandler;