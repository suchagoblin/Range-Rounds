export const validateUsername = (username: string): { valid: boolean; error?: string } => {
  if (!username || username.trim().length === 0) {
    return { valid: false, error: 'Username is required' };
  }
  if (username.length < 3) {
    return { valid: false, error: 'Username must be at least 3 characters' };
  }
  if (username.length > 20) {
    return { valid: false, error: 'Username must be less than 20 characters' };
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { valid: false, error: 'Username can only contain letters, numbers, hyphens, and underscores' };
  }
  return { valid: true };
};

export const validateName = (name: string): { valid: boolean; error?: string } => {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Name is required' };
  }
  if (name.length < 2) {
    return { valid: false, error: 'Name must be at least 2 characters' };
  }
  if (name.length > 50) {
    return { valid: false, error: 'Name must be less than 50 characters' };
  }
  return { valid: true };
};

export const validatePin = (pin: string): { valid: boolean; error?: string } => {
  if (!pin || pin.trim().length === 0) {
    return { valid: false, error: 'PIN is required' };
  }
  if (!/^\d{4,6}$/.test(pin)) {
    return { valid: false, error: 'PIN must be 4-6 digits' };
  }
  return { valid: true };
};

export const validateYardage = (yardage: number): { valid: boolean; error?: string } => {
  if (isNaN(yardage)) {
    return { valid: false, error: 'Yardage must be a number' };
  }
  if (yardage < 0) {
    return { valid: false, error: 'Yardage must be positive' };
  }
  if (yardage > 400) {
    return { valid: false, error: 'Yardage must be less than 400' };
  }
  return { valid: true };
};

export const validatePutts = (putts: number): { valid: boolean; error?: string } => {
  if (isNaN(putts)) {
    return { valid: false, error: 'Putts must be a number' };
  }
  if (putts < 0) {
    return { valid: false, error: 'Putts must be positive' };
  }
  if (putts > 10) {
    return { valid: false, error: 'Putts must be less than 10' };
  }
  return { valid: true };
};

export const validateDistance = (distance: number): { valid: boolean; error?: string } => {
  if (isNaN(distance)) {
    return { valid: false, error: 'Distance must be a number' };
  }
  if (distance < 1) {
    return { valid: false, error: 'Distance must be at least 1 yard' };
  }
  if (distance > 500) {
    return { valid: false, error: 'Distance must be less than 500 yards' };
  }
  return { valid: true };
};

export const validateCourseName = (name: string): { valid: boolean; error?: string } => {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Course name is required' };
  }
  if (name.length < 3) {
    return { valid: false, error: 'Course name must be at least 3 characters' };
  }
  if (name.length > 100) {
    return { valid: false, error: 'Course name must be less than 100 characters' };
  }
  return { valid: true };
};

export const validateShareCode = (code: string): { valid: boolean; error?: string } => {
  if (!code || code.trim().length === 0) {
    return { valid: false, error: 'Share code is required' };
  }
  if (code.length !== 8) {
    return { valid: false, error: 'Share code must be 8 characters' };
  }
  if (!/^[A-Z0-9]+$/.test(code)) {
    return { valid: false, error: 'Invalid share code format' };
  }
  return { valid: true };
};
