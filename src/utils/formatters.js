/**
 * Standard Phone Number Formatter
 * Pakistan mobile numbers usually start with 03xx-xxxxxxx (11 digits).
 * If a legacy number is stored as a Number in DB (e.g. 3123456789 - 10 digits),
 * this helper automatically prefixes the leading '0' (e.g. 03123456789).
 */
export const formatPhone = (phone) => {
  if (phone === null || phone === undefined || phone === '') return '-';
  
  const str = phone.toString().trim();
  if (!str) return '-';
  
  const digitsOnly = str.replace(/\D/g, '');
  
  // 10 digits starting with 3 -> add leading 0 (e.g. 3123456789 -> 03123456789)
  if (digitsOnly.length === 10 && digitsOnly.startsWith('3')) {
    return '0' + digitsOnly;
  }
  
  // 12 digits starting with 923 -> 03...
  if (digitsOnly.length === 12 && digitsOnly.startsWith('923')) {
    return '0' + digitsOnly.slice(2);
  }
  
  // 11 digits starting with 03 -> return clean 03...
  if (digitsOnly.length === 11 && digitsOnly.startsWith('03')) {
    return digitsOnly;
  }
  
  return str;
};

/**
 * Standard WhatsApp / International format helper (e.g., 923123456789)
 */
export const getCleanPhoneForWA = (phone) => {
  if (!phone) return '';
  let clean = phone.toString().replace(/\D/g, '');
  if (clean.startsWith('0')) {
    clean = '92' + clean.slice(1);
  } else if (clean.startsWith('3') && clean.length === 10) {
    clean = '92' + clean;
  }
  return clean;
};
