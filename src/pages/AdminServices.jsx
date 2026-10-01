import React, { useState } from 'react';
import { 
  useGetOffers, 
  useAddOffer, 
  useUpdateOffer, 
  useDeleteOffer 
} from '../hooks/useOffers';
import Preloader from '../components/Preloader';
import { 
  FiPlus, 
  FiEdit, 
  FiTrash2, 
  FiX, 
  FiLayers, 
  FiCheckCircle, 
  FiImage, 
  FiList, 
  FiEye 
} from 'react-icons/fi';

const AdminServices = () => {
  const { data: offersList = [], isLoading, isError } = useGetOffers();
  const { mutate: deleteOffer, isPending: isDeleting } = useDeleteOffer();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOffer, setEditingOffer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [previewOffer, setPreviewOffer] = useState(null);

  const openModal = (offer = null) => {
    setEditingOffer(offer);
    setIsModalOpen(true);
  };

  const handleDelete = (id, title) => {
    deleteOffer(id);
  };

  const filteredOffers = offersList.filter(offer => 
    offer.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    offer.desc?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) return <div className="flex justify-center items-center h-64"><Preloader /></div>;
  if (isError) return <div className="text-red-500 text-center py-10 font-bold">Failed to load services & offers data.</div>;

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 space-y-6">
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-gray-100 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#0F172A] text-[#DFAC43] flex items-center justify-center font-bold shrink-0 shadow-xs">
              <FiLayers className="text-lg" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
              Manage Services & Offers
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 font-medium max-w-2xl leading-relaxed">
            Control the "What we offer our Clients" cards and service details shown on the website landing page.
          </p>
        </div>

        <button
          onClick={() => openModal()}
          className="w-full sm:w-auto bg-[#0F172A] text-[#DFAC43] hover:bg-[#DFAC43] hover:text-[#0F172A] px-4 py-2.5 rounded-lg text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-2 shadow-sm shrink-0 whitespace-nowrap cursor-pointer"
        >
          <FiPlus className="text-base shrink-0" />
          <span>Add New Service</span>
        </button>
      </div>

      {/* FILTER & STATS BAR */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gray-50 p-3 sm:p-3.5 rounded-xl border border-gray-200">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">
            Total Services: <strong className="text-black text-sm">{offersList.length}</strong>
          </span>
        </div>
        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Search service title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-white border border-gray-300 text-xs font-medium outline-none focus:border-[#DFAC43] transition shadow-2xs"
          />
        </div>
      </div>

      {/* OFFERS GRID */}
      {filteredOffers.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
          <FiLayers className="mx-auto text-4xl text-gray-400 mb-2" />
          <p className="text-gray-500 font-bold text-sm">No services or offers found.</p>
          <p className="text-gray-400 text-xs mt-1">Click the "Add New Service" button above to create one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 min-[540px]:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredOffers.map((offer) => (
            <div 
              key={offer._id} 
              className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col h-full"
            >
              {/* IMAGE HEADER */}
              <div className="relative h-48 bg-gray-100 overflow-hidden">
                <img
                  src={offer.imageUrl}
                  alt={offer.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 right-2 bg-black/75 backdrop-blur-sm text-[#DFAC43] text-[10px] font-black px-2.5 py-0.5 rounded-md shadow-xs">
                  Order #{offer.order || 0}
                </div>
              </div>

              {/* CARD BODY */}
              <div className="p-4 sm:p-5 flex flex-col flex-grow">
                <h3 className="font-bold text-base sm:text-lg text-gray-900 group-hover:text-[#D4AF37] transition-colors leading-snug">
                  {offer.title}
                </h3>
                
                <p className="text-xs text-gray-600 mt-2 line-clamp-3 leading-relaxed font-medium">
                  {offer.desc}
                </p>

                {/* INCLUDED DETAILS PREVIEW */}
                {offer.details && offer.details.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2 flex items-center gap-1">
                      <FiList className="text-xs" /> Included Features ({offer.details.length}):
                    </p>
                    <ul className="space-y-1">
                      {offer.details.slice(0, 3).map((item, idx) => (
                        <li key={idx} className="text-[11px] text-gray-700 flex items-start gap-1.5 line-clamp-1">
                          <span className="text-[#D4AF37] font-bold">•</span>
                          <span className="truncate">{item}</span>
                        </li>
                      ))}
                      {offer.details.length > 3 && (
                        <li className="text-[10px] text-gray-400 italic font-medium">
                          +{offer.details.length - 3} more points
                        </li>
                      )}
                    </ul>
                  </div>
                )}

                {/* ACTIONS */}
                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between gap-1.5">
                  <button
                    onClick={() => setPreviewOffer(offer)}
                    className="text-xs font-bold text-gray-600 hover:text-black flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-gray-100 transition cursor-pointer shrink-0"
                  >
                    <FiEye className="text-xs sm:text-sm" /> <span>Preview</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openModal(offer)}
                      className="text-[11px] sm:text-xs font-bold text-gray-800 hover:text-black bg-gray-100 hover:bg-gray-200 px-2.5 sm:px-3 py-1.5 rounded-lg transition flex items-center gap-1 border border-gray-200 cursor-pointer"
                    >
                      <FiEdit className="text-xs" /> <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(offer._id, offer.title)}
                      disabled={isDeleting}
                      className="text-[11px] sm:text-xs font-bold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2.5 sm:px-3 py-1.5 rounded-lg transition flex items-center gap-1 border border-red-100 cursor-pointer"
                    >
                      <FiTrash2 className="text-xs" /> <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {isModalOpen && (
        <OfferFormModal
          offer={editingOffer}
          closeModal={() => setIsModalOpen(false)}
        />
      )}

      {/* PREVIEW MODAL */}
      {previewOffer && (
        <OfferPreviewModal
          offer={previewOffer}
          closeModal={() => setPreviewOffer(null)}
        />
      )}
    </div>
  );
};

// -------------------------------------------------------------
// OFFER FORM MODAL (ADD & EDIT)
// -------------------------------------------------------------
const OfferFormModal = ({ offer, closeModal }) => {
  const { mutate: addOffer, isPending: isAdding } = useAddOffer();
  const { mutate: updateOffer, isPending: isUpdating } = useUpdateOffer();
  const isEditing = Boolean(offer);

  const [title, setTitle] = useState(offer?.title || '');
  const [desc, setDesc] = useState(offer?.desc || '');
  const [order, setOrder] = useState(offer?.order || 0);
  const [detailInputs, setDetailInputs] = useState(
    offer?.details && offer.details.length > 0 ? offer.details : ['']
  );
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(offer?.imageUrl || '');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDetailChange = (index, value) => {
    const updated = [...detailInputs];
    updated[index] = value;
    setDetailInputs(updated);
  };

  const addDetailField = () => {
    setDetailInputs([...detailInputs, '']);
  };

  const removeDetailField = (index) => {
    if (detailInputs.length > 1) {
      setDetailInputs(detailInputs.filter((_, i) => i !== index));
    } else {
      setDetailInputs(['']);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim() || !desc.trim()) {
      return alert('Title and Description are required!');
    }

    if (!isEditing && !imageFile && !imagePreview) {
      return alert('Please select a service image!');
    }

    const filteredDetails = detailInputs.map(d => d.trim()).filter(Boolean);

    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('desc', desc.trim());
    formData.append('order', order);
    formData.append('details', JSON.stringify(filteredDetails));

    if (imageFile) {
      formData.append('image', imageFile);
    } else if (imagePreview && isEditing) {
      formData.append('imageUrl', imagePreview);
    }

    if (isEditing) {
      updateOffer({ id: offer._id, formData }, {
        onSuccess: () => closeModal()
      });
    } else {
      addOffer(formData, {
        onSuccess: () => closeModal()
      });
    }
  };

  const isPending = isAdding || isUpdating;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* HEADER */}
        <div className="bg-[#0F172A] text-white px-5 sm:px-6 py-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <FiLayers className="text-[#DFAC43] text-lg" />
            <h2 className="text-base sm:text-lg font-bold">
              {isEditing ? 'Edit Service / Offer' : 'Add New Service / Offer'}
            </h2>
          </div>
          <button 
            onClick={closeModal}
            className="text-gray-400 hover:text-white p-1 transition cursor-pointer"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
          {/* TITLE & ORDER */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Service Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Bespoke Shalwar Kameez"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-[#DFAC43] outline-none font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                Display Order
              </label>
              <input
                type="number"
                placeholder="1, 2, 3..."
                value={order}
                onChange={(e) => setOrder(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-[#DFAC43] outline-none font-medium"
              />
            </div>
          </div>

          {/* DESCRIPTION */}
          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
              Short Description *
            </label>
            <textarea
              required
              rows="3"
              placeholder="Provide a compelling overview for this service..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-[#DFAC43] outline-none font-medium resize-y"
            ></textarea>
          </div>

          {/* INCLUDED DETAILS (BULLET POINTS) */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="block text-xs font-bold uppercase text-gray-700">
                What's Included / Service Features (Bullet Points)
              </label>
              <button
                type="button"
                onClick={addDetailField}
                className="text-xs text-[#0F172A] font-bold hover:text-[#DFAC43] flex items-center gap-1 cursor-pointer"
              >
                <FiPlus className="text-sm" /> Add Feature Point
              </button>
            </div>
            
            <div className="space-y-2">
              {detailInputs.map((detail, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-gray-400 text-xs font-bold w-4 text-center">{index + 1}.</span>
                  <input
                    type="text"
                    placeholder={`e.g. Premium fabrics including Egyptian cotton...`}
                    value={detail}
                    onChange={(e) => handleDetailChange(index, e.target.value)}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-xs sm:text-sm focus:border-[#DFAC43] outline-none font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => removeDetailField(index)}
                    className="text-gray-400 hover:text-red-600 p-1.5 rounded transition cursor-pointer"
                    title="Remove point"
                  >
                    <FiX className="text-sm" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* IMAGE UPLOAD & PREVIEW */}
          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
              Service Banner Image {isEditing ? '(Optional to replace)' : '*'}
            </label>
            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="flex-1 w-full">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full border border-gray-300 rounded-lg p-2 text-xs sm:text-sm bg-gray-50 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-[#0F172A] file:text-white hover:file:bg-[#DFAC43] hover:file:text-black cursor-pointer"
                />
                <p className="text-[11px] text-gray-500 mt-1 font-medium">
                  Recommended: <strong className="text-gray-800">4:3 Aspect Ratio</strong> (e.g. <span className="text-[#DFAC43] font-bold">800 × 600 px</span> or <span className="text-[#DFAC43] font-bold">600 × 480 px</span>) for perfect card framing.
                </p>
              </div>

              {imagePreview && (
                <div className="w-24 h-20 rounded-lg border border-gray-200 overflow-hidden shrink-0 bg-gray-100 relative">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          {/* SUBMIT BUTTONS */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={closeModal}
              disabled={isPending}
              className="px-4 py-2 text-xs sm:text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-2 bg-[#0F172A] hover:bg-[#DFAC43] text-white hover:text-[#0F172A] text-xs sm:text-sm font-black rounded-lg transition shadow flex items-center gap-2 cursor-pointer"
            >
              {isPending ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// -------------------------------------------------------------
// PREVIEW MODAL (Match Public Modal Feel)
// -------------------------------------------------------------
const OfferPreviewModal = ({ offer, closeModal }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative bg-white rounded-xl shadow-2xl max-w-3xl w-full flex flex-col md:flex-row overflow-hidden max-h-[90vh] my-auto">
        <button 
          onClick={closeModal}
          className="absolute top-3 right-3 z-20 bg-white/90 hover:bg-white rounded-full p-2 text-gray-800 transition shadow cursor-pointer"
        >
          <FiX className="text-base" />
        </button>
        
        <div className="md:w-1/2 h-48 md:h-auto relative bg-gray-100 shrink-0">
          <img src={offer.imageUrl} alt={offer.title} className="w-full h-full object-cover" />
        </div>
        
        <div className="md:w-1/2 p-5 sm:p-7 flex flex-col overflow-y-auto">
          <span className="text-[#D4AF37] text-xs font-black tracking-widest uppercase mb-1">
            Service Details Preview
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-3">
            {offer.title}
          </h3>
          <p className="text-gray-600 mb-5 text-xs sm:text-sm leading-relaxed font-medium">
            {offer.desc}
          </p>
          
          <h4 className="font-bold text-gray-900 mb-2 text-xs uppercase tracking-wider">What's Included:</h4>
          <ul className="space-y-2 mb-6 flex-grow">
            {(offer.details || []).map((detail, idx) => (
              <li key={idx} className="flex items-start text-xs text-gray-600">
                <FiCheckCircle className="text-[#D4AF37] text-sm mr-2 mt-0.5 shrink-0" />
                <span>{detail}</span>
              </li>
            ))}
          </ul>
          
          <div className="mt-auto pt-4 border-t border-gray-100">
            <button 
              onClick={closeModal}
              className="w-full bg-[#0F172A] hover:bg-[#DFAC43] text-white hover:text-[#0F172A] font-black py-2.5 rounded-lg text-xs uppercase tracking-wider transition cursor-pointer"
            >
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminServices;
