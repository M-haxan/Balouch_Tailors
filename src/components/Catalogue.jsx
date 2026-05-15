import React, { useState } from 'react';

const catalogueData = {
    'Shalwar Qameez': [
        { id: 1, image: 'https://www.mashalcouture.com/cdn/shop/files/MCKS21KurtaShalwarForMen.jpg?v=1702395810&width=1946', title: 'Simple Shalwar Qameez', price: 'Rs. 1200' },
        { id: 2, image: 'https://edenrobe.com/cdn/shop/files/24_M_MenKurtaShalwarTailored_EMTKST24-99445_2.jpg?v=1715177477', title: 'Double Silai Shalwar Qameez', price: 'Rs. 1400' },
        { id: 3, image: 'https://theworldofhsy.com/cdn/shop/files/sandstone-embroidered-kurta-shalwar-kameez-front.jpg?v=1756190534&width=533', title: 'Extra Design Shalwar Qameez', price: 'Rs. 1600' },
    ],
    'Shirts': [
        { id: 4, image: 'https://www.gulahmedshop.com/cdn/shop/files/Men-DressShirts-Color-Sky-CVC-ModernFit-FS-PLN26-018-Half-Front_940x.jpg?v=1777881698', title: 'Bespoke Formal Shirt', price: 'Rs. 1200' },
        { id: 5, image: 'https://discountstore.pk/cdn/shop/files/7_ef9b4711-a98f-4ccb-947e-1895d50cf6e0.webp?v=1733144289', title: 'Casual Denim Tailored', price: 'Rs. 1200' },
        { id: 6, image: 'https://image.made-in-china.com/202f0j00HqtVLYeWsyzG/Fashion-Stylish-Man-Dress-Shirt-Blue-Fancy-Shirts-for-Men.webp', title: 'Office Checkered Shirt', price: 'Rs. 1200' },
    ],
    'Kurta': [
        { id: 7, image: 'https://vidyarthionline.com/cdn/shop/files/3_ee658749-fbc6-48f2-99d9-c0f8be373a83_1200x1200.jpg?v=1725893014', title: 'Traditional White Kurta', price: 'Rs. 1200' },
        { id: 8, image: 'https://arysahulatbazar.pk/wp-content/uploads/2023/04/ER-Wh532-White-Kurta-Pajama-With-Simple-Motifs-FOr-Men.jpg', title: 'Embroidered Silk Kurta', price: 'Rs. 1200' },
        { id: 9, image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBgy0V4SKdCiMxieqaMTrp_G3_A8MpuUwclA&s', title: 'Festive Wear Kurta', price: 'Rs. 1200' },
    ]
};
const Catalogue = () => {
    const [activeTab, setActiveTab] = useState('Shalwar Qameez');
    const [selectedItem, setSelectedItem] = useState(null);
    const categories = Object.keys(catalogueData);

    const handleWhatsAppOrder = (item) => {
        const message = `Hello Balouch Tailors! I am interested in the "${item.title}" (${item.price}). Please let me know the details.`;
        window.open(`https://wa.me/923067379919?text=${encodeURIComponent(message)}`, '_blank');
    };

    return (
        <section className="py-24 bg-gray-50 overflow-hidden" id="catalogue">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-sm font-bold tracking-widest text-gray-500 uppercase mb-3">Our Designs</h2>
                    <h3 className="text-4xl md:text-5xl font-black text-gray-900 mb-8">Design Catalogue</h3>
                    <div className="flex flex-wrap justify-center gap-4">
                        {categories.map((category) => (
                            <button
                                key={category}
                                onClick={() => setActiveTab(category)}
                                className={`px-8 py-3 text-sm font-bold uppercase tracking-wider rounded-full transition-all duration-300 ${
                                    activeTab === category
                                        ? 'bg-black text-white shadow-lg scale-105'
                                        : 'bg-white text-gray-600 hover:bg-gray-200 shadow-sm border border-gray-100'
                                }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-500">
                    {catalogueData[activeTab].map((item) => (
                        <div key={item.id} className="group relative overflow-hidden rounded-xl bg-white shadow-md hover:shadow-2xl transition-all duration-300">
                            <div className="overflow-hidden h-[450px] relative bg-gray-50 flex items-center justify-center p-4">
                                <img 
                                    src={item.image} 
                                    alt={item.title} 
                                    className="max-w-full max-h-full object-contain transform group-hover:scale-105 transition-transform duration-700 drop-shadow-sm"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                                    <div className="p-6 w-full transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                        <h4 className="text-white text-xl font-bold mb-2">{item.title}</h4>
                                        <button 
                                            onClick={() => setSelectedItem(item)}
                                            className="text-sm text-gray-200 uppercase tracking-wider font-semibold border-b-2 border-white pb-1 hover:text-white transition-colors">
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Product Details Modal */}
            {selectedItem && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setSelectedItem(null)}>
                    <div 
                        className="bg-white rounded-2xl overflow-hidden max-w-4xl w-full flex flex-col md:flex-row relative animate-fade-in-up"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button 
                            onClick={() => setSelectedItem(null)}
                            className="absolute top-4 right-4 z-10 w-10 h-10 bg-black/5 backdrop-blur-md rounded-full flex items-center justify-center text-gray-900 hover:bg-black/10 transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                        
                        <div className="md:w-1/2 bg-gray-50 flex items-center justify-center p-8 h-[400px] md:h-[600px]">
                            <img src={selectedItem.image} alt={selectedItem.title} className="max-w-full max-h-full object-contain drop-shadow-md" />
                        </div>
                        
                        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                            <span className="text-sm font-bold tracking-widest text-gray-500 uppercase mb-2">{activeTab}</span>
                            <h3 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">{selectedItem.title}</h3>
                            <p className="text-2xl font-bold text-[#D4AF37] mb-8">{selectedItem.price}</p>
                            
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                Premium quality bespoke tailoring. Experience the perfect fit crafted exactly to your measurements by our expert tailors.
                            </p>

                            <button 
                                onClick={() => handleWhatsAppOrder(selectedItem)}
                                className="w-full py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-green-500/30 hover:shadow-green-500/50 hover:-translate-y-1"
                            >
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.394 0 .012 5.38.012 12.019c0 2.122.553 4.195 1.603 6.01L.062 24l6.115-1.604a11.972 11.972 0 005.854 1.523h.005c6.635 0 12.016-5.38 12.016-12.02C24.05 5.27 18.666 0 12.031 0zm.006 21.905h-.004a9.948 9.948 0 01-5.068-1.38l-.364-.216-3.766.987.997-3.674-.236-.376A9.973 9.973 0 012.035 12.02c0-5.518 4.49-10.006 10.007-10.006 5.514 0 10.005 4.488 10.005 10.006 0 5.518-4.49 10.005-10.01 10.005zm5.495-7.514c-.302-.15-1.785-.88-2.062-.982-.278-.1-.48-.15-.681.15-.202.302-.782.982-.958 1.183-.177.202-.355.227-.657.077-.302-.15-1.275-.47-2.43-1.504-.897-.805-1.504-1.8-1.68-2.102-.177-.302-.02-.465.13-.616.136-.136.302-.352.453-.527.15-.176.202-.302.302-.503.1-.201.05-.377-.025-.527-.076-.15-.682-1.644-.934-2.25-.246-.593-.497-.512-.681-.522-.177-.008-.38-.01-.582-.01a1.118 1.118 0 00-.81.378c-.277.302-1.06 1.036-1.06 2.525s1.085 2.932 1.236 3.134c.15.201 2.138 3.262 5.178 4.57.722.311 1.286.496 1.725.635.725.23 1.385.198 1.902.12.58-.088 1.785-.729 2.037-1.433.252-.703.252-1.306.177-1.432-.075-.126-.277-.202-.579-.353z"/></svg>
                                <span>Order via WhatsApp</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};
export default Catalogue;
