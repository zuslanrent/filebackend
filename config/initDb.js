const { pool } = require('./db')

async function initDb() {
  // Enable UUID generation extension
  await pool.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto";')

  // Create automatic timestamp update function if it doesn't exist
  await pool.query(`
    CREATE OR REPLACE FUNCTION update_modified_column()
    RETURNS TRIGGER AS $$
    BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
    END;
    $$ language 'plpgsql';
  `)

  // 1. Users
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      uuid        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username    VARCHAR(50) UNIQUE NOT NULL,
      password    VARCHAR(255) NOT NULL,
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `)

  // Attach update trigger to users
  await pool.query(`
    DROP TRIGGER IF EXISTS update_users_modtime ON users;
    CREATE TRIGGER update_users_modtime 
    BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
  `)

  // 2. Groups
  await pool.query(`
    CREATE TABLE IF NOT EXISTS groups (
      uuid        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      group_name  VARCHAR(255) NOT NULL,
      description TEXT,
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `)

  // 3. Departments
  await pool.query(`
    CREATE TABLE IF NOT EXISTS departments (
      uuid        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name        VARCHAR(255) NOT NULL,
      description TEXT,
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `)

  // 4. Regulations (Linked loosely to departments/groups if needed, or structured)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS regulations (
      uuid          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      file_name     VARCHAR(255) NOT NULL,
      group_name    VARCHAR(255),
      division_name VARCHAR(255),
      approved_date DATE,
      decline_date  DATE,
      status        VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
      file_size     BIGINT,
      created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `)

  // 5. Audit Logs (Now correctly typed using UUIDs with fallback protection)
  await pool.query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      uuid            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      file_id         UUID REFERENCES regulations(uuid) ON DELETE SET NULL,
      file_name       VARCHAR(255),
      user_id         UUID REFERENCES users(uuid) ON DELETE SET NULL,
      user_name       VARCHAR(255),
      user_department VARCHAR(255),
      action          VARCHAR(50),
      details         TEXT,
      created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `)

  // 6. IT Categories
  await pool.query(`
    CREATE TABLE IF NOT EXISTS it_categories (
      uuid        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name        VARCHAR(255) NOT NULL,
      description TEXT,
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `)

  // 7. IT Subcategories
  await pool.query(`
    CREATE TABLE IF NOT EXISTS it_subcategories (
      uuid          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      category_uuid UUID NOT NULL REFERENCES it_categories(uuid) ON DELETE CASCADE,
      name          VARCHAR(255) NOT NULL,
      created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `)

  // 8. IT Errors
  await pool.query(`
    CREATE TABLE IF NOT EXISTS it_errors (
      uuid             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      keyword          VARCHAR(255) NOT NULL,
      description      TEXT NOT NULL,
      solution         TEXT,
      category_uuid    UUID REFERENCES it_categories(uuid) ON DELETE SET NULL,
      subcategory_uuid UUID REFERENCES it_subcategories(uuid) ON DELETE SET NULL,
      department_uuid  UUID REFERENCES departments(uuid) ON DELETE SET NULL, -- Changed to match relational architecture
      status           VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
      images           TEXT[] DEFAULT '{}',
      created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `)

  // Attach update trigger to it_errors
  await pool.query(`
    DROP TRIGGER IF EXISTS update_it_errors_modtime ON it_errors;
    CREATE TRIGGER update_it_errors_modtime 
    BEFORE UPDATE ON it_errors 
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
  `)

  console.log('✅ All tables and relational triggers initialized successfully.')
}

module.exports = { initDb }