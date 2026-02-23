-- ============================================
-- Multi-Tenancy SQL for CRM Application
-- Run this SQL to set up organization support
-- ============================================

-- Create organizations table
CREATE TABLE IF NOT EXISTS organizations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NULL,
    phone VARCHAR(50) NULL,
    address TEXT NULL,
    city VARCHAR(100) NULL,
    state VARCHAR(100) NULL,
    country VARCHAR(100) NULL,
    zip_code VARCHAR(20) NULL,
    logo VARCHAR(255) NULL,
    website VARCHAR(255) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

-- Add organization_id, role, avatar, phone to users table
ALTER TABLE users 
ADD COLUMN organization_id BIGINT UNSIGNED NULL,
ADD COLUMN role ENUM('admin', 'user', 'manager') DEFAULT 'user',
ADD COLUMN avatar VARCHAR(255) NULL,
ADD COLUMN phone VARCHAR(50) NULL;

ALTER TABLE users 
ADD CONSTRAINT fk_users_organization 
FOREIGN KEY (organization_id) 
REFERENCES organizations(id) 
ON DELETE CASCADE;

-- Add organization_id to contacts table
ALTER TABLE contacts 
ADD COLUMN organization_id BIGINT UNSIGNED NULL;

ALTER TABLE contacts 
ADD CONSTRAINT fk_contacts_organization 
FOREIGN KEY (organization_id) 
REFERENCES organizations(id) 
ON DELETE CASCADE;

-- Add organization_id to companies table
ALTER TABLE companies 
ADD COLUMN organization_id BIGINT UNSIGNED NULL;

ALTER TABLE companies 
ADD CONSTRAINT fk_companies_organization 
FOREIGN KEY (organization_id) 
REFERENCES organizations(id) 
ON DELETE CASCADE;

-- Add organization_id to activities table
ALTER TABLE activities 
ADD COLUMN organization_id BIGINT UNSIGNED NULL;

ALTER TABLE activities 
ADD CONSTRAINT fk_activities_organization 
FOREIGN KEY (organization_id) 
REFERENCES organizations(id) 
ON DELETE CASCADE;

-- Add organization_id to calls table
ALTER TABLE calls 
ADD COLUMN organization_id BIGINT UNSIGNED NULL;

ALTER TABLE calls 
ADD CONSTRAINT fk_calls_organization 
FOREIGN KEY (organization_id) 
REFERENCES organizations(id) 
ON DELETE CASCADE;

-- Add organization_id to campaigns table
ALTER TABLE campaigns 
ADD COLUMN organization_id BIGINT UNSIGNED NULL;

ALTER TABLE campaigns 
ADD CONSTRAINT fk_campaigns_organization 
FOREIGN KEY (organization_id) 
REFERENCES organizations(id) 
ON DELETE CASCADE;

-- Add organization_id to contracts table
ALTER TABLE contracts 
ADD COLUMN organization_id BIGINT UNSIGNED NULL;

ALTER TABLE contracts 
ADD CONSTRAINT fk_contracts_organization 
FOREIGN KEY (organization_id) 
REFERENCES organizations(id) 
ON DELETE CASCADE;

-- Add organization_id to email_histories table
ALTER TABLE email_histories 
ADD COLUMN organization_id BIGINT UNSIGNED NULL;

ALTER TABLE email_histories 
ADD CONSTRAINT fk_email_histories_organization 
FOREIGN KEY (organization_id) 
REFERENCES organizations(id) 
ON DELETE CASCADE;

-- Add organization_id to email_templates table
ALTER TABLE email_templates 
ADD COLUMN organization_id BIGINT UNSIGNED NULL;

ALTER TABLE email_templates 
ADD CONSTRAINT fk_email_templates_organization 
FOREIGN KEY (organization_id) 
REFERENCES organizations(id) 
ON DELETE CASCADE;

-- Add organization_id to products table
ALTER TABLE products 
ADD COLUMN organization_id BIGINT UNSIGNED NULL;

ALTER TABLE products 
ADD CONSTRAINT fk_products_organization 
FOREIGN KEY (organization_id) 
REFERENCES organizations(id) 
ON DELETE CASCADE;

