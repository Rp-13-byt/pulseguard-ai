-- ==============================================================================
-- PulseGuard AI — Realistic Customer Seed Data (100+ Customers)
-- Segments: HEALTHY (60%), WATCH (20%), AT_RISK (15%), CRITICAL (5%)
-- Special Spotlight Account: Customer 1017 (Acme Global Enterprise)
-- ==============================================================================

-- Reset sequences
ALTER SEQUENCE customers_customer_id_seq RESTART WITH 1001;

-- 1. Insert Core Customers
INSERT INTO customers (customer_id, first_name, last_name, email, plan, country, signup_date, monthly_value, last_login_at, lifecycle_status) VALUES
-- HERO CUSTOMER 1017 (Initially healthy, prime candidate for Churn Scenario Demonstration)
(1017, 'Sarah', 'Jenkins', 'sarah.jenkins@acmeglobal.com', 'ENTERPRISE', 'US', NOW() - INTERVAL '320 days', 3450.00, NOW() - INTERVAL '1 hour', 'ACTIVE'),

-- CRITICAL ACCOUNTS (Pre-existing crisis cases)
(1001, 'Marcus', 'Vance', 'marcus.vance@techcorp.io', 'ENTERPRISE', 'US', NOW() - INTERVAL '210 days', 4200.00, NOW() - INTERVAL '18 days', 'CRITICAL'),
(1002, 'Elena', 'Rostova', 'elena.rostova@cloudscale.de', 'ENTERPRISE', 'DE', NOW() - INTERVAL '180 days', 2800.00, NOW() - INTERVAL '24 days', 'CRITICAL'),
(1003, 'David', 'Kim', 'david.kim@fintechflow.kr', 'PRO', 'KR', NOW() - INTERVAL '95 days', 850.00, NOW() - INTERVAL '31 days', 'CRITICAL'),
(1004, 'Amara', 'Okafor', 'amara.okafor@lagosdigital.ng', 'PRO', 'NG', NOW() - INTERVAL '140 days', 750.00, NOW() - INTERVAL '22 days', 'CRITICAL'),
(1005, 'Liam', 'O''Connor', 'liam.oc@dublindata.ie', 'ENTERPRISE', 'IE', NOW() - INTERVAL '400 days', 5100.00, NOW() - INTERVAL '14 days', 'CRITICAL'),

-- AT_RISK ACCOUNTS (Significant drop, fewer orders, multiple tickets)
(1006, 'Sophia', 'Chen', 'sophia.chen@apexanalytics.sg', 'PRO', 'SG', NOW() - INTERVAL '120 days', 650.00, NOW() - INTERVAL '9 days', 'AT_RISK'),
(1007, 'Mateo', 'Garcia', 'mateo.garcia@soluciones.mx', 'PRO', 'MX', NOW() - INTERVAL '85 days', 500.00, NOW() - INTERVAL '12 days', 'AT_RISK'),
(1008, 'Hanna', 'Lindqvist', 'hanna.l@nordicsoft.se', 'ENTERPRISE', 'SE', NOW() - INTERVAL '300 days', 3100.00, NOW() - INTERVAL '7 days', 'AT_RISK'),
(1009, 'Tariq', 'Al-Mansoor', 'tariq@gulfsystems.ae', 'PRO', 'AE', NOW() - INTERVAL '160 days', 920.00, NOW() - INTERVAL '11 days', 'AT_RISK'),
(1010, 'Chloe', 'Dubois', 'chloe.dubois@hexagone.fr', 'PRO', 'FR', NOW() - INTERVAL '70 days', 450.00, NOW() - INTERVAL '8 days', 'AT_RISK'),
(1011, 'Kenji', 'Sato', 'kenji.sato@tokyomedia.jp', 'ENTERPRISE', 'JP', NOW() - INTERVAL '250 days', 2400.00, NOW() - INTERVAL '10 days', 'AT_RISK'),
(1012, 'Ananya', 'Sharma', 'ananya.sharma@bengalurutech.in', 'PRO', 'IN', NOW() - INTERVAL '110 days', 600.00, NOW() - INTERVAL '6 days', 'AT_RISK'),
(1013, 'Lucas', 'Silva', 'lucas.silva@paulista.br', 'PRO', 'BR', NOW() - INTERVAL '190 days', 550.00, NOW() - INTERVAL '13 days', 'AT_RISK'),
(1014, 'Zoe', 'Kramer', 'zoe.kramer@alpinesys.ch', 'ENTERPRISE', 'CH', NOW() - INTERVAL '340 days', 2900.00, NOW() - INTERVAL '5 days', 'AT_RISK'),
(1015, 'Oliver', 'Smith', 'oliver.smith@londonfin.co.uk', 'PRO', 'GB', NOW() - INTERVAL '135 days', 800.00, NOW() - INTERVAL '8 days', 'AT_RISK'),
(1016, 'Isabella', 'Rossi', 'isabella.rossi@milano.it', 'PRO', 'IT', NOW() - INTERVAL '90 days', 480.00, NOW() - INTERVAL '7 days', 'AT_RISK'),

