import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/BT_Logo.png';

const Header = () => {
    // Google Maps Universal Link with exact Place ID
    const shopName = "BALOUCH+TAILOR'S+Multan";
    const placeId = "ChIJOxF6UagzOzkROAZCfNdJGds";
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${shopName}&destination_place_id=${placeId}`;

    const handleGetDirections = (e) => {
        e.preventDefault();
        window.open(directionsUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-100">
            <div className="container mx-auto px-4 py-4 flex flex-wrap items-center justify-between">
                <div className="flex-shrink-0">
                    <Link to="/" className="flex items-center group">
                        <img src={logo} alt="Balouch Tailors Logo" className="h-16 md:h-20 w-auto object-contain transform scale-110 origin-left transition-transform group-hover:scale-105" />
                        <span className="ml-3 text-2xl md:text-3xl font-black text-gray-900 tracking-tighter uppercase hidden sm:block">
                            Balouch <span className="text-gray-400 font-light">Tailors</span>
                        </span>
                    </Link>
                </div>
                
                <div className="hidden lg:flex flex-grow justify-center">
                    <nav>
                        <ul className="flex space-x-8 text-sm font-medium text-gray-700">
                            <li><Link to="/" className="hover:text-black transition-colors">Home</Link></li>
                            <li><Link to="/services" className="hover:text-black transition-colors">Services</Link></li>
                            <li><Link to="/catalogue" className="hover:text-black transition-colors">Catalogue</Link></li>
                            <li><Link to="/pricing" className="hover:text-black transition-colors">Pricing</Link></li>

                            <li><Link to="/contact" className="hover:text-black transition-colors">Contact</Link></li>
                        </ul>
                    </nav>
                </div>

                <div className="hidden xl:block">
                    <button onClick={handleGetDirections} className="inline-block px-8 py-3 bg-black text-white text-sm font-medium hover:bg-gray-800 transition-colors rounded shadow-sm">
                        Visit Us
                    </button>
                </div>

                {/* Mobile menu button could go here */}
                <div className="lg:hidden flex items-center">
                    <button className="text-gray-500 hover:text-black">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
