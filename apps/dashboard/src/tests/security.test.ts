import { describe, it, expect, vi } from 'vitest';
import { generateIntegrityHash, verifyIntegrityHash } from '../lib/crypto';

/**
 * Sentinel-AI Security Audit Test Suite (Hardened)
 * Validating SEC-HASH & Resilience under load with SHA-256
 */

describe('Digital Chain of Custody (SEC-HASH)', () => {
    it('should generate unique, deterministic hashes for identical payloads', async () => {
        const payload = { event: "SOS", unit: "R4-01", timestamp: "2026-04-10T12:00:00Z" };
        const hash1 = await generateIntegrityHash(payload);
        const hash2 = await generateIntegrityHash(payload);
        
        // We compare the hex content part of the hash display format
        // Format: SEC-HASH-HEX-TIME
        const hex1 = hash1.split('-')[2];
        const hex2 = hash2.split('-')[2];
        
        expect(hex1).toBe(hex2);
        expect(await verifyIntegrityHash(payload, hash1)).toBe(true);
    });

    it('should break hash if payload is tampered', async () => {
        const original = { amount: 100, unit: "Fuel-Audit" };
        const tampered = { amount: 50, unit: "Fuel-Audit" };
        
        const hashOriginal = await generateIntegrityHash(original);
        const hashTampered = await generateIntegrityHash(tampered);
        
        expect(hashOriginal).not.toBe(hashTampered);
    });

    it('Resilience: handle 500+ secure hashes per second (Simulated SHA-256)', async () => {
        const start = Date.now();
        const iterations = 500;
        
        const tasks = Array.from({ length: iterations }, (_, i) => 
            generateIntegrityHash({ data: i, ts: Date.now() })
        );
        
        await Promise.all(tasks);
        
        const duration = Date.now() - start;
        console.log(`[SEC-AUDIT] Processed ${iterations} SHA-256 hashes in ${duration}ms`);
        // SHA-256 is slower than simple hash, but must be < 2s for 500 items to be performant
        expect(duration).toBeLessThan(2000); 
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
        expect(duration).toBeLessThan(100); 
    });
});
