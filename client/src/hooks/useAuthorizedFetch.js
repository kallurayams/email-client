import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const useAuthorizedFetch = () => {
  const navigate = useNavigate();

  const authorizedFetch = useCallback(async (url, options = {}) => {
    const token = sessionStorage.getItem('outlookToken');
    if (!token) {
      navigate('/');
      throw new Error('No authorization token found');
    }

    let optionsHeaders = {};
    if (options.headers) {
      optionsHeaders = {...options.headers};
      delete options.headers;
    }
    const defaultHeaders = {
      'Authorization': `${token}`,
      'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...optionsHeaders,
      },
    });

    if (response.status === 401) {
      sessionStorage.removeItem('outlookToken');
      navigate('/');
      throw new Error('Unauthorized: Redirecting to main page');
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response;
  }, [navigate]);

  return authorizedFetch;
};

export default useAuthorizedFetch;