-- WATCH ACCOUNTS (Early warning, modest decline)
(1018, 'Noah', 'Taylor', 'noah.taylor@sydneylabs.au', 'PRO', 'AU', NOW() - INTERVAL '150 days', 620.00, NOW() - INTERVAL '4 days', 'WATCH'),
(1019, 'Maya', 'Patel', 'maya.patel@mumbaicloud.in', 'STARTER', 'IN', NOW() - INTERVAL '60 days', 150.00, NOW() - INTERVAL '3 days', 'WATCH'),
(1020, 'Lars', 'Nielsen', 'lars.nielsen@cphdata.dk', 'PRO', 'DK', NOW() - INTERVAL '200 days', 700.00, NOW() - INTERVAL '5 days', 'WATCH');

-- Generate 80 additional HEALTHY & ACTIVE customers (IDs 1021 to 1100)
INSERT INTO customers (customer_id, first_name, last_name, email, plan, country, signup_date, monthly_value, last_login_at, lifecycle_status)
SELECT 
    i,
    (ARRAY['Alex', 'Jordan', 'Taylor', 'Morgan', 'Casey', 'Riley', 'Avery', 'Dakota', 'Cameron', 'Reese'])[1 + (i % 10)],
    (ARRAY['Miller', 'Wilson', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Young'])[1 + ((i * 3) % 10)],
    'user.' || i || '@enterprise-client-' || (i % 25) || '.com',
    (ARRAY['STARTER', 'PRO', 'PRO', 'ENTERPRISE'])[1 + (i % 4)],
    (ARRAY['US', 'GB', 'DE', 'IN', 'CA', 'AU', 'FR', 'NL'])[1 + (i % 8)],
    NOW() - (i || ' days')::INTERVAL,
    CASE (i % 4)
        WHEN 0 THEN 2200.00
        WHEN 1 THEN 120.00
        WHEN 2 THEN 550.00
        ELSE 850.00
    END,
    NOW() - ((i % 3) || ' hours')::INTERVAL,
    'ACTIVE'
FROM generate_series(1021, 1105) AS i;

-- 2. Subscriptions for all customers
INSERT INTO subscriptions (customer_id, plan, start_date, renewal_date, monthly_value, status)
SELECT 
    c.customer_id,
    c.plan,
    (c.signup_date)::date,
    CASE 
        WHEN c.customer_id = 1017 THEN (CURRENT_DATE + INTERVAL '8 days')::date -- Hero customer renewal imminent!
        WHEN c.customer_id IN (1001, 1002, 1005) THEN (CURRENT_DATE + INTERVAL '5 days')::date
        WHEN c.customer_id IN (1006, 1008, 1011) THEN (CURRENT_DATE + INTERVAL '12 days')::date
        ELSE (CURRENT_DATE + ((15 + (c.customer_id % 90)) || ' days')::INTERVAL)::date
    END,
    c.monthly_value,
    'ACTIVE'
FROM customers c;

-- 3. Realistic Recent Orders
-- Healthy customer 1017 had orders recently
INSERT INTO orders (customer_id, order_time, amount, product_category, status) VALUES
(1017, NOW() - INTERVAL '3 days', 1200.00, 'ANNUAL_TIER_SEAT_PACK', 'COMPLETED'),
(1017, NOW() - INTERVAL '25 days', 450.00, 'API_OVERAGE_ADDON', 'COMPLETED'),
(1017, NOW() - INTERVAL '60 days', 3450.00, 'ENTERPRISE_BASE_PLAN', 'COMPLETED');

-- Critical customers have not ordered in 30-60 days
INSERT INTO orders (customer_id, order_time, amount, product_category, status) VALUES
(1001, NOW() - INTERVAL '42 days', 4200.00, 'ENTERPRISE_BASE_PLAN', 'COMPLETED'),
(1002, NOW() - INTERVAL '38 days', 2800.00, 'ENTERPRISE_BASE_PLAN', 'COMPLETED'),
(1003, NOW() - INTERVAL '55 days', 850.00, 'PRO_PLAN', 'COMPLETED'),
(1004, NOW() - INTERVAL '36 days', 750.00, 'PRO_PLAN', 'COMPLETED');

-- Active accounts have orders within the last 7 days
INSERT INTO orders (customer_id, order_time, amount, product_category, status)
SELECT 
    c.customer_id,
    NOW() - ((c.customer_id % 12) || ' days')::INTERVAL,
    (c.monthly_value * 0.4)::numeric(12,2),
    'FEATURE_PACK',
    'COMPLETED'
FROM customers c
WHERE c.customer_id > 1020 AND (c.customer_id % 2 = 0);

-- 4. Realistic Product Events Telemetry
-- Customer 1017 baseline usage (steady, regular sessions)
INSERT INTO product_events (event_id, customer_id, event_time, event_type, feature, session_minutes, success) VALUES
(gen_random_uuid(), 1017, NOW() - INTERVAL '4 hours', 'FEATURE_USE', 'DASHBOARD_ANALYTICS', 45.0, true),
(gen_random_uuid(), 1017, NOW() - INTERVAL '1 day', 'FEATURE_USE', 'API_INTEGRATION', 30.0, true),
(gen_random_uuid(), 1017, NOW() - INTERVAL '2 days', 'EXPORT_DATA', 'REPORT_BUILDER', 20.0, true),
(gen_random_uuid(), 1017, NOW() - INTERVAL '3 days', 'LOGIN', 'SSO_AUTH', 5.0, true);

-- Inactive product events for critical accounts
INSERT INTO product_events (event_id, customer_id, event_time, event_type, feature, session_minutes, success) VALUES
(gen_random_uuid(), 1001, NOW() - INTERVAL '18 days', 'LOGIN', 'WEB_APP', 2.0, true),
(gen_random_uuid(), 1002, NOW() - INTERVAL '24 days', 'LOGIN', 'WEB_APP', 1.5, false);

-- Steady product events for active accounts
INSERT INTO product_events (event_id, customer_id, event_time, event_type, feature, session_minutes, success)
SELECT 
    gen_random_uuid(),
    c.customer_id,
    NOW() - ((c.customer_id % 24) || ' hours')::INTERVAL,
    'FEATURE_USE',
    (ARRAY['DASHBOARD', 'API_INTEGRATION', 'DATA_EXPORT', 'REPORT_BUILDER'])[1 + (c.customer_id % 4)],
    (15 + (c.customer_id % 45))::numeric(10,2),
    true
FROM customers c
WHERE c.customer_id > 1020;
