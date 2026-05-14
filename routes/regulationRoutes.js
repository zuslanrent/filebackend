const express = require("express");
const {
  getRegulations,
  getRegulationById,
  createRegulation,
  updateRegulation,
  deleteRegulation,
} = require("../controllers/regulationController");
const { upload } = require("../config/cloudinary");
const { pool } = require("../config/db"); // ← pool-ийг импортлох

const router = express.Router();

// Public routes (токен шаардлагагүй - бүгдэд нээлттэй)
router.get("/", getRegulations);
router.get("/:uuid", getRegulationById);
router.post("/", createRegulation);
router.put("/:uuid", updateRegulation); // ← authMiddleware-ийг хассан
router.delete("/:uuid", deleteRegulation); // ← authMiddleware-ийг хассан

// /routes/regulationRoutes.js - upload endpoint
// /routes/regulationRoutes.js - upload endpoint
router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Файл байхгүй байна." });
    }

    // Metadata-г req.body-оос авах
    const {
      name,
      group_name,
      division_name,
      description,
      approved_date,
      uploaded_by,
      uploaded_by_name,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO regulations 
        (file_name, file_url, file_size, status, group_name, division_name, 
         description, approved_date, uploaded_by, uploaded_by_name, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
       RETURNING 
        uuid as id, 
        file_name as name, 
        file_url as "fileUrl", 
        file_size as "fileSize",
        group_name as category,
        division_name as department,
        status`,
      [
        name || req.file.originalname,
        req.file.path,
        req.file.size,
        "active",
        group_name || null,
        division_name || null,
        description || null,
        approved_date || null,
        uploaded_by || null,
        uploaded_by_name || null,
      ],
    );

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

// Error handler
router.use((err, req, res, next) => {
  console.error("Multer/Cloudinary error:", err);
  return res
    .status(500)
    .json({ success: false, message: err.message || "Upload failed" });
});

module.exports = router;
