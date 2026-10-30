import React, { useState, useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import { useAddCatalogue, useUpdateCatalogue } from '../hooks/useCatalogue';

const CatalogueModal = ({ item = null, closeModal, categories = [], defaultCategory }) => {
  const isEdit = Boolean(item && item._id);

  const { mutate: addDesign, isPending: isAdding } = useAddCatalogue();
  const { mutate: updateDesign, isPending: isUpdating } = useUpdateCatalogue();
  const isPending = isEdit ? isUpdating : isAdding;

  const [form, setForm] = useState({
    title: item?.title || '',
    detail: item?.detail || 'Custom Tailored Design',
    category: item?.category || defaultCategory || categories[0] || 'Shalwar Qameez',
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(item?.imageUrl || '');

  useEffect(() => {
    if (item) {
      setForm({
        title: item.title || '',
        detail: item.detail || 'Custom Tailored Design',
        category: item.category || defaultCategory || categories[0] || 'Shalwar Qameez',
      });
      setImagePreview(item.imageUrl || '');
      setImage(null);
    } else {
      setForm({
        title: '',
        detail: 'Custom Tailored Design',
        category: defaultCategory || categories[0] || 'Shalwar Qameez',
      });
      setImagePreview('');
      setImage(null);
    }
  }, [item, defaultCategory, categories]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isEdit && !image) {
      return alert('Please select a design image!');
    }

    const finalTitle = form.title.trim() || 'Vol. Design';

    const formData = new FormData();
    formData.append('title', finalTitle);
    formData.append('detail', form.detail || 'Custom Tailored Design');
    formData.append('category', form.category);

    if (image) {
      formData.append('image', image);
    }

    if (isEdit) {
      updateDesign(
        { id: item._id, formData },
        {
          onSuccess: () => closeModal(),
        }
      );
    } else {
      addDesign(formData, {
        onSuccess: () => closeModal(),
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white p-5 sm:p-6 rounded-xl shadow-xl w-full max-w-md relative max-h-[92vh] overflow-y-auto my-auto">
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 text-gray-500 hover:text-black p-1 transition cursor-pointer"
        >
          <FiX className="text-lg" />
        </button>
        <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
          {isEdit ? 'Edit Design' : 'Add New Design Image'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
              {isEdit ? 'Volume Title *' : 'Volume Title (e.g. Vol. 01, Vol. 02) *'}
            </label>
            <input
              required
              type="text"
              placeholder={isEdit ? '' : 'e.g. Vol. 01'}
              className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:border-[#DFAC43] outline-none font-medium"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
              Category 
            </label>
            <select
              className="w-full border border-gray-300 p-2.5 rounded-lg text-sm focus:border-[#DFAC43] outline-none font-medium"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
              {isEdit ? 'Replace Image (Optional)' : 'Design Image *'}
            </label>
            <input
              required={!isEdit}
              type="file"
              accept="image/*"
              className="w-full border border-gray-300 p-2 rounded-lg text-xs bg-gray-50 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-[#0F172A] file:text-white hover:file:bg-[#DFAC43] hover:file:text-black cursor-pointer"
              onChange={handleImageChange}
            />
            <p className="text-[11px] text-gray-500 mt-1 font-medium">
              Recommended: <strong className="text-gray-800">3:4 Portrait Ratio</strong> (e.g.{' '}
              <span className="text-[#DFAC43] font-bold">750 × 1000 px</span> or{' '}
              <span className="text-[#DFAC43] font-bold">600 × 800 px</span>).
            </p>
            {imagePreview && (
              <div className="mt-2 w-20 h-24 rounded-lg border overflow-hidden bg-gray-100">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}
          </div>

          <button
            disabled={isPending}
            type="submit"
            className="w-full bg-[#0F172A] hover:bg-[#DFAC43] text-white hover:text-[#0F172A] p-2.5 rounded-lg font-bold text-sm transition mt-6 cursor-pointer"
          >
            {isPending
              ? isEdit
                ? 'Updating...'
                : 'Uploading to Slider...'
              : isEdit
              ? 'Save Changes'
              : 'Upload & Save Design'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CatalogueModal;
