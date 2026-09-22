-- ==============================================================================
-- PulseGuard AI — PostgreSQL Operational Source Database Schema
-- Optimized for Debezium CDC Source V2 (PostgresCdcSourceV2)
-- ==============================================================================

-- Drop tables if existing (for fresh reset)
DROP TABLE IF EXISTS product_events CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS customers CASCADE;

-- 1. Customers Dimension Table
CREATE TABLE customers (
    customer_id BIGSERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    plan VARCHAR(50) NOT NULL DEFAULT 'PRO',
    country VARCHAR(10) DEFAULT 'US',
    signup_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    monthly_value NUMERIC(12, 2) NOT NULL DEFAULT 499.00,
    last_login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    lifecycle_status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE'
);

-- 2. Orders Table
CREATE TABLE orders (
    order_id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    order_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    amount NUMERIC(12, 2) NOT NULL,
    product_category VARCHAR(100) NOT NULL DEFAULT 'ADDON',
    status VARCHAR(50) NOT NULL DEFAULT 'COMPLETED'
);

-- 3. Product Events Telemetry Table
CREATE TABLE product_events (
    event_id UUID PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    event_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    event_type VARCHAR(100) NOT NULL,
    feature VARCHAR(100),
    session_minutes NUMERIC(10, 2) DEFAULT 15.0,
    success BOOLEAN DEFAULT TRUE,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 4. Subscriptions Table
CREATE TABLE subscriptions (
    subscription_id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT NOT NULL REFERENCES customers(customer_id) ON DELETE CASCADE,
    plan VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    renewal_date DATE NOT NULL,
    monthly_value NUMERIC(12, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'ACTIVE'
);

-- Performance & Streaming CDC Indexes
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_order_time ON orders(order_time);
CREATE INDEX idx_product_events_customer_id ON product_events(customer_id);
CREATE INDEX idx_product_events_time ON product_events(event_time);
CREATE INDEX idx_subscriptions_customer_id ON subscriptions(customer_id);
CREATE INDEX idx_subscriptions_renewal ON subscriptions(renewal_date);

-- Enable REPLICA IDENTITY FULL for complete Debezium CDC change captures
ALTER TABLE customers REPLICA IDENTITY FULL;
ALTER TABLE orders REPLICA IDENTITY FULL;
ALTER TABLE product_events REPLICA IDENTITY FULL;
ALTER TABLE subscriptions REPLICA IDENTITY FULL;

-- Create Publication for Confluent PostgreSQL CDC Source V2 (Debezium)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'retention_publication') THEN
        CREATE PUBLICATION retention_publication FOR TABLE 
            public.customers, 
            public.orders, 
            public.product_events, 
            public.subscriptions;
    END IF;
END $$;
