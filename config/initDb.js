const { pool } = require('./db')

async function initDb() {
  await pool.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto";')

  // Users
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      uuid        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username    VARCHAR(50) UNIQUE NOT NULL,
      password    VARCHAR(255) NOT NULL,
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `)

  // Groups
  await pool.query(`
    CREATE TABLE IF NOT EXISTS groups (
      uuid        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      group_name  VARCHAR(255) NOT NULL,
      description TEXT,
      created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `)

  // Departments
  await pool.query(`
    CREATE TABLE IF NOT EXISTS departments (
      uuid          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name          VARCHAR(255) NOT NULL,
      description   TEXT,
      created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `)

  // Regulations
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

  await pool.query(`
  CREATE TABLE IF NOT EXISTS audit_logs (
    uuid          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    file_id       VARCHAR(255),
    file_name     VARCHAR(255),
    user_id       VARCHAR(255),
    user_name     VARCHAR(255),
    user_department VARCHAR(255),
    action        VARCHAR(50),
    details       TEXT,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`)

// IT Support tables
await pool.query(`
  CREATE TABLE IF NOT EXISTS it_categories (
    uuid        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`)

await pool.query(`
  CREATE TABLE IF NOT EXISTS it_subcategories (
    uuid          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_uuid UUID NOT NULL REFERENCES it_categories(uuid) ON DELETE CASCADE,
    name          VARCHAR(255) NOT NULL,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`)

await pool.query(`
  CREATE TABLE IF NOT EXISTS it_errors (
    uuid             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    keyword          VARCHAR(255) NOT NULL,
    description      TEXT NOT NULL,
    solution         TEXT,
    category_uuid    UUID REFERENCES it_categories(uuid) ON DELETE SET NULL,
    subcategory_uuid UUID REFERENCES it_subcategories(uuid) ON DELETE SET NULL,
    department       VARCHAR(255),
    status           VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    images           TEXT[] DEFAULT '{}',
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`)

  console.log('✅ All tables initialized.')
}

module.exports = { initDb }
