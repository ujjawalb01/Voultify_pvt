import CryptoJS from 'crypto-js';

/**
 * Encrypts a File object using AES-256.
 * @param {File} file - The file to encrypt.
 * @param {string} key - The encryption key string.
 * @returns {Promise<Blob>} A promise that resolves to the encrypted Blob.
 */
export const encryptFile = (file, key) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                // Convert ArrayBuffer to WordArray for CryptoJS
                const wordArray = CryptoJS.lib.WordArray.create(e.target.result);
                
                // Encrypt the WordArray (this results in a CipherParams object, not a string if we don't call toString)
                // However, CryptoJS.AES.encrypt returns a CipherParams stringified by default as Base64 if we toString() it.
                // Let's get the raw ciphertext WordArray from the CipherParams object.
                const encrypted = CryptoJS.AES.encrypt(wordArray, key);
                
                // Convert the raw ciphertext WordArray into a Uint8Array
                // Note: We need to store IV and Salt for robust AES, but right now it's using the password-based derivation.
                // The toString() method actually bundles the Salt + Ciphertext into an OpenSSL format string.
                // It's safest to convert that whole OpenSSL string into binary bytes, rather than plain text,
                // to ensure the file system treats it as fully opaque binary data.
                
                const encryptedString = encrypted.toString(); // Base64 OpenSSL format
                
                // Convert Base64 string to raw binary Uint8Array
                const binaryString = atob(encryptedString);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                
                // Create Blob from the binary bytes
                const encryptedBlob = new Blob([bytes], { type: 'application/octet-stream' });
                resolve(encryptedBlob);
            } catch(error) {
                reject(error);
            }
        };

        reader.onerror = (error) => reject(error);
        
        // Read file as ArrayBuffer
        reader.readAsArrayBuffer(file);
    });
};

/**
 * Decrypts an encrypted Blob back into the original File Blob.
 * @param {Blob} encryptedBlob - The encrypted Blob downloaded from the server.
 * @param {string} key - The encryption key string.
 * @param {string} originalMimeType - The mimetype of the original file (e.g., 'image/jpeg').
 * @returns {Promise<Blob>} A promise that resolves to the decrypted Blob.
 */
export const decryptFile = (encryptedBlob, key, originalMimeType) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = (e) => {
            try {
                // We expect an ArrayBuffer from the server
                const arrayBuffer = e.target.result;
                const bytes = new Uint8Array(arrayBuffer);
                
                // Reconstruct the Base64 OpenSSL string
                let binaryString = '';
                // Chunk the conversion to avoid Maximum call stack size exceeded for large files
                const chunkSize = 8192;
                for (let i = 0; i < bytes.length; i += chunkSize) {
                    binaryString += String.fromCharCode.apply(null, bytes.subarray(i, i + chunkSize));
                }
                const encryptedString = btoa(binaryString);
                
                // Decrypt into a WordArray
                const decryptedWordArray = CryptoJS.AES.decrypt(encryptedString, key);
                
                // Verify decryption success (CryptoJS might return an empty array if key is wrong)
                if (decryptedWordArray.sigBytes < 0) {
                     return reject(new Error("Decryption failed. Incorrect key or corrupt data."));
                }
                
                // Convert WordArray back to Uint8Array/ArrayBuffer
                const decryptedArrayBuffer = wordArrayToUint8Array(decryptedWordArray).buffer;
                
                // Create the final decrypted Blob
                const decryptedBlob = new Blob([decryptedArrayBuffer], { type: originalMimeType });
                resolve(decryptedBlob);
            } catch(error) {
                reject(error);
            }
        };

        reader.onerror = (error) => reject(error);
        
        // Read the encrypted blob as raw ArrayBuffer (since we saved it as binary)
        reader.readAsArrayBuffer(encryptedBlob);
    });
};

// Helper function to convert CryptoJS WordArray to Uint8Array so it can be made into a Blob
function wordArrayToUint8Array(wordArray) {
    const l = wordArray.sigBytes;
    const words = wordArray.words;
    const result = new Uint8Array(l);
    var i = 0, j = 0;
    while(true) {
        // Here i is the byte index, j is the word index.
        if (i == l)
            break;
        var w = words[j++];
        result[i++] = (w & 0xff000000) >>> 24;
        if (i == l)
            break;
        result[i++] = (w & 0x00ff0000) >>> 16;
        if (i == l)
            break;
        result[i++] = (w & 0x0000ff00) >>> 8;
        if (i == l)
            break;
        result[i++] = (w & 0x000000ff);
    }
    return result;
}
