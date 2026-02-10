/**
 * Date helper functions for goal deadlines and date formatting.
 */

/** Format a Date object to DD/MM/YYYY string */
export const formatDateToDDMMYYYY = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/** Parse a DD/MM/YYYY string to a Date object, or null if invalid */
export const parseDDMMYYYY = (dateStr: string): Date | null => {
  const parts = dateStr.split('/');
  if (parts.length !== 3) return null;
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);
  const date = new Date(year, month, day);
  if (isNaN(date.getTime())) return null;
  return date;
};

/** Validate that a string is in DD/MM/YYYY format and represents a valid date */
export const isValidDateFormat = (dateStr: string): boolean => {
  const regex = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!regex.test(dateStr)) return false;
  const parsed = parseDDMMYYYY(dateStr);
  return parsed !== null;
};

/** Get a default deadline string N days from now */
export const getDefaultDeadline = (daysFromNow: number = 30): string => {
  const date = new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000);
  return formatDateToDDMMYYYY(date);
};
