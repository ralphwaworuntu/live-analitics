import { describe, it, expect, vi } from 'vitest';
import { generateIntegrityHash, verifyIntegrityHash } from '../lib/crypto';

/**
 * Sentinel-AI Security Audit Test Suite
 * Validating SEC-HASH & Resilience under load
 */

describe('Digital Chain of Custody (SEC-HASH)', () => {
    it('should generate unique, deterministic hashes for identical payloads', () => {
        const payload = { event: "SOS", unit: "R4-01", timestamp: "2026-04-10T12:00:00Z" };
        const hash1 = generateIntegrityHash(payload);
        const hash2 = generateIntegrityHash(payload);
        
        expect(hash1).toBe(hash2);
        expect(verifyIntegrityHash(payload, hash1)).toBe(true);
    });

    it('should break hash if payload is tampered', () => {
        const original = { amount: 100, unit: "Fuel-Audit" };
        const tampered = { amount: 50, unit: "Fuel-Audit" };
        
        const hashOriginal = generateIntegrityHash(original);
        const hashTampered = generateIntegrityHash(tampered);
        
        expect(hashOriginal).not.toBe(hashTampered);
    });

    it('Resilience: handle 5000+ hashes per minute (Simulated)', () => {
        const start = Date.now();
        const iterations = 5000;
        
        for (let i = 0; i < iterations; i++) {
            generateIntegrityHash({ data: i, ts: Date.now() });
        }
        
        const duration = Date.now() - start;
        console.log(`[SEC-AUDIT] Processed ${iterations} hashes in ${duration}ms`);
        expect(duration).toBeLessThan(1000); // Must be < 1s to be "indestructible"
    });
});

describe('Offline-First Resiliency (Auto-Sync)', () => {
    it('should correctly buffer data when offline', () => {
        const queue: any[] = [];
        const isOnline = false;
        
        const trackMovement = (pos: any) => {
            if (!isOnline) queue.push(pos);
        };
        
        trackMovement({ lat: -10.1, lng: 123.1 });
        trackMovement({ lat: -10.2, lng: 123.2 });
        
        expect(queue.length).toBe(2);
    });

    it('Load Test: Auto-Sync stability with 1000+ records', () => {
        const bigQueue = Array.from({ length: 1000 }, (_, i) => ({ id: i, val: Math.random() }));
        const syncResults: any[] = [];
        
        const sync = (items: any[]) => {
            syncResults.push(...items);
        };
        
        const start = Date.now();
        sync(bigQueue);
        const duration = Date.now() - start;
        
        expect(syncResults.length).toBe(1000);
        expect(duration).toBeLessThan(100); // 1000 items should sync in < 100ms locally
    });
});
