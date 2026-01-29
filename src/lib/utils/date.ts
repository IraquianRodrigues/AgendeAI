/**
 * Date utility functions to handle timezone-safe date operations
 */

/**
 * Returns a date string in YYYY-MM-DD format using local timezone
 * This avoids timezone conversion issues with toISOString()
 * 
 * @param date - Date object to convert (defaults to current date)
 * @returns Date string in YYYY-MM-DD format
 * 
 * @example
 * // Brazil (UTC-3): 29/01/2026 00:30
 * getLocalDateString() // "2026-01-29" ✅
 * 
 * // vs toISOString() which would return:
 * new Date().toISOString().split("T")[0] // "2026-01-28" ❌
 */
export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats a date string to Brazilian format (DD/MM/YYYY)
 * 
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date string in DD/MM/YYYY format
 */
export function formatDateBR(dateString: string): string {
  const [year, month, day] = dateString.split('-');
  return `${day}/${month}/${year}`;
}

/**
 * Parses a Brazilian date string (DD/MM/YYYY) to YYYY-MM-DD format
 * 
 * @param dateStringBR - Date string in DD/MM/YYYY format
 * @returns Date string in YYYY-MM-DD format
 */
export function parseDateBR(dateStringBR: string): string {
  const [day, month, year] = dateStringBR.split('/');
  return `${year}-${month}-${day}`;
}
