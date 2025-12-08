/**
 * Cache utility for managing localStorage cache with timestamps
 * Implements 12-hour cache duration for API call optimization
 */

// Cache duration: 12 hours in milliseconds
const CACHE_DURATION = 12 * 60 * 60 * 1000;

/**
 * Get cached data if it exists and is still valid
 * @param {string} key - Cache key
 * @returns {any|null} - Cached data or null if not found/expired
 */
export function getCachedData(key) {
    try {
        const cached = localStorage.getItem(key);
        if (!cached) return null;

        const { data, timestamp } = JSON.parse(cached);

        if (!isCacheValid(timestamp)) {
            // Cache expired, remove it
            localStorage.removeItem(key);
            return null;
        }

        return data;
    } catch (err) {
        console.error(`Error reading cache for key "${key}":`, err);
        return null;
    }
}

/**
 * Store data in cache with current timestamp
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 */
export function setCachedData(key, data) {
    try {
        const cacheEntry = {
            data,
            timestamp: Date.now()
        };
        localStorage.setItem(key, JSON.stringify(cacheEntry));
    } catch (err) {
        console.error(`Error writing cache for key "${key}":`, err);
    }
}

/**
 * Check if a timestamp is still within the valid cache duration
 * @param {number} timestamp - Timestamp to check
 * @returns {boolean} - True if cache is still valid
 */
export function isCacheValid(timestamp) {
    if (!timestamp) return false;
    const now = Date.now();
    const age = now - timestamp;
    return age < CACHE_DURATION;
}

/**
 * Clear a specific cache entry
 * @param {string} key - Cache key to clear
 */
export function clearCache(key) {
    try {
        localStorage.removeItem(key);
    } catch (err) {
        console.error(`Error clearing cache for key "${key}":`, err);
    }
}

/**
 * Get cache age in hours
 * @param {string} key - Cache key
 * @returns {number|null} - Age in hours or null if not found
 */
export function getCacheAge(key) {
    try {
        const cached = localStorage.getItem(key);
        if (!cached) return null;

        const { timestamp } = JSON.parse(cached);
        const now = Date.now();
        const ageMs = now - timestamp;
        return ageMs / (60 * 60 * 1000); // Convert to hours
    } catch (err) {
        return null;
    }
}
