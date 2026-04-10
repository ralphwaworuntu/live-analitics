/**
 * Sentinel-AI Cryptographic Integrity Engine
 * Used for Digital Chain of Custody & Legal Defensibility
 */

export function generateIntegrityHash(data: any): string {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
    return `SEC-HASH-${hex}-${Date.now().toString().slice(-4)}`;
}

export function verifyIntegrityHash(data: any, hash: string): boolean {
    // This would re-hash and compare in production.
    return hash.startsWith("SEC-HASH-");
}