-- Add organization_id to purchase_orders table
ALTER TABLE purchase_orders 
ADD COLUMN organization_id BIGINT UNSIGNED NULL;

ALTER TABLE purchase_orders 
ADD CONSTRAINT fk_purchase_orders_organization 
FOREIGN KEY (organization_id) 
REFERENCES organizations(id) 
ON DELETE CASCADE;

-- Add organization_id to sales_orders table
ALTER TABLE sales_orders 
ADD COLUMN organization_id BIGINT UNSIGNED NULL;

ALTER TABLE sales_orders 
ADD CONSTRAINT fk_sales_orders_organization 
FOREIGN KEY (organization_id) 
REFERENCES organizations(id) 
ON DELETE CASCADE;

-- Add organization_id to segments table
ALTER TABLE segments 
ADD COLUMN organization_id BIGINT UNSIGNED NULL;

ALTER TABLE segments 
ADD CONSTRAINT fk_segments_organization 
FOREIGN KEY (organization_id) 
REFERENCES organizations(id) 
ON DELETE CASCADE;

-- Add organization_id to social_posts table
ALTER TABLE social_posts 
ADD COLUMN organization_id BIGINT UNSIGNED NULL;

ALTER TABLE social_posts 
ADD CONSTRAINT fk_social_posts_organization 
FOREIGN KEY (organization_id) 
REFERENCES organizations(id) 
ON DELETE CASCADE;

-- Add organization_id to sqrs table
ALTER TABLE sqrs 
ADD COLUMN organization_id BIGINT UNSIGNED NULL;

ALTER TABLE sqrs 
ADD CONSTRAINT fk_sqrs_organization 
FOREIGN KEY (organization_id) 
REFERENCES organizations(id) 
ON DELETE CASCADE;

-- Add organization_id to tags table
ALTER TABLE tags 
ADD COLUMN organization_id BIGINT UNSIGNED NULL;

ALTER TABLE tags 
ADD CONSTRAINT fk_tags_organization 
FOREIGN KEY (organization_id) 
REFERENCES organizations(id) 
ON DELETE CASCADE;

-- Add organization_id to workflows table
    ALTER TABLE workflows 
    ADD COLUMN organization_id BIGINT UNSIGNED NULL;

    ALTER TABLE workflows 
    ADD CONSTRAINT fk_workflows_organization 
    FOREIGN KEY (organization_id) 
    REFERENCES organizations(id) 
    ON DELETE CASCADE;

-- Add organization_id to document_templates table
ALTER TABLE document_templates 
ADD COLUMN organization_id BIGINT UNSIGNED NULL;

ALTER TABLE document_templates 
ADD CONSTRAINT fk_document_templates_organization 
FOREIGN KEY (organization_id) 
REFERENCES organizations(id) 
ON DELETE CASCADE;

-- Add indexes for better query performance
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_contacts_organization ON contacts(organization_id);
CREATE INDEX idx_companies_organization ON companies(organization_id);
CREATE INDEX idx_activities_organization ON activities(organization_id);
CREATE INDEX idx_calls_organization ON calls(organization_id);
CREATE INDEX idx_campaigns_organization ON campaigns(organization_id);
CREATE INDEX idx_contracts_organization ON contracts(organization_id);
CREATE INDEX idx_email_histories_organization ON email_histories(organization_id);
CREATE INDEX idx_email_templates_organization ON email_templates(organization_id);
CREATE INDEX idx_products_organization ON products(organization_id);
CREATE INDEX idx_purchase_orders_organization ON purchase_orders(organization_id);
CREATE INDEX idx_sales_orders_organization ON sales_orders(organization_id);
CREATE INDEX idx_segments_organization ON segments(organization_id);
CREATE INDEX idx_social_posts_organization ON social_posts(organization_id);
CREATE INDEX idx_sqrs_organization ON sqrs(organization_id);
CREATE INDEX idx_tags_organization ON tags(organization_id);
CREATE INDEX idx_workflows_organization ON workflows(organization_id);
CREATE INDEX idx_document_templates_organization ON document_templates(organization_id);
