/**
 * Simple encryption/decryption utilities for sessionStorage
 * Uses Base64 encoding with a simple XOR cipher for basic obfuscation
 */

const SECRET_KEY = 'OptigoAI_Config_2024';

/**
 * Encrypts data using XOR cipher and Base64 encoding
 * @param {string} data - Data to encrypt
 * @returns {string} Encrypted data
 */
export const encryptData = (data) => {
    try {
        const jsonString = typeof data === 'string' ? data : JSON.stringify(data);
        let encrypted = '';
        
        for (let i = 0; i < jsonString.length; i++) {
            const charCode = jsonString.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length);
            encrypted += String.fromCharCode(charCode);
        }
        
        return btoa(encrypted);
    } catch (error) {
        console.error('Encryption error:', error);
        return null;
    }
};

/**
 * Decrypts data encrypted with encryptData
 * @param {string} encryptedData - Encrypted data
 * @returns {Object|null} Decrypted data or null if error
 */
export const decryptData = (encryptedData) => {
    try {
        const decoded = atob(encryptedData);
        let decrypted = '';
        
        for (let i = 0; i < decoded.length; i++) {
            const charCode = decoded.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length);
            decrypted += String.fromCharCode(charCode);
        }
        
        return JSON.parse(decrypted);
    } catch (error) {
        console.error('Decryption error:', error);
        return null;
    }
};

/**
 * Stores encrypted data in sessionStorage
 * @param {string} key - Storage key
 * @param {any} data - Data to store
 */
export const setEncryptedSession = (key, data) => {
    try {
        console.log(`🔐 Encrypting and storing data for key: ${key}`, data);
        const encrypted = encryptData(data);
        if (encrypted) {
            sessionStorage.setItem(key, encrypted);
            console.log(`✅ Successfully stored encrypted data for key: ${key}`);
            console.log(`📦 Encrypted value length: ${encrypted.length}`);
        } else {
            console.error(`❌ Encryption failed for key: ${key}`);
        }
    } catch (error) {
        console.error('❌ Error storing encrypted session:', error);
    }
};

/**
 * Retrieves and decrypts data from sessionStorage
 * @param {string} key - Storage key
 * @returns {any|null} Decrypted data or null if not found/error
 */
export const getEncryptedSession = (key) => {
    try {
        console.log(`🔍 Attempting to retrieve encrypted data for key: ${key}`);
        const encrypted = sessionStorage.getItem(key);
        if (!encrypted) {
            console.log(`⚠️ No data found in sessionStorage for key: ${key}`);
            return null;
        }
        console.log(`📦 Found encrypted data, length: ${encrypted.length}`);
        const decrypted = decryptData(encrypted);
        console.log(`🔓 Successfully decrypted data for key: ${key}`, decrypted);
        return decrypted;
    } catch (error) {
        console.error('❌ Error retrieving encrypted session:', error);
        return null;
    }
};

/**
 * Removes encrypted data from sessionStorage
 * @param {string} key - Storage key
 */
export const removeEncryptedSession = (key) => {
    try {
        sessionStorage.removeItem(key);
    } catch (error) {
        console.error('Error removing encrypted session:', error);
    }
};
