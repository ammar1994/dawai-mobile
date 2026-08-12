export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidPhone(phone: string): boolean {
  return /^(\+966|0)?5\d{8}$/.test(phone.replace(/\s/g, ''));
}

export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

export function isValidTime(time: string): boolean {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(time);
}
