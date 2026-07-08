export function cleanText(value) {
  return String(value || "").trim().replace(/\s+/g, " ");
}

export function isValidName(value) {
  const text = cleanText(value);
  return /^[a-zA-ZÀ-ž\s.'-]{2,80}$/.test(text);
}

export function isValidContact(value) {
  const text = cleanText(value);
  return isValidEmail(text) || isValidPhone(text);
}

export function isValidEmail(value) {
  const text = cleanText(value);
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(text);
}

export function isValidPhone(value) {
  const text = cleanText(value);
  return /^[+]?[0-9\s().-]{7,24}$/.test(text);
}

export function parseGuests(value) {
  const number = Number.parseInt(String(value).replace(/\D/g, ""), 10);
  if (Number.isNaN(number)) return null;
  return number;
}

export function isValidGuestCount(value, min = 1, max = 30) {
  const number = parseGuests(value);
  return number !== null && number >= min && number <= max;
}

export function isValidDateInput(value) {
  const text = cleanText(value);
  if (!text) return false;

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    const date = new Date(`${text}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return !Number.isNaN(date.getTime()) && date >= today;
  }

  const months =
    "jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december";

  const writtenDate = new RegExp(
    `(\\b\\d{1,2}\\b.*\\b(${months})\\b)|(\\b(${months})\\b.*\\b\\d{1,2}\\b)`,
    "i"
  );

  const weekdays =
    /\b(mon|monday|tue|tuesday|wed|wednesday|thu|thursday|fri|friday|sat|saturday|sun|sunday)\b/i;

  return writtenDate.test(text) || (weekdays.test(text) && text.length >= 6);
}

export function isValidTimeInput(value) {
  const text = cleanText(value).toLowerCase();
  const twelveHour = /^([1-9]|1[0-2])(:[0-5][0-9])?\s?(am|pm)$/;
  const twentyFourHour = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return twelveHour.test(text) || twentyFourHour.test(text);
}

export function containsNo(value) {
  return /^(no|no thanks|none|nothing|not now|cancel|stop)$/i.test(cleanText(value));
}

export function containsBackIntent(value) {
  return /\b(go back|back|change|edit|different|wrong|update)\b/i.test(cleanText(value));
}

export function containsRestartIntent(value) {
  return /\b(restart|start over|reset|begin again)\b/i.test(cleanText(value));
}

export function sanitizeBooking(booking) {
  return {
    name: cleanText(booking.name),
    contact: cleanText(booking.contact),
    guests: cleanText(booking.guests),
    date: cleanText(booking.date),
    time: cleanText(booking.time),
    notes: cleanText(booking.notes || "No special requests")
  };
}

export function validateBooking(booking) {
  const errors = {};

  if (!isValidName(booking.name)) errors.name = "Invalid name.";
  if (!isValidContact(booking.contact)) errors.contact = "Invalid contact.";
  if (!isValidGuestCount(booking.guests)) errors.guests = "Invalid guest count.";
  if (!isValidDateInput(booking.date)) errors.date = "Invalid date.";
  if (!isValidTimeInput(booking.time)) errors.time = "Invalid time.";

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}
