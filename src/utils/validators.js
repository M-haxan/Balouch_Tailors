/**
 * Password Complexity Validator
 * Rules:
 * 1. Minimum 8 characters
 * 2. At least one special character (!@#$%^&* etc.)
 */
export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') {
    return {
      isValid: false,
      lengthValid: false,
      specialCharValid: false,
      error: 'Password is required'
    };
  }

  const lengthValid = password.length >= 8;
  const specialCharRegex = /[!@#$%^&*(),.?":{}|<>_\-+=\\/\[\]`~]/;
  const specialCharValid = specialCharRegex.test(password);

  let error = null;
  if (!lengthValid && !specialCharValid) {
    error = 'Password must be at least 8 characters and include at least 1 special character.';
  } else if (!lengthValid) {
    error = 'Password must be at least 8 characters long.';
  } else if (!specialCharValid) {
    error = 'Password must include at least one special character (e.g. !@#$%^&*).';
  }

  return {
    isValid: lengthValid && specialCharValid,
    lengthValid,
    specialCharValid,
    error
  };
};
