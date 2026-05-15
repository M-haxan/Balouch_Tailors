import React from 'react';

const Hero = () => {
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
                        Welcome to Balouch Tailors
                    </span>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
                        Wear Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-yellow-200">
                            Confidence.
                        </span>
                    </h1>
                    <p className="text-base sm:text-lg md:text-xl text-gray-200 font-light tracking-wide mb-10 leading-relaxed max-w-2xl drop-shadow">
                        Custom-fit Gents Shalwar Kameez designed for the modern man. From classic whites to contemporary hues, Balouch Tailors ensures you never settle for less than a perfect fit.
                    </p>
                    
                    {/* <div className="flex flex-col sm:flex-row gap-5">
                        <button className="px-8 py-4 bg-gradient-to-r from-[#D4AF37] to-[#e6c148] hover:from-[#b5952f] hover:to-[#d4af37] text-gray-900 font-bold text-lg rounded-sm shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all duration-300 transform hover:-translate-y-1">
                            Book an Appointment
                        </button>
                        <button className="px-8 py-4 bg-transparent border border-gray-400 hover:border-white hover:text-white text-gray-300 font-medium text-lg rounded-sm transition-all duration-300 hover:bg-white/5 backdrop-blur-sm">
                            Explore Collection
                        </button>
                    </div> */}
                </div>
            </div>
        </div>
    );
};

export default Hero;
