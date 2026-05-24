import React from 'react';

const VisitTailor = () => {
    // Google Maps Universal Link with exact Place ID
    const shopName = "BALOUCH+TAILOR'S+Multan";
    const placeId = "ChIJOxF6UagzOzkROAZCfNdJGds";
    
    // URL to trigger directions
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${shopName}&destination_place_id=${placeId}`;

    const handleGetDirections = (e) => {
        e.preventDefault();
        window.open(directionsUrl, '_blank', 'noopener,noreferrer');
    };

    return (
        <section className="flex flex-col lg:flex-row bg-white border-y border-gray-100 overflow-hidden" id="visit">
            {/* Left Column: Contact Information */}
            <div className="w-full lg:w-1/2 p-12 lg:p-24 flex flex-col justify-center bg-gray-50">
                <div className="max-w-md mx-auto lg:mx-0">
                    <span className="text-sm font-bold tracking-widest text-gray-500 uppercase mb-4 block">Our Location</span>
                    <h3 className="text-4xl md:text-5xl font-black mb-8 text-gray-900 leading-tight">Visit Our Tailor</h3>
                    
                    <div className="flex items-start mb-6">
                        <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                        </div>
                        <div className="ml-4">
                            <h4 className="text-lg font-bold text-gray-900 mb-1">Address</h4>
                            <p className="text-gray-600 leading-relaxed">Hazori Bagh Road Street No 1<br />Muhallah Muhammadi Multan</p>
                        </div>
                    </div>

                    <div className="flex items-start mb-6">
                        <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                        </div>
                        <div className="ml-4">
                            <h4 className="text-lg font-bold text-gray-900 mb-1">Contact</h4>
                            <p className="text-gray-600">0306-7379919<br />0313-4389192</p>
                        </div>
                    </div>

                    <div className="flex items-start mb-10">
                        <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center flex-shrink-0 mt-1 shadow-md">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                        </div>
                        <div className="ml-4">
                            <h4 className="text-lg font-bold text-gray-900 mb-1">Email</h4>
                            <p className="text-gray-600">balouchtailors110@gmail.com</p>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-gray-200">
                        <h4 className="text-black font-bold uppercase tracking-wider mb-4">Opening hours:</h4>
                        <p className="text-gray-600 font-medium">Sat – Thu: 10.00 am – 08:00 pm</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-6 mt-8">
                        <button onClick={handleGetDirections} className="inline-flex items-center px-6 py-3 bg-black text-white text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors rounded shadow-lg">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            Get Directions
                        </button>
                        <div className="flex space-x-4">
                            <a href="#" className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-black hover:border-black hover:text-white transition-all shadow-sm">
                                <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd"></path></svg>
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-black hover:border-black hover:text-white transition-all shadow-sm">
                                <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path fillRule="evenodd" d="M12.031 0C5.394 0 .012 5.38.012 12.019c0 2.122.553 4.195 1.603 6.01L.062 24l6.115-1.604a11.972 11.972 0 005.854 1.523h.005c6.635 0 12.016-5.38 12.016-12.02C24.05 5.27 18.666 0 12.031 0zm.006 21.905h-.004a9.948 9.948 0 01-5.068-1.38l-.364-.216-3.766.987.997-3.674-.236-.376A9.973 9.973 0 012.035 12.02c0-5.518 4.49-10.006 10.007-10.006 5.514 0 10.005 4.488 10.005 10.006 0 5.518-4.49 10.005-10.01 10.005zm5.495-7.514c-.302-.15-1.785-.88-2.062-.982-.278-.1-.48-.15-.681.15-.202.302-.782.982-.958 1.183-.177.202-.355.227-.657.077-.302-.15-1.275-.47-2.43-1.504-.897-.805-1.504-1.8-1.68-2.102-.177-.302-.02-.465.13-.616.136-.136.302-.352.453-.527.15-.176.202-.302.302-.503.1-.201.05-.377-.025-.527-.076-.15-.682-1.644-.934-2.25-.246-.593-.497-.512-.681-.522-.177-.008-.38-.01-.582-.01a1.118 1.118 0 00-.81.378c-.277.302-1.06 1.036-1.06 2.525s1.085 2.932 1.236 3.134c.15.201 2.138 3.262 5.178 4.57.722.311 1.286.496 1.725.635.725.23 1.385.198 1.902.12.58-.088 1.785-.729 2.037-1.433.252-.703.252-1.306.177-1.432-.075-.126-.277-.202-.579-.353z" clipRule="evenodd"></path></svg>
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-black hover:border-black hover:text-white transition-all shadow-sm">
                                <svg fill="currentColor" viewBox="0 0 24 24" className="w-5 h-5"><path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path></svg>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Right Column: Google Maps Embed */}
            <div className="w-full lg:w-1/2 min-h-[400px] lg:min-h-full relative shadow-inner">
                <iframe 
                    title="Our Location"
                    className="absolute inset-0 w-full h-full border-0"
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3448.2427233880576!2d71.4701772!3d30.20161909999999!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x393b33a8517a113b%3A0xdb1949d77c420638!2sBALOUCH%20TAILOR&#39;S!5e0!3m2!1sen!2s!4v1778842774291!5m2!1sen!2s"
                    allowFullScreen=""
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
            </div>
        </section>
    );
};

export default VisitTailor;
