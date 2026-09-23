import React from 'react';
import { useGetShopSettings } from '../hooks/useShopSettings';

const Hero = () => {
    const { data: shopSettings } = useGetShopSettings();
    const shopName = shopSettings?.shopName || 'Balouch Tailors';
    const tagline = shopSettings?.tagline || 'Custom-fit Gents Shalwar Kameez designed for the modern man.';

    return (
        <div className="relative bg-gray-900 min-h-[100dvh] flex items-center justify-center overflow-hidden">
            {/* Background Image with Gradient Overlay */}
            <div 
                className="absolute inset-0 bg-cover bg-[position:75%_center] md:bg-center" 
                style={{ backgroundImage: 'url(/assets/img/hero/h1_hero.jpeg)' }}
            >
                {/* Gradient overlay for perfect text readability while showing image */}
                <div className="absolute inset-0 bg-gradient-to-b md:bg-gradient-to-r from-gray-950/95 via-gray-900/80 md:via-gray-900/80 to-gray-900/40 md:to-transparent"></div>
                <div className="absolute inset-0 bg-black/30 md:bg-black/20"></div>
            </div>
            
            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center pt-20 pb-16 md:py-0">
                <div className="max-w-3xl">
                    <span className="block text-[#D4AF37] font-bold tracking-[0.3em] uppercase mb-4 text-xs sm:text-sm md:text-base animate-fade-in-up">
                        Welcome to {shopName}
                    </span>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
                        Wear Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-yellow-200">
                            Confidence.
                        </span>
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl text-gray-200 font-light tracking-wide mb-10 leading-relaxed max-w-2xl drop-shadow">
                        {tagline} From classic whites to contemporary hues, {shopName} ensures you never settle for less than a perfect fit.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Hero;
