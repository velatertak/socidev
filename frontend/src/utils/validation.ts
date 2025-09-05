// Password validation
export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 6 || password.length > 15) {
    errors.push('Password must be between 6 and 15 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[0-9!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one number or special character');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Phone number validation (Turkish format)
export const validatePhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^(\+90|0)?[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};