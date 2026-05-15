import React, { useEffect, useState } from 'react';
import logo from '../assets/BT_Logo.png';

const Preloader = () => {
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    if (!loading) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white transition-opacity duration-500">
            <div className="relative flex items-center justify-center">
                <div className="absolute w-32 h-32 border-4 border-gray-200 border-t-black rounded-full animate-spin"></div>
                <img src={logo} alt="Logo" style={{ maxHeight: '80px' }} className="z-10" />
            </div>
        </div>
    );
};

export default Preloader;
