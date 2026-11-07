// Order Status Badge Color Logic
export const getStatusColor = (status) => {
  switch(status) {
    case 'Pending':
    case 'Booked':
      return 'bg-amber-50 text-amber-900 border-amber-200';
    case 'In Progress':
      return 'bg-blue-50 text-blue-800 border-blue-200';
    case 'Cutting':
      return 'bg-indigo-50 text-indigo-800 border-indigo-200';
    case 'Stitching':
      return 'bg-purple-50 text-purple-800 border-purple-200';
    case 'Ready':
      return 'bg-teal-50 text-teal-800 border-teal-200';
    case 'Completed':
      return 'bg-amber-50 text-[#DFAC43] border-[#DFAC43]';
    case 'Delivered':
      return 'bg-[#0F172A] text-white border-[#0F172A]';
    case 'Cancelled':
      return 'bg-red-50 text-red-700 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};
// Order status flow (must match the backend ORDER_STATUS_FLOW in orderController.js)
export const ORDER_STATUS_OPTIONS = [
  { value: 'Pending', label: 'Pending - Booked / Stitching' },
  { value: 'In Progress', label: 'In Progress - Pressing & Packing' },
  { value: 'Completed', label: 'Completed - Ready for Pickup' },
  { value: 'Delivered', label: 'Delivered - Settle Payment...' },
  { value: 'Cancelled', label: 'Cancelled' }
];

export const ORDER_STATUS_FLOW = {
  'Pending': ['In Progress', 'Completed', 'Cancelled'],
  'In Progress': ['Pending', 'Completed', 'Cancelled'],
  'Completed': ['In Progress', 'Cancelled'],
  'Delivered': [],
  'Cancelled': []
};