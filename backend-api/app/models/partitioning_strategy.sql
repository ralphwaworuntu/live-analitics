-- Task 2: Database Partitioning Strategy (PostgreSQL 12+)
-- Goal: Sub-100ms queries on 100M+ rows

-- 1. Create the parent table
CREATE TABLE telemetry_logs (
    id UUID DEFAULT gen_random_uuid(),
    unit_id VARCHAR(50) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    current_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- 2. Indexing for Query Performance
-- We index unit_id and created_at on the parent to ensure partition pruning
CREATE INDEX idx_telemetry_unit_time ON telemetry_logs (unit_id, created_at DESC);

-- 3. Partition by Day (Example for April 12, 2026)
CREATE TABLE telemetry_logs_y2026_m04_d12 PARTITION OF telemetry_logs
    FOR VALUES FROM ('2026-04-12 00:00:00') TO ('2026-04-13 00:00:00');

-- 4. Maintenance Script Logic (CRON)
-- "Every midnight, create the partition for tomorrow and archive partitions older than 90 days."
-- ARCHIVE: ALTER TABLE telemetry_logs DETACH PARTITION telemetry_logs_old_date;
