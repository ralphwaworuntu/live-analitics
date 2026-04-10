/**
 * Sentinel-AI Cryptographic Integrity Engine (Hardened)
 * Used for Digital Chain of Custody & Legal Defensibility.
 * Uses SHA-256 via Web Crypto API with HMAC-like salting.
 */

// Tactical System Salt (In production, load from process.env.TACTICAL_SALT)
const SYSTEM_SALT = "POLDA-NTT-BIRO-OPS-SECURE-2026";

/**
 * Generates a SHA-256 hash of the payload to ensure immutability.
 * This is non-blocking and forensic-grade.
 */
export async function generateIntegrityHash(data: any): Promise<string> {
    const encoder = new TextEncoder();
    const payload = JSON.stringify(data) + SYSTEM_SALT;
    const dataBuffer = encoder.encode(payload);
    
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    
    return `SEC-HASH-${hashHex.slice(0, 16)}-${Date.now().toString(16).toUpperCase()}`;
}

/**
 * Validates if the provided hash matches the recalulated hash of the data.
 */
export async function verifyIntegrityHash(data: any, hash: string): Promise<boolean> {
    if (!hash || !hash.startsWith("SEC-HASH-")) return false;
    
    // We compare with the 16-char slice used in the display format
    const expectedFull = await generateIntegrityHash(data);
    const expectedPrefix = expectedFull.split('-')[2]; // Extracting the hex part
    const actualPrefix = hash.split('-')[2];
    
    return expectedPrefix === actualPrefix;
}
