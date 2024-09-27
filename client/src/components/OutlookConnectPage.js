import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import useAuthorizedFetch from '../hooks/useAuthorizedFetch';

const OutlookConnectPage = () => {
    const navigate = useNavigate();
    const authorizedFetch = useAuthorizedFetch();

    useEffect(() => {
        const checkToken = async () => {
            const token = sessionStorage.getItem('outlookToken');
            if (token) {
                try {
                    const response = await authorizedFetch('/verifyAuthToken', {
                        method: 'POST',
                    });

                    if (response.ok) {
                        const data = await response.json();
                        sessionStorage.setItem('outlookToken', data.newToken);
                        navigate('/data');
                    } else {
                        // Token is invalid, remove it from session storage
                        sessionStorage.removeItem('outlookToken');
                    }
                } catch (error) {
                    console.error('Error verifying token:', error);
                }
            }
        };

        checkToken();
    }, [navigate]);

    const handleConnect = async () => {
        try {
            const response = await fetch('/api/v1/authenticate/authUrl', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const data = await response.json();
                window.location.href = data.data.redirectionUrl;
            } else {
                console.error('Error fetching OAuth Url');
            }
        } catch (error) {
            console.error('Error verifying token:', error);
        }
        console.log('Connecting to Outlook...');
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#0078d4] text-white">
            <h1 className="text-4xl font-bold mb-8">Connect to Outlook</h1>
            <Button
                onClick={handleConnect}
                className="bg-white text-[#0078d4] hover:bg-gray-100 font-semibold py-2 px-4 rounded-full transition duration-300 ease-in-out transform hover:scale-105"
            >
                Connect to Outlook
            </Button>
        </div>
    );
};

export default OutlookConnectPage;