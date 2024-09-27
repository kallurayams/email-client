import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthorizedFetch from '../hooks/useAuthorizedFetch';

const SyncStatus = () => {
  const [percentage, setPercentage] = useState(0);
  const navigate = useNavigate();
  const authorizedFetch = useAuthorizedFetch();

  useEffect(() => {
    const token = sessionStorage.getItem('outlookToken');
    if (!token) {
      navigate('/');
      return;
    }

    const checkStatus = async () => {
      try {
        const response = await authorizedFetch('/api/v1/sync/initial-sync', {
          method: 'GET',
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setPercentage(data.data.percentage);

        if (data.percentage === 100) {
          navigate('/data');
        }
      } catch (error) {
        console.error('Error fetching sync status:', error);
        // Optionally handle error, e.g., redirect to error page
      }
    };

    const intervalId = setInterval(checkStatus, 5000); // Check every 5 seconds

    return () => clearInterval(intervalId); // Clean up on unmount
  }, [navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Initial syncing in progress</h1>
      <div className="w-64 bg-gray-200 rounded-full h-6 dark:bg-gray-700">
        <div
          className="bg-blue-600 h-6 rounded-full"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <p className="mt-2">{percentage}%</p>
    </div>
  );
};

export default SyncStatus;