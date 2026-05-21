// src/controllers/errorController.js
const { pool } = require('../config/db')

// Get all errors with filters
const getAllErrors = async (req, res) => {
  try {
    const { categoryId, department, status, search, subcategoryId } = req.query;
    
    let query = `
      SELECT 
        e.uuid as id,
        e.keyword,
        e.description,
        e.solution,
        e.category_uuid as "categoryId",
        e.subcategory_uuid as "subCategoryId",
        e.department,
        e.status,
        e.images,
        e.created_at as "createdAt",
        e.updated_at as "updatedAt"
      FROM it_errors e
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    if (categoryId) {
      query += ` AND e.category_uuid = $${paramIndex}`;
      params.push(categoryId);
      paramIndex++;
    }
    
    if (subcategoryId) {
      query += ` AND e.subcategory_uuid = $${paramIndex}`;
      params.push(subcategoryId);
      paramIndex++;
    }
    
    if (department && department !== 'all') {
      query += ` AND e.department = $${paramIndex}`;
      params.push(department);
      paramIndex++;
    }
    
    if (status && status !== 'all') {
      query += ` AND e.status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }
    
    if (search) {
      query += ` AND (
        e.keyword ILIKE $${paramIndex} OR 
        e.description ILIKE $${paramIndex} OR
        e.solution ILIKE $${paramIndex}
      )`;
      params.push(`%${search}%`);
      paramIndex++;
    }
    
    query += ` ORDER BY e.created_at DESC`;
    
    const result = await pool.query(query, params);
    sendSuccess(res, result.rows);
  } catch (error) {
    sendError(res, error, 'Алдаа татахад алдаа гарлаа', 500);
  }
};

// Get single error by ID
const getErrorById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT 
        uuid as id, keyword, description, solution,
        category_uuid as "categoryId", subcategory_uuid as "subCategoryId",
        department, status, images,
        created_at as "createdAt", updated_at as "updatedAt"
      FROM it_errors 
      WHERE uuid = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return sendError(res, null, 'Алдаа олдсонгүй', 404);
    }
    
    sendSuccess(res, result.rows[0]);
  } catch (error) {
    sendError(res, error, 'Алдаа татахад алдаа гарлаа', 500);
  }
};

// Create new error
const createError = async (req, res) => {
  try {
    const {
      keyword,
      description,
      solution,
      categoryId,
      subCategoryId,
      department,
      status,
      images
    } = req.body;
    
    // Validation
    if (!keyword || !description || !categoryId || !department) {
      return sendError(res, null, 'Түлхүүр үг, тайлбар, ангилал, хэлтэс заавал оруулах шаардлагатай', 400);
    }
    
    const result = await pool.query(
      `INSERT INTO it_errors (
        keyword, description, solution, 
        category_uuid, subcategory_uuid, 
        department, status, images,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING 
        uuid as id, keyword, description, solution,
        category_uuid as "categoryId", subcategory_uuid as "subCategoryId",
        department, status, images,
        created_at as "createdAt", updated_at as "updatedAt"`,
      [
        keyword, description, solution || null,
        categoryId, subCategoryId || null,
        department, status || 'active', images || []
      ]
    );
    
    sendSuccess(res, result.rows[0], 'Алдаа амжилттай бүртгэгдлээ', 201);
  } catch (error) {
    sendError(res, error, 'Алдаа нэмэхэд алдаа гарлаа', 500);
  }
};

// Update error
const updateError = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      keyword,
      description,
      solution,
      categoryId,
      subCategoryId,
      department,
      status,
      images
    } = req.body;
    
    // Build dynamic update query
    const updates = [];
    const params = [];
    let paramIndex = 1;
    
    if (keyword !== undefined) {
      updates.push(`keyword = $${paramIndex++}`);
      params.push(keyword);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      params.push(description);
    }
    if (solution !== undefined) {
      updates.push(`solution = $${paramIndex++}`);
      params.push(solution || null);
    }
    if (categoryId !== undefined) {
      updates.push(`category_uuid = $${paramIndex++}`);
      params.push(categoryId);
    }
    if (subCategoryId !== undefined) {
      updates.push(`subcategory_uuid = $${paramIndex++}`);
      params.push(subCategoryId || null);
    }
    if (department !== undefined) {
      updates.push(`department = $${paramIndex++}`);
      params.push(department);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      params.push(status);
    }
    if (images !== undefined) {
      updates.push(`images = $${paramIndex++}`);
      params.push(images || []);
    }
    
    updates.push(`updated_at = NOW()`);
    params.push(id);
    
    const query = `
      UPDATE it_errors 
      SET ${updates.join(', ')}
      WHERE uuid = $${paramIndex}
      RETURNING 
        uuid as id, keyword, description, solution,
        category_uuid as "categoryId", subcategory_uuid as "subCategoryId",
        department, status, images,
        created_at as "createdAt", updated_at as "updatedAt"
    `;
    
    const result = await pool.query(query, params);
    
    if (result.rows.length === 0) {
      return sendError(res, null, 'Алдаа олдсонгүй', 404);
    }
    
    sendSuccess(res, result.rows[0], 'Алдаа амжилттай засварлагдлаа');
  } catch (error) {
    sendError(res, error, 'Алдаа засварлахад алдаа гарлаа', 500);
  }
};

// Delete error
const deleteError = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM it_errors WHERE uuid = $1 RETURNING uuid',
      [id]
    );
    
    if (result.rows.length === 0) {
      return sendError(res, null, 'Алдаа олдсонгүй', 404);
    }
    
    sendSuccess(res, { id }, 'Алдаа амжилттай устгагдлаа');
  } catch (error) {
    sendError(res, error, 'Алдаа устгахад алдаа гарлаа', 500);
  }
};

// Toggle error status
const toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `UPDATE it_errors 
      SET status = CASE 
        WHEN status = 'active' THEN 'inactive' 
        ELSE 'active' 
      END,
      updated_at = NOW()
      WHERE uuid = $1
      RETURNING uuid as id, status`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return sendError(res, null, 'Алдаа олдсонгүй', 404);
    }
    
    sendSuccess(res, result.rows[0], 'Төлөв амжилттай өөрчлөгдлөө');
  } catch (error) {
    sendError(res, error, 'Төлөв өөрчлөхөд алдаа гарлаа', 500);
  }
};

module.exports = {
  getAllErrors,
  getErrorById,
  createError,
  updateError,
  deleteError,
  toggleStatus
};