import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Footer = () => {
    const location = useLocation();

    // Hide footer on admin dashboard
    if (location.pathname === '/admin/dashboard') {
        return null;
    }

    return (
        <footer className="bg-white border-t border-gray-100 pt-20 pb-10">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row justify-between gap-16 mb-16">
                    <div className="lg:w-1/3">
                        <h2 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-4">
                            Balouch <span className="text-gray-400 font-light">Tailors</span>
                        </h2>
                        <h3 className="text-2xl font-serif italic text-gray-600 leading-relaxed max-w-sm">
                            "The joy of dressing is an art"
                        </h3>
                    </div>
                    
                    <div className="lg:w-2/3 grid grid-cols-1 md:grid-cols-3 gap-10">
                        <div>
                            <h4 className="text-xl font-bold mb-6 text-gray-900">Contact</h4>
                            <div className="text-gray-600 leading-relaxed">
                                <p>Hazori Bagh Road Street No 1<br />Muhallah Muhammadi Multan</p>
                                <p className="mt-2">0306-7379919, 03134389192</p>
                                <p className="mt-2">balouchtailors110@gmail.com</p>
                            </div>
                        </div>
                        
                        <div>
                            <h4 className="text-xl font-bold mb-6 text-gray-900">Links</h4>
                            <ul className="space-y-4 text-gray-600">
                                <li><Link to="/" className="hover:text-black transition-colors">Home</Link></li>
                                <li><Link to="/services" className="hover:text-black transition-colors">Services</Link></li>
                                <li><Link to="/catalogue" className="hover:text-black transition-colors">Catalogue</Link></li>
                                <li><Link to="/pricing" className="hover:text-black transition-colors">Pricing</Link></li>
                                <li><Link to="/contact" className="hover:text-black transition-colors">Contact</Link></li>
                            </ul>
                        </div>
                        
                        <div>
                            <h4 className="text-xl font-bold mb-6 text-gray-900">Social</h4>
                            <div className="flex space-x-4">
                                <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-black hover:text-white transition-colors">
                                    <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path></svg>
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-black hover:text-white transition-colors">
                                    <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path fillRule="evenodd" d="M12.031 0C5.394 0 .012 5.38.012 12.019c0 2.122.553 4.195 1.603 6.01L.062 24l6.115-1.604a11.972 11.972 0 005.854 1.523h.005c6.635 0 12.016-5.38 12.016-12.02C24.05 5.27 18.666 0 12.031 0zm.006 21.905h-.004a9.948 9.948 0 01-5.068-1.38l-.364-.216-3.766.987.997-3.674-.236-.376A9.973 9.973 0 012.035 12.02c0-5.518 4.49-10.006 10.007-10.006 5.514 0 10.005 4.488 10.005 10.006 0 5.518-4.49 10.005-10.01 10.005zm5.495-7.514c-.302-.15-1.785-.88-2.062-.982-.278-.1-.48-.15-.681.15-.202.302-.782.982-.958 1.183-.177.202-.355.227-.657.077-.302-.15-1.275-.47-2.43-1.504-.897-.805-1.504-1.8-1.68-2.102-.177-.302-.02-.465.13-.616.136-.136.302-.352.453-.527.15-.176.202-.302.302-.503.1-.201.05-.377-.025-.527-.076-.15-.682-1.644-.934-2.25-.246-.593-.497-.512-.681-.522-.177-.008-.38-.01-.582-.01a1.118 1.118 0 00-.81.378c-.277.302-1.06 1.036-1.06 2.525s1.085 2.932 1.236 3.134c.15.201 2.138 3.262 5.178 4.57.722.311 1.286.496 1.725.635.725.23 1.385.198 1.902.12.58-.088 1.785-.729 2.037-1.433.252-.703.252-1.306.177-1.432-.075-.126-.277-.202-.579-.353z" clipRule="evenodd"></path></svg>
                                </a>
                                <a href="#" className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-black hover:text-white transition-colors">
                                    <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path></svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row items-center justify-between text-gray-500 text-sm">
                    <p>
                        Copyright &copy;{new Date().getFullYear()} All rights reserved | Built with <i className="fas fa-heart text-red-500 mx-1"></i> Balouch Tailors
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
