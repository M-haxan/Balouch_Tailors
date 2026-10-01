import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import defaultLogo from '../assets/BT_Logo.png';
import { useGetShopSettings } from '../hooks/useShopSettings';

const Header = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { data: shopSettings } = useGetShopSettings();

    const currentLogo = shopSettings?.logoUrl || defaultLogo;
    const shopName = shopSettings?.shopName || "Balouch Tailors";

    // Google Maps Universal Link with exact Place ID
    const destinationQuery = encodeURIComponent(shopName + " Multan");
    const placeId = "ChIJOxF6UagzOzkROAZCfNdJGds";
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destinationQuery}&destination_place_id=${placeId}`;

    const handleGetDirections = (e) => {
        e.preventDefault();
        window.open(directionsUrl, '_blank', 'noopener,noreferrer');
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    return (
        <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-100 relative">
            <div className="container mx-auto px-4 py-3 sm:py-4 flex flex-wrap items-center justify-between">
                <div className="flex-shrink-0 z-50 relative">
                    <Link to="/" className="flex items-center group">
                        <img src={currentLogo} alt={`${shopName} Logo`} className="h-14 sm:h-16 md:h-20 w-auto object-contain transform scale-110 origin-left transition-transform group-hover:scale-105" />
                        <span className="ml-3 text-2xl md:text-3xl font-black text-gray-900 tracking-tighter uppercase hidden sm:block">
                            {shopName.split(' ')[0]} <span className="text-gray-400 font-light">{shopName.split(' ').slice(1).join(' ') || 'Tailors'}</span>
                        </span>
                    </Link>
                </div>
                
                <div className="hidden lg:flex flex-grow justify-center">
                    <nav>
                        <ul className="flex space-x-6 xl:space-x-8 text-sm font-bold text-gray-700">
                            <li><Link to="/" className="hover:text-[#DFAC43] transition-colors">Home</Link></li>
                            <li><Link to="/services" className="hover:text-[#DFAC43] transition-colors">Services</Link></li>
                            <li><Link to="/catalogue" className="hover:text-[#DFAC43] transition-colors">Catalogue</Link></li>
                            <li><Link to="/pricing" className="hover:text-[#DFAC43] transition-colors">Pricing</Link></li>
                            <li><Link to="/contact" className="hover:text-[#DFAC43] transition-colors">Contact</Link></li>
                        </ul>
                    </nav>
                </div>

                <div className="hidden md:flex items-center gap-3">
                    <button 
                        onClick={handleGetDirections}
                        className="inline-block px-6 py-2.5 bg-[#0F172A] text-[#DFAC43] hover:text-white text-xs sm:text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors rounded shadow-xs"
                    >
                        Visit Us
                    </button>
                </div>

                {/* Mobile menu button */}
                <div className="lg:hidden flex items-center gap-2 z-50 relative">
                    <button onClick={toggleMenu} className="text-gray-700 hover:text-black focus:outline-none p-1.5" aria-label="Toggle Navigation">
                        {isMenuOpen ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isMenuOpen && (
                <div className="lg:hidden absolute top-full left-0 w-full bg-white shadow-xl border-t border-gray-100 z-40 animate-fade-in">
                    <div className="container mx-auto px-4 py-4">
                        <nav>
                            <ul className="flex flex-col space-y-3 text-sm font-bold text-gray-800">
                                <li><Link to="/" onClick={toggleMenu} className="block hover:text-[#DFAC43] transition-colors py-1.5">Home</Link></li>
                                <li><Link to="/services" onClick={toggleMenu} className="block hover:text-[#DFAC43] transition-colors py-1.5">Services</Link></li>
                                <li><Link to="/catalogue" onClick={toggleMenu} className="block hover:text-[#DFAC43] transition-colors py-1.5">Catalogue</Link></li>
                                <li><Link to="/pricing" onClick={toggleMenu} className="block hover:text-[#DFAC43] transition-colors py-1.5">Pricing</Link></li>
                                <li><Link to="/contact" onClick={toggleMenu} className="block hover:text-[#DFAC43] transition-colors py-1.5">Contact</Link></li>
                                <li className="pt-2 border-t border-gray-100">
                                    <button onClick={(e) => { handleGetDirections(e); toggleMenu(); }} className="w-full text-left py-2 text-[#0F172A] font-black flex items-center justify-between">
                                        <span>Visit Us</span>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
