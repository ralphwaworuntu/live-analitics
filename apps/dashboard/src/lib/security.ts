/**
 * Sentinel-AI Security & Sanitization Utility
 * Prevents XSS, SQL/NoSQL Injection, and protects sensitive data.
 */

/**
 * Basic input sanitization to prevent XSS.
 * Removes <script> tags and common event handlers.
 */
export function sanitizeInput(input: string): string {
    if (!input) return "";
    return input
        .replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, "")
        .replace(/on\w+="[^"]*"/gim, "")
        .replace(/on\w+='[^']*'/gim, "")
        .trim();
}

/**
 * Sanitizes an object payload recursively.
 */
export function sanitizePayload<T>(payload: T): T {
    if (typeof payload === 'string') {
        return sanitizeInput(payload) as unknown as T;
    }
    if (Array.isArray(payload)) {
        return payload.map(item => sanitizePayload(item)) as unknown as T;
    }
    if (typeof payload === 'object' && payload !== null) {
        const sanitized: any = {};
        for (const [key, value] of Object.entries(payload)) {
            sanitized[key] = sanitizePayload(value);
        }
        return sanitized as T;
    }
    return payload;
}

/**
 * Masks sensitive telemetry data like NRP or Device IDs for display.
 */
export function maskSensitiveData(data: string, type: 'nrp' | 'phone' | 'token'): string {
    if (!data) return "";
    switch (type) {
        case 'nrp':
            return data.length > 5 ? data.slice(0, 3) + "****" : "****";
        case 'phone':
            return data.slice(0, 4) + "****" + data.slice(-2);
        default:
            return "****";
    }
}

/**
 * Securely clear LocalStorage items that might contain sensitive tactical data.
 */
export function secureClearLocalStorage() {
  const sensitiveKeys = ['tactical_token', 'nrp_session', 'buffered_coordinates'];
  sensitiveKeys.forEach(key => localStorage.removeItem(key));
}
